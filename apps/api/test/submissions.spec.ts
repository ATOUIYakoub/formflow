import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  createTestApp,
  registerAndLogin,
  createForm,
  publishForm,
  saveFields,
  submitPublicForm,
  cleanupTestData,
} from './utils';

describe('Submissions', () => {
  let app: INestApplication;
  let userToken: string;

  beforeAll(async () => {
    app = await createTestApp();
    const auth = await registerAndLogin(
      app,
      `submissions-${Date.now()}@example.com`,
    );
    userToken = auth.accessToken;
  });

  afterAll(async () => {
    await cleanupTestData();
    await app.close();
  });

  describe('POST /api/public/forms/:slug/submissions', () => {
    it('should submit to published form', async () => {
      const form = await createForm(app, userToken, { name: 'Public Form' });

      // Fields must exist before publishing: publish freezes them into the
      // version snapshot, and only snapshot fields accept answers.
      await saveFields(app, userToken, form.id, [
        { id: 'email', type: 'EMAIL', label: 'Email', required: true, position: 0 },
        { id: 'name', type: 'TEXT', label: 'Name', required: false, position: 1 },
      ]);

      const published = await publishForm(app, userToken, form.id);

      const res = await request(app.getHttpServer())
        .post(`/api/public/forms/${published.slug}/submissions`)
        .send({
          answers: [
            { fieldId: 'email', value: 'test@example.com' },
            { fieldId: 'name', value: 'John' },
          ],
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      expect(res.body.version).toBeDefined();
    });

    it('should reject submission to unpublished form', async () => {
      const form = await createForm(app, userToken, { name: 'Draft Form' });

      await saveFields(app, userToken, form.id, [
        { id: 'email', type: 'EMAIL', label: 'Email', required: true, position: 0 },
      ]);

      // Publish to obtain a slug, then unpublish: the slug stays but the form
      // is back to DRAFT, which is the case the public endpoint must reject.
      const published = await publishForm(app, userToken, form.id);
      await request(app.getHttpServer())
        .post(`/api/forms/${form.id}/unpublish`)
        .set('Cookie', `jwt=${userToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .post(`/api/public/forms/${published.slug}/submissions`)
        .send({ answers: [{ fieldId: 'email', value: 'test@example.com' }] })
        .expect(404);
    });

    it('should silently drop answers for fields not in the snapshot', async () => {
      const form = await createForm(app, userToken, { name: 'Bad Fields' });

      await saveFields(app, userToken, form.id, [
        { id: 'email', type: 'EMAIL', label: 'Email', required: true, position: 0 },
      ]);

      const published = await publishForm(app, userToken, form.id);

      const res = await request(app.getHttpServer())
        .post(`/api/public/forms/${published.slug}/submissions`)
        .send({ answers: [{ fieldId: 'fake-field', value: 'hack' }] })
        .expect(201);

      expect(res.body.id).toBeDefined();

      const stored = await request(app.getHttpServer())
        .get(`/api/forms/${form.id}/submissions/${res.body.id}`)
        .set('Cookie', `jwt=${userToken}`)
        .expect(200);

      expect(stored.body.answers).toHaveLength(0);
    });

    it('should 404 for non-existent slug', async () => {
      await request(app.getHttpServer())
        .post('/api/public/forms/invalid-slug/submissions')
        .send({ answers: [] })
        .expect(404);
    });
  });

  describe('GET /api/forms/:formId/submissions', () => {
    let formId: string;

    beforeAll(async () => {
      const form = await createForm(app, userToken, { name: 'Sub List Form' });
      formId = form.id;

      await saveFields(app, userToken, formId, [
        { id: 'email', type: 'EMAIL', label: 'Email', required: true, position: 0 },
        { id: 'name', type: 'TEXT', label: 'Name', required: false, position: 1 },
      ]);

      const published = await publishForm(app, userToken, formId);
      const slug = published.slug!;

      await submitPublicForm(app, slug, [
        { fieldId: 'email', value: 'a@test.com' },
        { fieldId: 'name', value: 'Alice' },
      ]);
      await submitPublicForm(app, slug, [
        { fieldId: 'email', value: 'b@test.com' },
        { fieldId: 'name', value: 'Bob' },
      ]);
    });

    it('should list submissions with pagination', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/forms/${formId}/submissions`)
        .set('Cookie', `jwt=${userToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(res.body.items).toHaveLength(2);
      expect(res.body.total).toBe(2);
      expect(res.body.page).toBe(1);
      expect(res.body.columns).toHaveLength(2);
    });

    it('should filter by search', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/forms/${formId}/submissions`)
        .set('Cookie', `jwt=${userToken}`)
        .query({ search: 'Alice', limit: 10 })
        .expect(200);

      expect(res.body.items).toHaveLength(1);
      expect(
        res.body.items[0].answers.find((a: any) => a.value === 'Alice'),
      ).toBeDefined();
    });

    it('should filter by date range', async () => {
      const today = new Date().toISOString().split('T')[0];
      const res = await request(app.getHttpServer())
        .get(`/api/forms/${formId}/submissions`)
        .set('Cookie', `jwt=${userToken}`)
        .query({ from: today, to: today, limit: 10 })
        .expect(200);

      expect(res.body.items.length).toBeGreaterThanOrEqual(1);
    });

    it('should 403 for other user form', async () => {
      const otherAuth = await registerAndLogin(
        app,
        `other-${Date.now()}@example.com`,
      );
      const otherForm = await createForm(app, otherAuth.accessToken, {
        name: 'Other',
      });

      await request(app.getHttpServer())
        .get(`/api/forms/${otherForm.id}/submissions`)
        .set('Cookie', `jwt=${userToken}`)
        .expect(403);
    });
  });

  describe('GET /api/forms/:formId/submissions/:submissionId', () => {
    it('should get single submission', async () => {
      const form = await createForm(app, userToken, { name: 'Single Sub' });

      await saveFields(app, userToken, form.id, [
        { id: 'field', type: 'TEXT', label: 'Field', required: true, position: 0 },
      ]);

      const published = await publishForm(app, userToken, form.id);
      const subRes = await submitPublicForm(app, published.slug!, [
        { fieldId: 'field', value: 'test-value' },
      ]);

      const res = await request(app.getHttpServer())
        .get(`/api/forms/${form.id}/submissions/${subRes.body.id}`)
        .set('Cookie', `jwt=${userToken}`)
        .expect(200);

      expect(res.body.id).toBe(subRes.body.id);
      expect(res.body.answers[0].value).toBe('test-value');
      expect(res.body.answers[0].label).toBe('Field');
    });
  });

  describe('DELETE /api/forms/:formId/submissions/:submissionId', () => {
    it('should delete submission', async () => {
      const form = await createForm(app, userToken, { name: 'Delete Sub' });

      await saveFields(app, userToken, form.id, [
        { id: 'field', type: 'TEXT', label: 'Field', required: true, position: 0 },
      ]);

      const published = await publishForm(app, userToken, form.id);
      const subRes = await submitPublicForm(app, published.slug!, [
        { fieldId: 'field', value: 'to-delete' },
      ]);

      await request(app.getHttpServer())
        .delete(`/api/forms/${form.id}/submissions/${subRes.body.id}`)
        .set('Cookie', `jwt=${userToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/api/forms/${form.id}/submissions/${subRes.body.id}`)
        .set('Cookie', `jwt=${userToken}`)
        .expect(404);
    });
  });
});

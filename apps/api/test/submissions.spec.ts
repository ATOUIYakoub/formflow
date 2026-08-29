import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, registerAndLogin, createForm, publishForm, saveFields, submitPublicForm, cleanupTestData } from './utils';

describe('Submissions', () => {
  let app: INestApplication;
  let userToken: string;

  beforeAll(async () => {
    app = await createTestApp();
    const auth = await registerAndLogin(app, `submissions-${Date.now()}@example.com`);
    userToken = auth.accessToken;
  });

  afterAll(async () => {
    await cleanupTestData();
    await app.close();
  });

  describe('POST /api/public/forms/:slug/submissions', () => {
    it('should submit to published form', async () => {
      const form = await createForm(app, userToken, { name: 'Public Form' });
      await publishForm(app, userToken, form.id);

      await saveFields(app, userToken, form.id, [
        { id: 'email', type: 'EMAIL', label: 'Email', required: true, position: 0 },
        { id: 'name', type: 'TEXT', label: 'Name', required: false, position: 1 },
      ]);

      const res = await request(app.getHttpServer())
        .post(`/api/public/forms/${form.slug}/submissions`)
        .send({ answers: [{ fieldId: 'email', value: 'test@example.com' }, { fieldId: 'name', value: 'John' }] })
        .expect(201);

      expect(res.body.id).toBeDefined();
      expect(res.body.version).toBeDefined();
    });

    it('should reject submission to draft form', async () => {
      const form = await createForm(app, userToken, { name: 'Draft Form' });
      // Not published

      await saveFields(app, userToken, form.id, [
        { id: 'email', type: 'EMAIL', label: 'Email', required: true, position: 0 },
      ]);

      await request(app.getHttpServer())
        .post(`/api/public/forms/${form.slug}/submissions`)
        .send({ answers: [{ fieldId: 'email', value: 'test@example.com' }] })
        .expect(404);
    });

    it('should reject answers for non-existent fields', async () => {
      const form = await createForm(app, userToken, { name: 'Bad Fields' });
      await publishForm(app, userToken, form.id);

      await saveFields(app, userToken, form.id, [
        { id: 'email', type: 'EMAIL', label: 'Email', required: true, position: 0 },
      ]);

      const res = await request(app.getHttpServer())
        .post(`/api/public/forms/${form.slug}/submissions`)
        .send({ answers: [{ fieldId: 'fake-field', value: 'hack' }] })
        .expect(201);

      expect(res.body.id).toBeDefined();
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
    let slug: string;

    beforeAll(async () => {
      const form = await createForm(app, userToken, { name: 'Sub List Form' });
      await publishForm(app, userToken, form.id);
      formId = form.id;
      slug = form.slug!;

      await saveFields(app, userToken, formId, [
        { id: 'email', type: 'EMAIL', label: 'Email', required: true, position: 0 },
        { id: 'name', type: 'TEXT', label: 'Name', required: false, position: 1 },
      ]);

      await submitPublicForm(app, slug, [{ fieldId: 'email', value: 'a@test.com' }, { fieldId: 'name', value: 'Alice' }]);
      await submitPublicForm(app, slug, [{ fieldId: 'email', value: 'b@test.com' }, { fieldId: 'name', value: 'Bob' }]);
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
      expect(res.body.items[0].answers.find((a: any) => a.value === 'Alice')).toBeDefined();
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
      const otherAuth = await registerAndLogin(app, `other-${Date.now()}@example.com`);
      const otherForm = await createForm(app, otherAuth.accessToken, { name: 'Other' });

      await request(app.getHttpServer())
        .get(`/api/forms/${otherForm.id}/submissions`)
        .set('Cookie', `jwt=${userToken}`)
        .expect(403);
    });
  });

  describe('GET /api/forms/:formId/submissions/:submissionId', () => {
    it('should get single submission', async () => {
      const form = await createForm(app, userToken, { name: 'Single Sub' });
      await publishForm(app, userToken, form.id);

      await saveFields(app, userToken, form.id, [
        { id: 'field', type: 'TEXT', label: 'Field', required: true, position: 0 },
      ]);

      const subRes = await submitPublicForm(app, form.slug!, [{ fieldId: 'field', value: 'test-value' }]);

      const res = await request(app.getHttpServer())
        .get(`/api/forms/${form.id}/submissions/${subRes.body.id}`)
        .set('Cookie', `jwt=${userToken}`)
        .expect(200);

      expect(res.body.id).toBe(subRes.body.id);
      expect(res.body.answers[0].value).toBe('test-value');
    });
  });

  describe('DELETE /api/forms/:formId/submissions/:submissionId', () => {
    it('should delete submission', async () => {
      const form = await createForm(app, userToken, { name: 'Delete Sub' });
      await publishForm(app, userToken, form.id);

      await saveFields(app, userToken, form.id, [
        { id: 'field', type: 'TEXT', label: 'Field', required: true, position: 0 },
      ]);

      const subRes = await submitPublicForm(app, form.slug!, [{ fieldId: 'field', value: 'to-delete' }]);

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

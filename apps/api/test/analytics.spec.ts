import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, registerAndLogin, createForm, publishForm, saveFields, submitPublicForm, cleanupTestData } from './utils';

describe('Analytics', () => {
  let app: INestApplication;
  let userToken: string;

  beforeAll(async () => {
    app = await createTestApp();
    const auth = await registerAndLogin(app, `analytics-${Date.now()}@example.com`);
    userToken = auth.accessToken;
  });

  afterAll(async () => {
    await cleanupTestData();
    await app.close();
  });

  describe('GET /api/forms/:id/analytics/overview', () => {
    it('should return overview with zero counts for new form', async () => {
      const form = await createForm(app, userToken, { name: 'New Analytics' });
      await publishForm(app, userToken, form.id);

      const res = await request(app.getHttpServer())
        .get(`/api/forms/${form.id}/analytics/overview`)
        .set('Cookie', `jwt=${userToken}`)
        .expect(200);

      expect(res.body.views).toBe(0);
      expect(res.body.starts).toBe(0);
      expect(res.body.completions).toBe(0);
      expect(res.body.completionRate).toBe(0);
    });

    it('should track views and starts', async () => {
      const form = await createForm(app, userToken, { name: 'Track Form' });
      await publishForm(app, userToken, form.id);

      await request(app.getHttpServer())
        .get(`/api/public/forms/${form.slug}`)
        .expect(200);

      await request(app.getHttpServer())
        .post(`/api/public/forms/${form.slug}/start`)
        .expect(200);

      const res = await request(app.getHttpServer())
        .get(`/api/forms/${form.id}/analytics/overview`)
        .set('Cookie', `jwt=${userToken}`)
        .expect(200);

      expect(res.body.views).toBeGreaterThanOrEqual(1);
      expect(res.body.starts).toBeGreaterThanOrEqual(1);
    });

    it('should filter by date range', async () => {
      const form = await createForm(app, userToken, { name: 'Date Filter' });
      await publishForm(app, userToken, form.id);

      const today = new Date().toISOString().split('T')[0];
      const res = await request(app.getHttpServer())
        .get(`/api/forms/${form.id}/analytics/overview`)
        .set('Cookie', `jwt=${userToken}`)
        .query({ from: today, to: today })
        .expect(200);

      expect(res.body).toHaveProperty('views');
      expect(res.body).toHaveProperty('starts');
    });

    it('should 403 for other user form', async () => {
      const otherAuth = await registerAndLogin(app, `other-${Date.now()}@example.com`);
      const otherForm = await createForm(app, otherAuth.accessToken, { name: 'Other' });

      await request(app.getHttpServer())
        .get(`/api/forms/${otherForm.id}/analytics/overview`)
        .set('Cookie', `jwt=${userToken}`)
        .expect(403);
    });
  });

  describe('GET /api/forms/:id/analytics/submissions-per-day', () => {
    it('should return submissions per day', async () => {
      const form = await createForm(app, userToken, { name: 'Subs Per Day' });
      await publishForm(app, userToken, form.id);

      await saveFields(app, userToken, form.id, [
        { id: 'f1', type: 'TEXT', label: 'Field', required: true, position: 0 },
      ]);

      await submitPublicForm(app, form.slug!, [{ fieldId: 'f1', value: 'test' }]);

      const res = await request(app.getHttpServer())
        .get(`/api/forms/${form.id}/analytics/submissions-per-day`)
        .set('Cookie', `jwt=${userToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      if (res.body.length > 0) {
        expect(res.body[0]).toHaveProperty('date');
        expect(res.body[0]).toHaveProperty('count');
      }
    });
  });

  describe('GET /api/forms/:id/analytics/views-per-day', () => {
    it('should return views per day', async () => {
      const form = await createForm(app, userToken, { name: 'Views Per Day' });
      await publishForm(app, userToken, form.id);

      await request(app.getHttpServer())
        .get(`/api/public/forms/${form.slug}`)
        .expect(200);

      const res = await request(app.getHttpServer())
        .get(`/api/forms/${form.id}/analytics/views-per-day`)
        .set('Cookie', `jwt=${userToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /api/forms/:id/analytics/starts-per-day', () => {
    it('should return starts per day', async () => {
      const form = await createForm(app, userToken, { name: 'Starts Per Day' });
      await publishForm(app, userToken, form.id);

      await request(app.getHttpServer())
        .post(`/api/public/forms/${form.slug}/start`)
        .expect(200);

      const res = await request(app.getHttpServer())
        .get(`/api/forms/${form.id}/analytics/starts-per-day`)
        .set('Cookie', `jwt=${userToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });
  });
});

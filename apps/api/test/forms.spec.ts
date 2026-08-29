import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, registerAndLogin, createForm, cleanupTestData, extractUserIdFromToken } from './utils';

describe('Forms', () => {
  let app: INestApplication;
  let userToken: string;
  let userId: string;

  beforeAll(async () => {
    app = await createTestApp();
    const auth = await registerAndLogin(app, `forms-${Date.now()}@example.com`);
    userToken = auth.accessToken;
    userId = extractUserIdFromToken(userToken);
  });

  afterAll(async () => {
    await cleanupTestData();
    await app.close();
  });

  describe('POST /api/forms', () => {
    it('should create a form', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/forms')
        .set('Cookie', `jwt=${userToken}`)
        .send({ name: 'Test Form', description: 'Description' })
        .expect(201);

      expect(res.body.id).toBeDefined();
      expect(res.body.name).toBe('Test Form');
      expect(res.body.workspaceId).toBeDefined();
    });

    it('should require name', async () => {
      await request(app.getHttpServer())
        .post('/api/forms')
        .set('Cookie', `jwt=${userToken}`)
        .send({ description: 'No name' })
        .expect(400);
    });
  });

  describe('GET /api/forms', () => {
    it('should list user forms', async () => {
      await createForm(app, userToken, { name: 'Form 1' });
      await createForm(app, userToken, { name: 'Form 2' });

      const res = await request(app.getHttpServer())
        .get('/api/forms')
        .set('Cookie', `jwt=${userToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });

    it('should not show other users forms', async () => {
      const otherAuth = await registerAndLogin(app, `other-${Date.now()}@example.com`);
      await createForm(app, otherAuth.accessToken, { name: 'Other User Form' });

      const res = await request(app.getHttpServer())
        .get('/api/forms')
        .set('Cookie', `jwt=${userToken}`)
        .expect(200);

      const otherForm = res.body.find((f: any) => f.name === 'Other User Form');
      expect(otherForm).toBeUndefined();
    });
  });

  describe('GET /api/forms/:id', () => {
    it('should get form by id', async () => {
      const form = await createForm(app, userToken, { name: 'Get Form' });

      const res = await request(app.getHttpServer())
        .get(`/api/forms/${form.id}`)
        .set('Cookie', `jwt=${userToken}`)
        .expect(200);

      expect(res.body.id).toBe(form.id);
      expect(res.body.name).toBe('Get Form');
    });

    it('should 404 for non-existent form', async () => {
      await request(app.getHttpServer())
        .get('/api/forms/00000000-0000-0000-0000-000000000000')
        .set('Cookie', `jwt=${userToken}`)
        .expect(404);
    });

    it('should 403 for other user form', async () => {
      const otherAuth = await registerAndLogin(app, `other2-${Date.now()}@example.com`);
      const otherForm = await createForm(app, otherAuth.accessToken, { name: 'Private' });

      await request(app.getHttpServer())
        .get(`/api/forms/${otherForm.id}`)
        .set('Cookie', `jwt=${userToken}`)
        .expect(403);
    });
  });

  describe('PATCH /api/forms/:id', () => {
    it('should update form', async () => {
      const form = await createForm(app, userToken, { name: 'Original' });

      const res = await request(app.getHttpServer())
        .patch(`/api/forms/${form.id}`)
        .set('Cookie', `jwt=${userToken}`)
        .send({ name: 'Updated', description: 'New desc' })
        .expect(200);

      expect(res.body.name).toBe('Updated');
      expect(res.body.description).toBe('New desc');
    });

    it('should 403 for other user form', async () => {
      const otherAuth = await registerAndLogin(app, `other3-${Date.now()}@example.com`);
      const otherForm = await createForm(app, otherAuth.accessToken, { name: 'Private' });

      await request(app.getHttpServer())
        .patch(`/api/forms/${otherForm.id}`)
        .set('Cookie', `jwt=${userToken}`)
        .send({ name: 'Hacked' })
        .expect(403);
    });
  });

  describe('DELETE /api/forms/:id', () => {
    it('should delete own form', async () => {
      const form = await createForm(app, userToken, { name: 'To Delete' });

      await request(app.getHttpServer())
        .delete(`/api/forms/${form.id}`)
        .set('Cookie', `jwt=${userToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/api/forms/${form.id}`)
        .set('Cookie', `jwt=${userToken}`)
        .expect(404);
    });

    it('should 403 for other user form', async () => {
      const otherAuth = await registerAndLogin(app, `other4-${Date.now()}@example.com`);
      const otherForm = await createForm(app, otherAuth.accessToken, { name: 'Private' });

      await request(app.getHttpServer())
        .delete(`/api/forms/${otherForm.id}`)
        .set('Cookie', `jwt=${userToken}`)
        .expect(403);
    });
  });

  describe('POST /api/forms/:id/publish', () => {
    it('should publish form and generate slug', async () => {
      const form = await createForm(app, userToken, { name: 'Publish Me' });

      const res = await request(app.getHttpServer())
        .post(`/api/forms/${form.id}/publish`)
        .set('Cookie', `jwt=${userToken}`)
        .expect(200);

      expect(res.body.status).toBe('PUBLISHED');
      expect(res.body.slug).toBeDefined();
      expect(res.body.publishedAt).toBeDefined();
    });

    it('should 403 for other user form', async () => {
      const otherAuth = await registerAndLogin(app, `other5-${Date.now()}@example.com`);
      const otherForm = await createForm(app, otherAuth.accessToken, { name: 'Private' });

      await request(app.getHttpServer())
        .post(`/api/forms/${otherForm.id}/publish`)
        .set('Cookie', `jwt=${userToken}`)
        .expect(403);
    });
  });
});

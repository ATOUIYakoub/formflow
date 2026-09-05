import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  createTestApp,
  registerAndLogin,
  createForm,
  cleanupTestData,
} from './utils';

describe('Fields', () => {
  let app: INestApplication;
  let userToken: string;

  beforeAll(async () => {
    app = await createTestApp();
    const auth = await registerAndLogin(app, `fields-${Date.now()}@example.com`);
    userToken = auth.accessToken;
  });

  afterAll(async () => {
    await cleanupTestData();
    await app.close();
  });

  describe('POST /api/forms/:id/fields', () => {
    it('should save text field', async () => {
      const form = await createForm(app, userToken, { name: 'Field Form' });

      const fields = [
        { id: 'field-1', type: 'TEXT', label: 'Name', required: true, position: 0 },
      ];

      const res = await request(app.getHttpServer())
        .post(`/api/forms/${form.id}/fields`)
        .set('Cookie', `jwt=${userToken}`)
        .send({ fields })
        .expect(200);

      expect(res.body.fields).toHaveLength(1);
      expect(res.body.fields[0].label).toBe('Name');
      expect(res.body.fields[0].type).toBe('TEXT');
      expect(res.body.fields[0].required).toBe(true);
    });

    it('should save select field with options', async () => {
      const form = await createForm(app, userToken, { name: 'Select Form' });

      const fields = [
        { id: 'field-2', type: 'SELECT', label: 'Country', required: true, position: 0, options: ['USA', 'Canada', 'Mexico'] },
      ];

      const res = await request(app.getHttpServer())
        .post(`/api/forms/${form.id}/fields`)
        .set('Cookie', `jwt=${userToken}`)
        .send({ fields })
        .expect(200);

      expect(res.body.fields[0].type).toBe('SELECT');
      expect(res.body.fields[0].options).toEqual(['USA', 'Canada', 'Mexico']);
    });

    it('should reorder fields by position', async () => {
      const form = await createForm(app, userToken, { name: 'Order Form' });

      const fields = [
        { id: 'field-a', type: 'TEXT', label: 'First', position: 1 },
        { id: 'field-b', type: 'TEXT', label: 'Second', position: 0 },
      ];

      const res = await request(app.getHttpServer())
        .post(`/api/forms/${form.id}/fields`)
        .set('Cookie', `jwt=${userToken}`)
        .send({ fields })
        .expect(200);

      expect(res.body.fields[0].label).toBe('Second');
      expect(res.body.fields[1].label).toBe('First');
    });

    it('should delete removed fields', async () => {
      const form = await createForm(app, userToken, { name: 'Delete Fields' });

      await request(app.getHttpServer())
        .post(`/api/forms/${form.id}/fields`)
        .set('Cookie', `jwt=${userToken}`)
        .send({ fields: [{ id: 'f1', type: 'TEXT', label: 'One', position: 0 }] })
        .expect(200);

      const res = await request(app.getHttpServer())
        .post(`/api/forms/${form.id}/fields`)
        .set('Cookie', `jwt=${userToken}`)
        .send({ fields: [] })
        .expect(200);

      expect(res.body.fields).toHaveLength(0);
    });

    it('should 403 for other user form', async () => {
      const otherAuth = await registerAndLogin(app, `other-${Date.now()}@example.com`);
      const otherForm = await createForm(app, otherAuth.accessToken, { name: 'Other' });

      await request(app.getHttpServer())
        .post(`/api/forms/${otherForm.id}/fields`)
        .set('Cookie', `jwt=${userToken}`)
        .send({ fields: [{ id: 'f', type: 'TEXT', label: 'Hack', position: 0 }] })
        .expect(403);
    });

    it('should reject invalid field type', async () => {
      const form = await createForm(app, userToken, { name: 'Invalid' });

      await request(app.getHttpServer())
        .post(`/api/forms/${form.id}/fields`)
        .set('Cookie', `jwt=${userToken}`)
        .send({ fields: [{ id: 'f', type: 'INVALID', label: 'Bad', position: 0 }] })
        .expect(400);
    });
  });
});

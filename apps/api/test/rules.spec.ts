import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  createTestApp,
  registerAndLogin,
  createForm,
  saveFields,
  saveRules,
  cleanupTestData,
} from './utils';

describe('Conditional Logic (Rules)', () => {
  let app: INestApplication;
  let userToken: string;

  beforeAll(async () => {
    app = await createTestApp();
    const auth = await registerAndLogin(app, `rules-${Date.now()}@example.com`);
    userToken = auth.accessToken;
  });

  afterAll(async () => {
    await cleanupTestData();
    await app.close();
  });

  describe('POST /api/forms/:id/rules', () => {
    it('should create show rule', async () => {
      const form = await createForm(app, userToken, { name: 'Rule Form' });

      await saveFields(app, userToken, form.id, [
        { id: 'source', type: 'RADIO', label: 'Show extra?', required: true, position: 0, options: ['Yes', 'No'] },
        { id: 'target', type: 'TEXT', label: 'Extra field', required: false, position: 1 },
      ]);

      const rules = [
        {
          sourceFieldId: 'source',
          operator: 'EQUALS',
          value: 'Yes',
          action: 'SHOW',
          targetFieldId: 'target',
        },
      ];

      const res = await request(app.getHttpServer())
        .post(`/api/forms/${form.id}/rules`)
        .set('Cookie', `jwt=${userToken}`)
        .send({ rules })
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].action).toBe('SHOW');
      expect(res.body[0].operator).toBe('EQUALS');
    });

    it('should create hide rule', async () => {
      const form = await createForm(app, userToken, { name: 'Hide Rule' });

      await saveFields(app, userToken, form.id, [
        { id: 'check', type: 'CHECKBOX', label: 'Hide next?', required: false, position: 0, options: ['Hide'] },
        { id: 'target', type: 'TEXT', label: 'Hidden field', required: false, position: 1 },
      ]);

      const rules = [
        {
          sourceFieldId: 'check',
          operator: 'CONTAINS',
          value: 'Hide',
          action: 'HIDE',
          targetFieldId: 'target',
        },
      ];

      const res = await request(app.getHttpServer())
        .post(`/api/forms/${form.id}/rules`)
        .set('Cookie', `jwt=${userToken}`)
        .send({ rules })
        .expect(200);

      expect(res.body[0].action).toBe('HIDE');
    });

    it('should reject self-referencing rule', async () => {
      const form = await createForm(app, userToken, { name: 'Self Ref' });

      await saveFields(app, userToken, form.id, [
        { id: 'field', type: 'TEXT', label: 'Field', required: false, position: 0 },
      ]);

      await request(app.getHttpServer())
        .post(`/api/forms/${form.id}/rules`)
        .set('Cookie', `jwt=${userToken}`)
        .send({
          rules: [{
            sourceFieldId: 'field',
            operator: 'EQUALS',
            value: 'x',
            action: 'SHOW',
            targetFieldId: 'field',
          }],
        })
        .expect(400);
    });

    it('should reject rule with non-existent field', async () => {
      const form = await createForm(app, userToken, { name: 'Bad Field' });

      await request(app.getHttpServer())
        .post(`/api/forms/${form.id}/rules`)
        .set('Cookie', `jwt=${userToken}`)
        .send({
          rules: [{
            sourceFieldId: 'nonexistent',
            operator: 'EQUALS',
            value: 'x',
            action: 'SHOW',
            targetFieldId: 'also-bad',
          }],
        })
        .expect(400);
    });

    it('should replace all rules on save', async () => {
      const form = await createForm(app, userToken, { name: 'Replace Rules' });

      await saveFields(app, userToken, form.id, [
        { id: 's1', type: 'TEXT', label: 'Source 1', required: false, position: 0 },
        { id: 't1', type: 'TEXT', label: 'Target 1', required: false, position: 1 },
      ]);

      await saveRules(app, userToken, form.id, [
        { sourceFieldId: 's1', operator: 'EQUALS', value: 'a', action: 'SHOW', targetFieldId: 't1' },
      ]);

      await saveRules(app, userToken, form.id, [
        { sourceFieldId: 's1', operator: 'EQUALS', value: 'b', action: 'HIDE', targetFieldId: 't1' },
      ]);

      const res = await request(app.getHttpServer())
        .get(`/api/forms/${form.id}`)
        .set('Cookie', `jwt=${userToken}`)
        .expect(200);

      expect(res.body.rules).toHaveLength(1);
      expect(res.body.rules[0].value).toBe('b');
      expect(res.body.rules[0].action).toBe('HIDE');
    });

    it('should 403 for other user form', async () => {
      const otherAuth = await registerAndLogin(app, `other-${Date.now()}@example.com`);
      const otherForm = await createForm(app, otherAuth.accessToken, { name: 'Other' });

      await request(app.getHttpServer())
        .post(`/api/forms/${otherForm.id}/rules`)
        .set('Cookie', `jwt=${userToken}`)
        .send({ rules: [] })
        .expect(403);
    });
  });
});

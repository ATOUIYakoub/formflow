import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, registerAndLogin, createForm, saveFields, saveRules, publishForm, submitPublicForm, cleanupTestData } from './utils';

describe('Permissions / Workspace Isolation', () => {
  let app: INestApplication;
  let userAToken: string;
  let userBToken: string;

  beforeAll(async () => {
    app = await createTestApp();
    const authA = await registerAndLogin(app, `usera-${Date.now()}@example.com`);
    const authB = await registerAndLogin(app, `userb-${Date.now()}@example.com`);
    userAToken = authA.accessToken;
    userBToken = authB.accessToken;
  });

  afterAll(async () => {
    await cleanupTestData();
    await app.close();
  });

  it('User A cannot list User B forms', async () => {
    const formB = await createForm(app, userBToken, { name: 'User B Form' });

    const res = await request(app.getHttpServer())
      .get('/api/forms')
      .set('Cookie', `jwt=${userAToken}`)
      .expect(200);

    expect(res.body.find((f: any) => f.id === formB.id)).toBeUndefined();
  });

  it('User A cannot GET User B form', async () => {
    const formB = await createForm(app, userBToken, { name: 'Private Form' });

    await request(app.getHttpServer())
      .get(`/api/forms/${formB.id}`)
      .set('Cookie', `jwt=${userAToken}`)
      .expect(403);
  });

  it('User A cannot PATCH User B form', async () => {
    const formB = await createForm(app, userBToken, { name: 'Private Form' });

    await request(app.getHttpServer())
      .patch(`/api/forms/${formB.id}`)
      .set('Cookie', `jwt=${userAToken}`)
      .send({ name: 'Hacked' })
      .expect(403);
  });

  it('User A cannot DELETE User B form', async () => {
    const formB = await createForm(app, userBToken, { name: 'Private Form' });

    await request(app.getHttpServer())
      .delete(`/api/forms/${formB.id}`)
      .set('Cookie', `jwt=${userAToken}`)
      .expect(403);
  });

  it('User A cannot save fields on User B form', async () => {
    const formB = await createForm(app, userBToken, { name: 'Private Form' });

    await request(app.getHttpServer())
      .post(`/api/forms/${formB.id}/fields`)
      .set('Cookie', `jwt=${userAToken}`)
      .send({ fields: [{ id: 'f1', type: 'TEXT', label: 'Hack', position: 0 }] })
      .expect(403);
  });

  it('User A cannot save rules on User B form', async () => {
    const formB = await createForm(app, userBToken, { name: 'Private Form' });

    await request(app.getHttpServer())
      .post(`/api/forms/${formB.id}/rules`)
      .set('Cookie', `jwt=${userAToken}`)
      .send({ rules: [] })
      .expect(403);
  });

  it('User A cannot publish User B form', async () => {
    const formB = await createForm(app, userBToken, { name: 'Private Form' });

    await request(app.getHttpServer())
      .post(`/api/forms/${formB.id}/publish`)
      .set('Cookie', `jwt=${userAToken}`)
      .expect(403);
  });

  it('User A cannot unpublish User B form', async () => {
    const formB = await createForm(app, userBToken, { name: 'Private Form' });
    await publishForm(app, userBToken, formB.id);

    await request(app.getHttpServer())
      .post(`/api/forms/${formB.id}/unpublish`)
      .set('Cookie', `jwt=${userAToken}`)
      .expect(403);
  });

  it('User A cannot list User B submissions', async () => {
    const formB = await createForm(app, userBToken, { name: 'Sub Form' });
    await publishForm(app, userBToken, formB.id);

    await saveFields(app, userBToken, formB.id, [
      { id: 'f1', type: 'TEXT', label: 'Field', required: true, position: 0 },
    ]);

    await submitPublicForm(app, formB.slug!, [{ fieldId: 'f1', value: 'data' }]);

    await request(app.getHttpServer())
      .get(`/api/forms/${formB.id}/submissions`)
      .set('Cookie', `jwt=${userAToken}`)
      .expect(403);
  });

  it('User A cannot get User B single submission', async () => {
    const formB = await createForm(app, userBToken, { name: 'Sub Form 2' });
    await publishForm(app, userBToken, formB.id);

    await saveFields(app, userBToken, formB.id, [
      { id: 'f1', type: 'TEXT', label: 'Field', required: true, position: 0 },
    ]);

    const sub = await submitPublicForm(app, formB.slug!, [{ fieldId: 'f1', value: 'data' }]);

    await request(app.getHttpServer())
      .get(`/api/forms/${formB.id}/submissions/${sub.body.id}`)
      .set('Cookie', `jwt=${userAToken}`)
      .expect(403);
  });

  it('User A cannot delete User B submission', async () => {
    const formB = await createForm(app, userBToken, { name: 'Sub Form 3' });
    await publishForm(app, userBToken, formB.id);

    await saveFields(app, userBToken, formB.id, [
      { id: 'f1', type: 'TEXT', label: 'Field', required: true, position: 0 },
    ]);

    const sub = await submitPublicForm(app, formB.slug!, [{ fieldId: 'f1', value: 'data' }]);

    await request(app.getHttpServer())
      .delete(`/api/forms/${formB.id}/submissions/${sub.body.id}`)
      .set('Cookie', `jwt=${userAToken}`)
      .expect(403);
  });

  it('User A cannot view User B analytics', async () => {
    const formB = await createForm(app, userBToken, { name: 'Analytics Form' });

    await request(app.getHttpServer())
      .get(`/api/forms/${formB.id}/analytics/overview`)
      .set('Cookie', `jwt=${userAToken}`)
      .expect(403);
  });
});

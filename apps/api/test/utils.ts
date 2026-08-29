import * as request from 'supertest';

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:3002';

export interface TestUser {
  email: string;
  password: string;
  name: string;
  accessToken: string;
}

export interface TestForm {
  id: string;
  name: string;
  slug: string;
  workspaceId: string;
}

export async function registerAndLogin(email: string, password = 'Test1234', name = 'Test User'): Promise<TestUser> {
  const registerRes = await request(BASE_URL)
    .post('/api/auth/register')
    .send({ email, password, name })
    .expect(201);

  const loginRes = await request(BASE_URL)
    .post('/api/auth/login')
    .send({ email, password })
    .expect(200);

  const cookie = loginRes.headers['set-cookie'];
  const accessToken = cookie?.[0]?.split(';')[0]?.replace('jwt=', '') || '';

  return { email, password, name, accessToken };
}

export async function createForm(token: string, data: { name: string; description?: string }): Promise<TestForm> {
  const res = await request(BASE_URL)
    .post('/api/forms')
    .set('Cookie', `jwt=${token}`)
    .send(data)
    .expect(201);

  return res.body;
}

export async function publishForm(token: string, formId: string) {
  return request(BASE_URL)
    .post(`/api/forms/${formId}/publish`)
    .set('Cookie', `jwt=${token}`)
    .expect(200);
}

export async function saveFields(token: string, formId: string, fields: any[]) {
  return request(BASE_URL)
    .post(`/api/forms/${formId}/fields`)
    .set('Cookie', `jwt=${token}`)
    .send({ fields })
    .expect(200);
}

export async function saveRules(token: string, formId: string, rules: any[]) {
  return request(BASE_URL)
    .post(`/api/forms/${formId}/rules`)
    .set('Cookie', `jwt=${token}`)
    .send({ rules })
    .expect(200);
}

export async function submitPublicForm(slug: string, answers: { fieldId: string; value: any }[]) {
  return request(BASE_URL)
    .post(`/api/public/forms/${slug}/submissions`)
    .send({ answers })
    .expect(201);
}

export function extractUserIdFromToken(token: string): string {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    return payload.sub;
  } catch {
    return '';
  }
}
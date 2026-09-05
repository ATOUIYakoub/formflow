import * as request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ThrottlerStorage } from '@nestjs/throttler';
import * as cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

// Emails registered by this test file, so cleanup only removes its own data
// and suites running in parallel don't wipe each other's fixtures.
const createdEmails: string[] = [];

let prisma: PrismaClient | null = null;

function getPrisma(): PrismaClient {
  if (!prisma) prisma = new PrismaClient();
  return prisma;
}

export interface TestUser {
  email: string;
  password: string;
  name: string;
  accessToken: string;
}

export interface TestForm {
  id: string;
  name: string;
  slug: string | null;
  workspaceId: string;
}

/**
 * Boots the real AppModule in-process with the same global configuration as
 * `src/main.ts`, so tests exercise the actual prefix, pipes and filters.
 *
 * Rate limiting is neutralised by swapping ThrottlerStorage for a counter that
 * never advances: these suites register far more users than the production
 * 5/min limit allows. Overriding the guard itself does not work — AppModule
 * binds it via `{ provide: APP_GUARD, useClass: ThrottlerGuard }`, so the
 * instance never lives under a token the testing module can replace.
 */
export async function createTestApp(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(ThrottlerStorage)
    .useValue({
      increment: async () => ({
        totalHits: 1,
        timeToExpire: 60,
        isBlocked: false,
        timeToBlockExpire: 0,
      }),
    })
    .compile();

  const app = moduleRef.createNestApplication();

  app.setGlobalPrefix('api');
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.init();
  return app;
}

/** Deletes the users this test file created; cascades to workspaces/forms/submissions. */
export async function cleanupTestData(): Promise<void> {
  if (createdEmails.length === 0) return;
  await getPrisma().user.deleteMany({ where: { email: { in: createdEmails } } });
  createdEmails.length = 0;
  await getPrisma().$disconnect();
  prisma = null;
}

export async function registerAndLogin(
  app: INestApplication,
  email: string,
  password = 'Test1234',
  name = 'Test User',
): Promise<TestUser> {
  createdEmails.push(email);

  await request(app.getHttpServer())
    .post('/api/auth/register')
    .send({ email, password, name })
    .expect(201);

  const loginRes = await request(app.getHttpServer())
    .post('/api/auth/login')
    .send({ email, password })
    .expect(200);

  return { email, password, name, accessToken: readJwtCookie(loginRes) };
}

/** Registers a user without logging in, and tracks it for cleanup. */
export function trackEmail(email: string): string {
  createdEmails.push(email);
  return email;
}

export function readJwtCookie(res: request.Response): string {
  const cookies = res.headers['set-cookie'] as unknown as string[] | undefined;
  return cookies?.[0]?.split(';')[0]?.replace('jwt=', '') || '';
}

export async function createForm(
  app: INestApplication,
  token: string,
  data: { name: string; description?: string },
): Promise<TestForm> {
  const res = await request(app.getHttpServer())
    .post('/api/forms')
    .set('Cookie', `jwt=${token}`)
    .send(data)
    .expect(201);

  return res.body;
}

/** Publishes a form and returns the updated form, including its generated slug. */
export async function publishForm(
  app: INestApplication,
  token: string,
  formId: string,
): Promise<TestForm> {
  const res = await request(app.getHttpServer())
    .post(`/api/forms/${formId}/publish`)
    .set('Cookie', `jwt=${token}`)
    .expect(200);

  return res.body;
}

export async function saveFields(
  app: INestApplication,
  token: string,
  formId: string,
  fields: any[],
) {
  return request(app.getHttpServer())
    .post(`/api/forms/${formId}/fields`)
    .set('Cookie', `jwt=${token}`)
    .send({ fields })
    .expect(200);
}

export async function saveRules(
  app: INestApplication,
  token: string,
  formId: string,
  rules: any[],
) {
  return request(app.getHttpServer())
    .post(`/api/forms/${formId}/rules`)
    .set('Cookie', `jwt=${token}`)
    .send({ rules })
    .expect(200);
}

export async function submitPublicForm(
  app: INestApplication,
  slug: string,
  answers: { fieldId: string; value: any }[],
) {
  return request(app.getHttpServer())
    .post(`/api/public/forms/${slug}/submissions`)
    .send({ answers })
    .expect(201);
}

export function extractUserIdFromToken(token: string): string {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64').toString(),
    );
    return payload.sub;
  } catch {
    return '';
  }
}

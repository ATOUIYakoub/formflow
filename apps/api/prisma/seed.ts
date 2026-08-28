import { PrismaClient, FormStatus, FieldType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Clean up existing data (optional, but good for idempotent seeds)
  await prisma.submissionAnswer.deleteMany({});
  await prisma.submission.deleteMany({});
  await prisma.formField.deleteMany({});
  await prisma.form.deleteMany({});
  await prisma.workspace.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Create User
  const user = await prisma.user.create({
    data: {
      email: 'demo@formflow.local',
      passwordHash: 'dummy_hash', // In a real app, this would be hashed (e.g. bcrypt)
      name: 'Demo User',
    },
  });

  console.log(`Created user: ${user.email}`);

  // 3. Create Workspace
  const workspace = await prisma.workspace.create({
    data: {
      name: "Demo's Workspace",
      ownerId: user.id,
    },
  });

  console.log(`Created workspace: ${workspace.name}`);

  // 4. Create Form with Fields
  const form = await prisma.form.create({
    data: {
      name: 'Customer Feedback',
      description: 'We would love to hear your thoughts!',
      slug: 'customer-feedback',
      status: FormStatus.PUBLISHED,
      workspaceId: workspace.id,
      fields: {
        create: [
          {
            type: FieldType.TEXT,
            label: 'What is your name?',
            position: 0,
            required: true,
          },
          {
            type: FieldType.EMAIL,
            label: 'What is your email address?',
            placeholder: 'john@example.com',
            position: 1,
            required: true,
          },
          {
            type: FieldType.SELECT,
            label: 'How did you hear about us?',
            position: 2,
            options: ['Social Media', 'Search Engine', 'Friend', 'Other'],
            required: false,
          },
          {
            type: FieldType.LONG_TEXT,
            label: 'Any other feedback?',
            position: 3,
            required: false,
          },
        ],
      },
    },
    include: {
      fields: true, // Return fields so we can use their IDs for answers
    },
  });

  console.log(`Created form: ${form.name}`);

  // 5. Create a Sample Submission
  const nameField = form.fields.find((f) => f.type === FieldType.TEXT);
  const emailField = form.fields.find((f) => f.type === FieldType.EMAIL);
  const selectField = form.fields.find((f) => f.type === FieldType.SELECT);

  if (nameField && emailField && selectField) {
    const submission = await prisma.submission.create({
      data: {
        formId: form.id,
        version: form.version,
        answers: {
          create: [
            { fieldId: nameField.id, value: 'Alice Smith' },
            { fieldId: emailField.id, value: 'alice@example.com' },
            { fieldId: selectField.id, value: 'Search Engine' },
          ],
        },
      },
    });

    console.log(`Created submission: ${submission.id}`);
  }

  console.log('Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

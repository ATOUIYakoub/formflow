import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FormsModule } from './forms/forms.module';

@Module({
  imports: [PrismaModule, HealthModule, AuthModule, UsersModule, FormsModule],
})
export class AppModule {}

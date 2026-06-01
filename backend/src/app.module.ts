import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { HealthController } from './health/health.controller';
import { DapurModule } from './dapur/dapur.module';
import { SekolahModule } from './sekolah/sekolah.module';
import { KelasModule } from './kelas/kelas.module';
import { AdminUsersModule } from './admin-users/admin-users.module';
import { MenuModule } from './menu/menu.module';
import { DistribusiModule } from './distribusi/distribusi.module';
import { EvaluasiModule } from './evaluasi/evaluasi.module';
import { UploadModule } from './upload/upload.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { LaporanModule } from './laporan/laporan.module';
import { SentimenModule } from './sentimen/sentimen.module';
import { FeedbackModule } from './feedback/feedback.module';
import { KategoriModule } from './kategori/kategori.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot({
      throttlers: [
        { name: 'default', ttl: 60_000, limit: 120 },
      ],
    }),
    PrismaModule,
    AuthModule,
    DapurModule,
    SekolahModule,
    KelasModule,
    AdminUsersModule,
    MenuModule,
    DistribusiModule,
    EvaluasiModule,
    UploadModule,
    DashboardModule,
    LaporanModule,
    SentimenModule,
    FeedbackModule,
    KategoriModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}

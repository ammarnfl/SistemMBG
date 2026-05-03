import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
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
  ],
  controllers: [HealthController],
})
export class AppModule {}

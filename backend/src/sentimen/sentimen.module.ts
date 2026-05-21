import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SentimenController } from './sentimen.controller';
import { SentimenService } from './sentimen.service';

@Module({
  imports: [PrismaModule],
  controllers: [SentimenController],
  providers: [SentimenService],
  exports: [SentimenService],
})
export class SentimenModule {}

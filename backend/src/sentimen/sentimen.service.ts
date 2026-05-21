import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { SentimenLabel } from '@prisma/client';

interface HuggingFaceResult {
  label: string;
  score: number;
}

@Injectable()
export class SentimenService {
  private readonly logger = new Logger(SentimenService.name);
  private readonly HF_API_URL =
    'https://api-inference.huggingface.co/models/w11wo/indonesian-roberta-base-sentiment-classifier';

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  private mapLabel(label: string): SentimenLabel {
    const normalized = label.toLowerCase();
    if (normalized === 'positive') return SentimenLabel.POSITIF;
    if (normalized === 'negative') return SentimenLabel.NEGATIF;
    return SentimenLabel.NETRAL;
  }

  async analyzeSingle(
    text: string,
  ): Promise<{ label: SentimenLabel; rawLabel: string; score: number } | null> {
    const token = this.config.get<string>('HUGGINGFACE_API_TOKEN');
    if (!token) {
      this.logger.error('HUGGINGFACE_API_TOKEN is not set');
      return null;
    }

    try {
      const response = await fetch(this.HF_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: text }),
      });

      if (!response.ok) {
        this.logger.warn(`HuggingFace API returned ${response.status}`);
        return null;
      }

      const data = (await response.json()) as HuggingFaceResult[][];
      const results = data[0];
      if (!results || results.length === 0) return null;

      const top = results.reduce((prev, cur) =>
        cur.score > prev.score ? cur : prev,
      );
      return {
        label: this.mapLabel(top.label),
        rawLabel: top.label,
        score: top.score,
      };
    } catch (error) {
      this.logger.error(`HuggingFace API call failed: ${error}`);
      return null;
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async processPendingFeedback(): Promise<void> {
    this.logger.log('SentimenJob: Mencari feedback yang belum dianalisis...');

    const pending = await this.prisma.evaluasiHarian.findMany({
      where: {
        feedback: { not: null },
        sentimen: null,
      },
      select: { id: true, feedback: true },
    });

    if (pending.length === 0) {
      this.logger.log('SentimenJob: Tidak ada feedback baru untuk dianalisis.');
      return;
    }

    this.logger.log(`SentimenJob: Memproses ${pending.length} feedback...`);
    let successCount = 0;
    let errorCount = 0;

    for (const record of pending) {
      if (!record.feedback) continue;

      await new Promise((resolve) => setTimeout(resolve, 150));

      const result = await this.analyzeSingle(record.feedback);
      if (!result) {
        errorCount++;
        continue;
      }

      await this.prisma.evaluasiHarian.update({
        where: { id: record.id },
        data: {
          sentimen: result.label,
          sentimenSkor: result.score,
          sentimenLabel: result.rawLabel,
          sentimenAnalyzedAt: new Date(),
        },
      });
      successCount++;
    }

    this.logger.log(
      `SentimenJob: Selesai. Berhasil: ${successCount}, Gagal/Dilewati: ${errorCount}`,
    );
  }

  async triggerManual(): Promise<{ processed: number; skipped: number }> {
    const pending = await this.prisma.evaluasiHarian.findMany({
      where: { feedback: { not: null }, sentimen: null },
      select: { id: true, feedback: true },
    });

    let processed = 0;
    let skipped = 0;

    for (const record of pending) {
      if (!record.feedback) continue;
      await new Promise((resolve) => setTimeout(resolve, 150));
      const result = await this.analyzeSingle(record.feedback);
      if (!result) {
        skipped++;
        continue;
      }
      await this.prisma.evaluasiHarian.update({
        where: { id: record.id },
        data: {
          sentimen: result.label,
          sentimenSkor: result.score,
          sentimenLabel: result.rawLabel,
          sentimenAnalyzedAt: new Date(),
        },
      });
      processed++;
    }

    return { processed, skipped };
  }
}

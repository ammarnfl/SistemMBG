import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

let cachedApp: any;

async function bootstrap() {
  if (!cachedApp) {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
  });

  // Serve static files (uploads)
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global response interceptor
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Sistem Evaluasi MBG API')
    .setDescription(
      'API untuk sistem evaluasi layanan Makan Bergizi Gratis (MBG)',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

    const port = process.env.PORT ?? 3001;
    
    // Hanya jalankan app.listen() jika TIDAK sedang berjalan di Vercel
    if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
      await app.listen(port);
      console.log(`🚀 Backend berjalan di http://localhost:${port}`);
      console.log(`📚 Swagger tersedia di http://localhost:${port}/api`);
    } else {
      // Untuk Vercel, cukup init() saja
      await app.init();
    }

    cachedApp = app.getHttpAdapter().getInstance();
  }
  return cachedApp;
}

// Untuk deployment Vercel
export default async (req: any, res: any) => {
  const app = await bootstrap();
  return app(req, res);
};

if (process.env.NODE_ENV !== 'production') {
  bootstrap();
}
// trigger restart

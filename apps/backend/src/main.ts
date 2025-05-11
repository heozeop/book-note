import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as cookieParser from "cookie-parser";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Cookie Parser 미들웨어
  app.use(cookieParser());

  // CORS 설정
  app.enableCors({
    origin: true, // or specify your client domains
    credentials: true, // important for cookies
  });

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle("BookNote API")
    .setDescription("BookNote 애플리케이션의 API 문서")
    .setVersion("1.0")
    .addBearerAuth()
    .addCookieAuth("accessToken")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  // 환경 변수에서 포트 가져오기
  const configService = app.get(ConfigService);
  const port = configService.get<number>("PORT", 3000);

  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();

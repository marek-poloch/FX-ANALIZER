import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
  const logger = new Logger("Bootstrap");
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.API_CORS_ORIGIN?.split(",") ?? "http://localhost:3000",
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.setGlobalPrefix("api", { exclude: ["health"] });

  const port = Number(process.env.API_PORT ?? 4000);
  await app.listen(port, process.env.API_HOST ?? "0.0.0.0");
  logger.log(`FX Whale Radar API listening on port ${port}`);
  logger.log(`DATA_MODE=${process.env.DATA_MODE ?? "demo"}`);
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Fatal bootstrap error:", err);
  process.exit(1);
});

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { Logger } from '@nestjs/common';
import { PAY_PACKAGE_NAME } from 'proto/pay.pb';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);

  app.use(
    bodyParser.json({
      verify: (req: any, res, buf) => {
        req.rawBody = buf.toString();
      },
    }),
  );

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: PAY_PACKAGE_NAME,
      protoPath: join(process.cwd(), 'proto/pay.proto'), 
      url: '0.0.0.0:50055', 
      loader: {
        keepCase: true,
        objects: true,
        arrays: true,
      },
    },
  });

  await app.startAllMicroservices();
  logger.log(`✅ gRPC server running on 0.0.0.0:50055`);

  await app.listen(process.env.PORT ?? 3005);
  logger.log(`✅ HTTP server running on ${process.env.PORT ?? 3005}`);
}

bootstrap();

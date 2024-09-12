declare const module: any;

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import { RedirectMiddleware } from './providers/middleware';
import { AuthModule } from './auth/auth.module';
import { GoogleModule } from './googlehome/google.module';
import * as express from 'express';

async function bootstrap() {

  const app = await NestFactory.create(AuthModule);
  app.use(express.json())
  app.use(express.urlencoded({extended: true}));

  const smarthome = await NestFactory.create(GoogleModule);
  smarthome.use(bodyParser.json());

  await app.listen(3000, () => {
    console.log(`Server is running on port: 3000`);
  });

  await smarthome.listen(5000, () => {
    console.log(`Smarthome is listening on port: 5000`);
  })

  //hot reload configs
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}

bootstrap();

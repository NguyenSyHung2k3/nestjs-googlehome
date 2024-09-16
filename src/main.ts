declare const module: any;

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import { GoogleModule } from './googlehome/google.module';
import * as express from 'express';

async function bootstrap() {

  const app = await NestFactory.create(AppModule);
  app.use(express.json())
  app.use(express.urlencoded({extended: true}));

  await app.listen(3000, () => {
    console.log(`Server is running on port: 3000`);
  });

  //hot reload configs
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}

bootstrap();

declare const module: any;

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SmartHomeModule } from './smarthome.module';

async function bootstrap() {

  const app = await NestFactory.create(AppModule);

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

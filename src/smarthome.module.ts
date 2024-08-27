import { Module } from '@nestjs/common';
import { GoogleModule } from './googlehome/google.module';

@Module({
  imports: [GoogleModule]
})
export class SmartHomeModule {}
import { Module } from '@nestjs/common';

import { ConfigureModule } from './configure/configure.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [ConfigureModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

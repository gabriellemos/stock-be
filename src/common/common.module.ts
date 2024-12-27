import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';

import { GroupIntervalScalar } from './scalars/group-interval.scalar';
import { TimeIntervalScalar } from './scalars/time-interval.scalar';
import { ExceptionFilter } from './filter/exception.filter';

@Module({
  providers: [
    GroupIntervalScalar,
    TimeIntervalScalar,
    {
      provide: APP_FILTER,
      useClass: ExceptionFilter,
    },
  ],
})
export class CommonModule {}

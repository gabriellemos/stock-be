import { Module } from '@nestjs/common';

import { TimeIntervalScalar } from './scalars/time-interval.scalar';

@Module({
  providers: [TimeIntervalScalar],
})
export class CommonModule {}

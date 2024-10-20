import { Module } from '@nestjs/common';

import { GroupIntervalScalar } from './scalars/group-interval.scalar';
import { TimeIntervalScalar } from './scalars/time-interval.scalar';

@Module({
  providers: [GroupIntervalScalar, TimeIntervalScalar],
})
export class CommonModule {}

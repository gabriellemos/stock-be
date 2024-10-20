import type { PipelineStage } from 'mongoose';

import { GroupInterval } from 'src/common/scalars/group-interval.scalar';

const GROUP_MAPPING: Record<`${GroupInterval}`, any> = {
  [GroupInterval.DAY]: {
    year: { $year: '$date' },
    month: { $month: '$date' },
    day: { $dayOfMonth: '$date' },
  },
  [GroupInterval.WEEK]: {
    year: { $year: '$date' },
    week: { $week: '$date' },
  },
  [GroupInterval.MONTH]: {
    year: { $year: '$date' },
    month: { $month: '$date' },
  },
  [GroupInterval.YEAR]: {
    year: { $year: '$date' },
  },
  [GroupInterval.TRIMESTER]: {
    year: { $year: '$date' },
    trimester: { $ceil: { $divide: [{ $month: '$date' }, 3] } },
  },
  [GroupInterval.SEMESTER]: {
    year: { $year: '$date' },
    semester: { $ceil: { $divide: [{ $month: '$date' }, 6] } },
  },
} as const;

const SORT_MAPPING: Record<`${GroupInterval}`, any> = {
  [GroupInterval.DAY]: {
    '_id.year': -1,
    '_id.month': -1,
    '_id.day': -1,
  },
  [GroupInterval.WEEK]: {
    '_id.year': -1,
    '_id.week': -1,
  },
  [GroupInterval.MONTH]: {
    '_id.year': -1,
    '_id.month': -1,
  },
  [GroupInterval.YEAR]: {
    '_id.year': -1,
  },
  [GroupInterval.TRIMESTER]: {
    '_id.year': -1,
    '_id.trimester': -1,
  },
  [GroupInterval.SEMESTER]: {
    '_id.year': -1,
    '_id.semester': -1,
  },
} as const;

export const generateGroupFor = (
  interval: GroupInterval,
): PipelineStage.Group['$group'] => {
  return {
    _id: GROUP_MAPPING[interval],
    from: { $first: '$date' },
    to: { $last: '$date' },
    open: { $first: '$open' },
    high: { $max: '$high' },
    low: { $min: '$low' },
    close: { $last: '$close' },
    volume: { $sum: '$volume' },
  };
};

export const generateProject = (): PipelineStage.Project['$project'] => {
  return {
    period: { from: '$from', to: '$to' },
    open: '$open',
    high: '$high',
    low: '$low',
    close: '$close',
    volume: '$volume',
  };
};

export const generateSortFor = (
  interval: GroupInterval,
): PipelineStage.Sort['$sort'] => {
  return SORT_MAPPING[interval];
};

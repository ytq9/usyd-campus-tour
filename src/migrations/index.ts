import * as migration_20260326_122811_initial from './20260326_122811_initial';

export const migrations = [
  {
    up: migration_20260326_122811_initial.up,
    down: migration_20260326_122811_initial.down,
    name: '20260326_122811_initial'
  },
];

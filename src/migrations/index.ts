import * as migration_20260326_122811_initial from './20260326_122811_initial';
import * as migration_20260511_180000_floor_drafts from './20260511_180000_floor_drafts';
import * as migration_20260511_213000_backfill_floor_versions from './20260511_213000_backfill_floor_versions';

export const migrations = [
  {
    up: migration_20260326_122811_initial.up,
    down: migration_20260326_122811_initial.down,
    name: '20260326_122811_initial'
  },
  {
    up: migration_20260511_180000_floor_drafts.up,
    down: migration_20260511_180000_floor_drafts.down,
    name: '20260511_180000_floor_drafts'
  },
  {
    up: migration_20260511_213000_backfill_floor_versions.up,
    down: migration_20260511_213000_backfill_floor_versions.down,
    name: '20260511_213000_backfill_floor_versions'
  },
];

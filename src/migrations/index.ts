import * as migration_20260326_122811_initial from './20260326_122811_initial';
import * as migration_20260511_180000_floor_drafts from './20260511_180000_floor_drafts';
import * as migration_20260511_213000_backfill_floor_versions from './20260511_213000_backfill_floor_versions';
import * as migration_20260513_114600_remove_floor_order from './20260513_114600_remove_floor_order';
import * as migration_20260513_150000_info_hotspot_video from './20260513_150000_info_hotspot_video';

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
  {
    up: migration_20260513_114600_remove_floor_order.up,
    down: migration_20260513_114600_remove_floor_order.down,
    name: '20260513_114600_remove_floor_order'
  },
  {
    up: migration_20260513_150000_info_hotspot_video.up,
    down: migration_20260513_150000_info_hotspot_video.down,
    name: '20260513_150000_info_hotspot_video'
  },
];

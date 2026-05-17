import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "scenes_hotspots" ADD COLUMN "info_video_id" integer;
    ALTER TABLE "_scenes_v_version_hotspots" ADD COLUMN "info_video_id" integer;

    ALTER TABLE "scenes_hotspots"
      ADD CONSTRAINT "scenes_hotspots_info_video_id_media_id_fk"
      FOREIGN KEY ("info_video_id") REFERENCES "public"."media"("id")
      ON DELETE set null ON UPDATE no action;

    ALTER TABLE "_scenes_v_version_hotspots"
      ADD CONSTRAINT "_scenes_v_version_hotspots_info_video_id_media_id_fk"
      FOREIGN KEY ("info_video_id") REFERENCES "public"."media"("id")
      ON DELETE set null ON UPDATE no action;

    CREATE INDEX "scenes_hotspots_info_video_idx" ON "scenes_hotspots" USING btree ("info_video_id");
    CREATE INDEX "_scenes_v_version_hotspots_info_video_idx" ON "_scenes_v_version_hotspots" USING btree ("info_video_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "_scenes_v_version_hotspots_info_video_idx";
    DROP INDEX IF EXISTS "scenes_hotspots_info_video_idx";

    ALTER TABLE "_scenes_v_version_hotspots"
      DROP CONSTRAINT IF EXISTS "_scenes_v_version_hotspots_info_video_id_media_id_fk";

    ALTER TABLE "scenes_hotspots"
      DROP CONSTRAINT IF EXISTS "scenes_hotspots_info_video_id_media_id_fk";

    ALTER TABLE "_scenes_v_version_hotspots" DROP COLUMN IF EXISTS "info_video_id";
    ALTER TABLE "scenes_hotspots" DROP COLUMN IF EXISTS "info_video_id";
  `)
}

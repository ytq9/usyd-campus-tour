import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_scenes_hotspots_icon_style" AS ENUM(
      'default','arrow','info','pin','star','building','academic','camera','question'
    );
    CREATE TYPE "public"."enum__scenes_v_version_hotspots_icon_style" AS ENUM(
      'default','arrow','info','pin','star','building','academic','camera','question'
    );

    ALTER TABLE "scenes_hotspots"
      ADD COLUMN "icon_style" "enum_scenes_hotspots_icon_style" DEFAULT 'default';
    ALTER TABLE "_scenes_v_version_hotspots"
      ADD COLUMN "icon_style" "enum__scenes_v_version_hotspots_icon_style" DEFAULT 'default';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "scenes_hotspots" DROP COLUMN IF EXISTS "icon_style";
    ALTER TABLE "_scenes_v_version_hotspots" DROP COLUMN IF EXISTS "icon_style";
    DROP TYPE IF EXISTS "public"."enum_scenes_hotspots_icon_style";
    DROP TYPE IF EXISTS "public"."enum__scenes_v_version_hotspots_icon_style";
  `)
}

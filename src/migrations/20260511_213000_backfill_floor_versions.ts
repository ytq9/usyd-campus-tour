import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "floors"
    SET "_status" = 'published'
    WHERE "_status" IS NULL;

    WITH inserted_versions AS (
      INSERT INTO "_floors_v" (
        "parent_id",
        "version_name",
        "version_slug",
        "version_tour_id",
        "version_floorplan_id",
        "version_initial_scene_id",
        "version_order",
        "version_updated_at",
        "version_created_at",
        "version__status",
        "created_at",
        "updated_at",
        "latest"
      )
      SELECT
        "floors"."id",
        "floors"."name",
        "floors"."slug",
        "floors"."tour_id",
        "floors"."floorplan_id",
        "floors"."initial_scene_id",
        "floors"."order",
        "floors"."updated_at",
        "floors"."created_at",
        "floors"."_status"::text::"enum__floors_v_version_status",
        NOW(),
        NOW(),
        true
      FROM "floors"
      WHERE NOT EXISTS (
        SELECT 1
        FROM "_floors_v"
        WHERE "_floors_v"."parent_id" = "floors"."id"
          AND "_floors_v"."latest" = true
      )
      RETURNING "id", "parent_id"
    )
    INSERT INTO "_floors_v_version_map_points" (
      "_order",
      "_parent_id",
      "scene_id",
      "cx",
      "cy",
      "color",
      "_uuid"
    )
    SELECT
      "floors_map_points"."_order",
      "inserted_versions"."id",
      "floors_map_points"."scene_id",
      "floors_map_points"."cx",
      "floors_map_points"."cy",
      "floors_map_points"."color",
      "floors_map_points"."id"
    FROM "inserted_versions"
    JOIN "floors_map_points"
      ON "floors_map_points"."_parent_id" = "inserted_versions"."parent_id";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql``)
}

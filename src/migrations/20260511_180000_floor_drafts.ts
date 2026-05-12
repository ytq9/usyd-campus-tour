import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_floors_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__floors_v_version_status" AS ENUM('draft', 'published');

  ALTER TABLE "floors" ADD COLUMN "_status" "enum_floors_status" DEFAULT 'draft';
  UPDATE "floors" SET "_status" = 'published';

  CREATE TABLE "_floors_v_version_map_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"scene_id" integer,
  	"cx" numeric,
  	"cy" numeric,
  	"color" varchar DEFAULT '#E64626',
  	"_uuid" varchar
  );

  CREATE TABLE "_floors_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_slug" varchar,
  	"version_tour_id" integer,
  	"version_floorplan_id" integer,
  	"version_initial_scene_id" integer,
  	"version_order" numeric DEFAULT 0,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__floors_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );

  ALTER TABLE "_floors_v_version_map_points" ADD CONSTRAINT "_floors_v_version_map_points_scene_id_scenes_id_fk" FOREIGN KEY ("scene_id") REFERENCES "public"."scenes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_floors_v_version_map_points" ADD CONSTRAINT "_floors_v_version_map_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_floors_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_floors_v" ADD CONSTRAINT "_floors_v_parent_id_floors_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."floors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_floors_v" ADD CONSTRAINT "_floors_v_version_tour_id_tours_id_fk" FOREIGN KEY ("version_tour_id") REFERENCES "public"."tours"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_floors_v" ADD CONSTRAINT "_floors_v_version_floorplan_id_media_id_fk" FOREIGN KEY ("version_floorplan_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_floors_v" ADD CONSTRAINT "_floors_v_version_initial_scene_id_scenes_id_fk" FOREIGN KEY ("version_initial_scene_id") REFERENCES "public"."scenes"("id") ON DELETE set null ON UPDATE no action;

  CREATE INDEX "floors__status_idx" ON "floors" USING btree ("_status");
  CREATE INDEX "_floors_v_version_map_points_order_idx" ON "_floors_v_version_map_points" USING btree ("_order");
  CREATE INDEX "_floors_v_version_map_points_parent_id_idx" ON "_floors_v_version_map_points" USING btree ("_parent_id");
  CREATE INDEX "_floors_v_version_map_points_scene_idx" ON "_floors_v_version_map_points" USING btree ("scene_id");
  CREATE INDEX "_floors_v_parent_idx" ON "_floors_v" USING btree ("parent_id");
  CREATE INDEX "_floors_v_version_version_slug_idx" ON "_floors_v" USING btree ("version_slug");
  CREATE INDEX "_floors_v_version_version_tour_idx" ON "_floors_v" USING btree ("version_tour_id");
  CREATE INDEX "_floors_v_version_version_floorplan_idx" ON "_floors_v" USING btree ("version_floorplan_id");
  CREATE INDEX "_floors_v_version_version_initial_scene_idx" ON "_floors_v" USING btree ("version_initial_scene_id");
  CREATE INDEX "_floors_v_version_version_updated_at_idx" ON "_floors_v" USING btree ("version_updated_at");
  CREATE INDEX "_floors_v_version_version_created_at_idx" ON "_floors_v" USING btree ("version_created_at");
  CREATE INDEX "_floors_v_version_version__status_idx" ON "_floors_v" USING btree ("version__status");
  CREATE INDEX "_floors_v_created_at_idx" ON "_floors_v" USING btree ("created_at");
  CREATE INDEX "_floors_v_updated_at_idx" ON "_floors_v" USING btree ("updated_at");
  CREATE INDEX "_floors_v_latest_idx" ON "_floors_v" USING btree ("latest");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "_floors_v_version_map_points" CASCADE;
  DROP TABLE "_floors_v" CASCADE;
  DROP INDEX IF EXISTS "floors__status_idx";
  ALTER TABLE "floors" DROP COLUMN IF EXISTS "_status";
  DROP TYPE "public"."enum_floors_status";
  DROP TYPE "public"."enum__floors_v_version_status";`)
}

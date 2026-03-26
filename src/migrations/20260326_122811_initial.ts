import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_tours_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__tours_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_scenes_hotspots_type" AS ENUM('scene', 'info');
  CREATE TYPE "public"."enum_scenes_hotspots_icon_size" AS ENUM('sm', 'md', 'lg');
  CREATE TYPE "public"."enum_scenes_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__scenes_v_version_hotspots_type" AS ENUM('scene', 'info');
  CREATE TYPE "public"."enum__scenes_v_version_hotspots_icon_size" AS ENUM('sm', 'md', 'lg');
  CREATE TYPE "public"."enum__scenes_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tag" varchar NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_preview_url" varchar,
  	"sizes_preview_width" numeric,
  	"sizes_preview_height" numeric,
  	"sizes_preview_mime_type" varchar,
  	"sizes_preview_filesize" numeric,
  	"sizes_preview_filename" varchar
  );
  
  CREATE TABLE "tours_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tag" varchar
  );
  
  CREATE TABLE "tours" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"description" jsonb,
  	"cover_image_id" integer,
  	"welcome_title" varchar,
  	"welcome_text" jsonb,
  	"default_floor_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_tours_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "tours_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"floors_id" integer
  );
  
  CREATE TABLE "_tours_v_version_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"tag" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_tours_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_description" jsonb,
  	"version_cover_image_id" integer,
  	"version_welcome_title" varchar,
  	"version_welcome_text" jsonb,
  	"version_default_floor_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__tours_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_tours_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"floors_id" integer
  );
  
  CREATE TABLE "floors_map_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"scene_id" integer NOT NULL,
  	"cx" numeric NOT NULL,
  	"cy" numeric NOT NULL,
  	"color" varchar DEFAULT '#E64626'
  );
  
  CREATE TABLE "floors" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"tour_id" integer,
  	"floorplan_id" integer,
  	"initial_scene_id" integer,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "scenes_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tag" varchar
  );
  
  CREATE TABLE "scenes_hotspots" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_scenes_hotspots_type",
  	"pitch" numeric,
  	"yaw" numeric,
  	"text" varchar,
  	"target_scene_id" integer,
  	"target_floor_id" integer,
  	"info_content" jsonb,
  	"css_class" varchar,
  	"icon_color" varchar,
  	"icon_size" "enum_scenes_hotspots_icon_size" DEFAULT 'md'
  );
  
  CREATE TABLE "scenes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"floor_id" integer,
  	"description" jsonb,
  	"accessibility_notes" varchar,
  	"panorama_id" integer,
  	"initial_yaw" numeric DEFAULT 0,
  	"initial_pitch" numeric DEFAULT 0,
  	"initial_hfov" numeric DEFAULT 120,
  	"rotation" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_scenes_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_scenes_v_version_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"tag" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_scenes_v_version_hotspots" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" "enum__scenes_v_version_hotspots_type",
  	"pitch" numeric,
  	"yaw" numeric,
  	"text" varchar,
  	"target_scene_id" integer,
  	"target_floor_id" integer,
  	"info_content" jsonb,
  	"css_class" varchar,
  	"icon_color" varchar,
  	"icon_size" "enum__scenes_v_version_hotspots_icon_size" DEFAULT 'md',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_scenes_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_floor_id" integer,
  	"version_description" jsonb,
  	"version_accessibility_notes" varchar,
  	"version_panorama_id" integer,
  	"version_initial_yaw" numeric DEFAULT 0,
  	"version_initial_pitch" numeric DEFAULT 0,
  	"version_initial_hfov" numeric DEFAULT 120,
  	"version_rotation" numeric DEFAULT 0,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__scenes_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"tours_id" integer,
  	"floors_id" integer,
  	"scenes_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_tags" ADD CONSTRAINT "media_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tours_tags" ADD CONSTRAINT "tours_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tours"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tours" ADD CONSTRAINT "tours_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "tours" ADD CONSTRAINT "tours_default_floor_id_floors_id_fk" FOREIGN KEY ("default_floor_id") REFERENCES "public"."floors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "tours_rels" ADD CONSTRAINT "tours_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."tours"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tours_rels" ADD CONSTRAINT "tours_rels_floors_fk" FOREIGN KEY ("floors_id") REFERENCES "public"."floors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tours_v_version_tags" ADD CONSTRAINT "_tours_v_version_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tours_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tours_v" ADD CONSTRAINT "_tours_v_parent_id_tours_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."tours"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_tours_v" ADD CONSTRAINT "_tours_v_version_cover_image_id_media_id_fk" FOREIGN KEY ("version_cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_tours_v" ADD CONSTRAINT "_tours_v_version_default_floor_id_floors_id_fk" FOREIGN KEY ("version_default_floor_id") REFERENCES "public"."floors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_tours_v_rels" ADD CONSTRAINT "_tours_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_tours_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tours_v_rels" ADD CONSTRAINT "_tours_v_rels_floors_fk" FOREIGN KEY ("floors_id") REFERENCES "public"."floors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "floors_map_points" ADD CONSTRAINT "floors_map_points_scene_id_scenes_id_fk" FOREIGN KEY ("scene_id") REFERENCES "public"."scenes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "floors_map_points" ADD CONSTRAINT "floors_map_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."floors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "floors" ADD CONSTRAINT "floors_tour_id_tours_id_fk" FOREIGN KEY ("tour_id") REFERENCES "public"."tours"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "floors" ADD CONSTRAINT "floors_floorplan_id_media_id_fk" FOREIGN KEY ("floorplan_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "floors" ADD CONSTRAINT "floors_initial_scene_id_scenes_id_fk" FOREIGN KEY ("initial_scene_id") REFERENCES "public"."scenes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "scenes_tags" ADD CONSTRAINT "scenes_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."scenes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "scenes_hotspots" ADD CONSTRAINT "scenes_hotspots_target_scene_id_scenes_id_fk" FOREIGN KEY ("target_scene_id") REFERENCES "public"."scenes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "scenes_hotspots" ADD CONSTRAINT "scenes_hotspots_target_floor_id_floors_id_fk" FOREIGN KEY ("target_floor_id") REFERENCES "public"."floors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "scenes_hotspots" ADD CONSTRAINT "scenes_hotspots_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."scenes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "scenes" ADD CONSTRAINT "scenes_floor_id_floors_id_fk" FOREIGN KEY ("floor_id") REFERENCES "public"."floors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "scenes" ADD CONSTRAINT "scenes_panorama_id_media_id_fk" FOREIGN KEY ("panorama_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_scenes_v_version_tags" ADD CONSTRAINT "_scenes_v_version_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_scenes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_scenes_v_version_hotspots" ADD CONSTRAINT "_scenes_v_version_hotspots_target_scene_id_scenes_id_fk" FOREIGN KEY ("target_scene_id") REFERENCES "public"."scenes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_scenes_v_version_hotspots" ADD CONSTRAINT "_scenes_v_version_hotspots_target_floor_id_floors_id_fk" FOREIGN KEY ("target_floor_id") REFERENCES "public"."floors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_scenes_v_version_hotspots" ADD CONSTRAINT "_scenes_v_version_hotspots_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_scenes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_scenes_v" ADD CONSTRAINT "_scenes_v_parent_id_scenes_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."scenes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_scenes_v" ADD CONSTRAINT "_scenes_v_version_floor_id_floors_id_fk" FOREIGN KEY ("version_floor_id") REFERENCES "public"."floors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_scenes_v" ADD CONSTRAINT "_scenes_v_version_panorama_id_media_id_fk" FOREIGN KEY ("version_panorama_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tours_fk" FOREIGN KEY ("tours_id") REFERENCES "public"."tours"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_floors_fk" FOREIGN KEY ("floors_id") REFERENCES "public"."floors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_scenes_fk" FOREIGN KEY ("scenes_id") REFERENCES "public"."scenes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_tags_order_idx" ON "media_tags" USING btree ("_order");
  CREATE INDEX "media_tags_parent_id_idx" ON "media_tags" USING btree ("_parent_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_preview_sizes_preview_filename_idx" ON "media" USING btree ("sizes_preview_filename");
  CREATE INDEX "tours_tags_order_idx" ON "tours_tags" USING btree ("_order");
  CREATE INDEX "tours_tags_parent_id_idx" ON "tours_tags" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "tours_slug_idx" ON "tours" USING btree ("slug");
  CREATE INDEX "tours_cover_image_idx" ON "tours" USING btree ("cover_image_id");
  CREATE INDEX "tours_default_floor_idx" ON "tours" USING btree ("default_floor_id");
  CREATE INDEX "tours_updated_at_idx" ON "tours" USING btree ("updated_at");
  CREATE INDEX "tours_created_at_idx" ON "tours" USING btree ("created_at");
  CREATE INDEX "tours__status_idx" ON "tours" USING btree ("_status");
  CREATE INDEX "tours_rels_order_idx" ON "tours_rels" USING btree ("order");
  CREATE INDEX "tours_rels_parent_idx" ON "tours_rels" USING btree ("parent_id");
  CREATE INDEX "tours_rels_path_idx" ON "tours_rels" USING btree ("path");
  CREATE INDEX "tours_rels_floors_id_idx" ON "tours_rels" USING btree ("floors_id");
  CREATE INDEX "_tours_v_version_tags_order_idx" ON "_tours_v_version_tags" USING btree ("_order");
  CREATE INDEX "_tours_v_version_tags_parent_id_idx" ON "_tours_v_version_tags" USING btree ("_parent_id");
  CREATE INDEX "_tours_v_parent_idx" ON "_tours_v" USING btree ("parent_id");
  CREATE INDEX "_tours_v_version_version_slug_idx" ON "_tours_v" USING btree ("version_slug");
  CREATE INDEX "_tours_v_version_version_cover_image_idx" ON "_tours_v" USING btree ("version_cover_image_id");
  CREATE INDEX "_tours_v_version_version_default_floor_idx" ON "_tours_v" USING btree ("version_default_floor_id");
  CREATE INDEX "_tours_v_version_version_updated_at_idx" ON "_tours_v" USING btree ("version_updated_at");
  CREATE INDEX "_tours_v_version_version_created_at_idx" ON "_tours_v" USING btree ("version_created_at");
  CREATE INDEX "_tours_v_version_version__status_idx" ON "_tours_v" USING btree ("version__status");
  CREATE INDEX "_tours_v_created_at_idx" ON "_tours_v" USING btree ("created_at");
  CREATE INDEX "_tours_v_updated_at_idx" ON "_tours_v" USING btree ("updated_at");
  CREATE INDEX "_tours_v_latest_idx" ON "_tours_v" USING btree ("latest");
  CREATE INDEX "_tours_v_rels_order_idx" ON "_tours_v_rels" USING btree ("order");
  CREATE INDEX "_tours_v_rels_parent_idx" ON "_tours_v_rels" USING btree ("parent_id");
  CREATE INDEX "_tours_v_rels_path_idx" ON "_tours_v_rels" USING btree ("path");
  CREATE INDEX "_tours_v_rels_floors_id_idx" ON "_tours_v_rels" USING btree ("floors_id");
  CREATE INDEX "floors_map_points_order_idx" ON "floors_map_points" USING btree ("_order");
  CREATE INDEX "floors_map_points_parent_id_idx" ON "floors_map_points" USING btree ("_parent_id");
  CREATE INDEX "floors_map_points_scene_idx" ON "floors_map_points" USING btree ("scene_id");
  CREATE UNIQUE INDEX "floors_slug_idx" ON "floors" USING btree ("slug");
  CREATE INDEX "floors_tour_idx" ON "floors" USING btree ("tour_id");
  CREATE INDEX "floors_floorplan_idx" ON "floors" USING btree ("floorplan_id");
  CREATE INDEX "floors_initial_scene_idx" ON "floors" USING btree ("initial_scene_id");
  CREATE INDEX "floors_updated_at_idx" ON "floors" USING btree ("updated_at");
  CREATE INDEX "floors_created_at_idx" ON "floors" USING btree ("created_at");
  CREATE INDEX "scenes_tags_order_idx" ON "scenes_tags" USING btree ("_order");
  CREATE INDEX "scenes_tags_parent_id_idx" ON "scenes_tags" USING btree ("_parent_id");
  CREATE INDEX "scenes_hotspots_order_idx" ON "scenes_hotspots" USING btree ("_order");
  CREATE INDEX "scenes_hotspots_parent_id_idx" ON "scenes_hotspots" USING btree ("_parent_id");
  CREATE INDEX "scenes_hotspots_target_scene_idx" ON "scenes_hotspots" USING btree ("target_scene_id");
  CREATE INDEX "scenes_hotspots_target_floor_idx" ON "scenes_hotspots" USING btree ("target_floor_id");
  CREATE UNIQUE INDEX "scenes_slug_idx" ON "scenes" USING btree ("slug");
  CREATE INDEX "scenes_floor_idx" ON "scenes" USING btree ("floor_id");
  CREATE INDEX "scenes_panorama_idx" ON "scenes" USING btree ("panorama_id");
  CREATE INDEX "scenes_updated_at_idx" ON "scenes" USING btree ("updated_at");
  CREATE INDEX "scenes_created_at_idx" ON "scenes" USING btree ("created_at");
  CREATE INDEX "scenes__status_idx" ON "scenes" USING btree ("_status");
  CREATE INDEX "_scenes_v_version_tags_order_idx" ON "_scenes_v_version_tags" USING btree ("_order");
  CREATE INDEX "_scenes_v_version_tags_parent_id_idx" ON "_scenes_v_version_tags" USING btree ("_parent_id");
  CREATE INDEX "_scenes_v_version_hotspots_order_idx" ON "_scenes_v_version_hotspots" USING btree ("_order");
  CREATE INDEX "_scenes_v_version_hotspots_parent_id_idx" ON "_scenes_v_version_hotspots" USING btree ("_parent_id");
  CREATE INDEX "_scenes_v_version_hotspots_target_scene_idx" ON "_scenes_v_version_hotspots" USING btree ("target_scene_id");
  CREATE INDEX "_scenes_v_version_hotspots_target_floor_idx" ON "_scenes_v_version_hotspots" USING btree ("target_floor_id");
  CREATE INDEX "_scenes_v_parent_idx" ON "_scenes_v" USING btree ("parent_id");
  CREATE INDEX "_scenes_v_version_version_slug_idx" ON "_scenes_v" USING btree ("version_slug");
  CREATE INDEX "_scenes_v_version_version_floor_idx" ON "_scenes_v" USING btree ("version_floor_id");
  CREATE INDEX "_scenes_v_version_version_panorama_idx" ON "_scenes_v" USING btree ("version_panorama_id");
  CREATE INDEX "_scenes_v_version_version_updated_at_idx" ON "_scenes_v" USING btree ("version_updated_at");
  CREATE INDEX "_scenes_v_version_version_created_at_idx" ON "_scenes_v" USING btree ("version_created_at");
  CREATE INDEX "_scenes_v_version_version__status_idx" ON "_scenes_v" USING btree ("version__status");
  CREATE INDEX "_scenes_v_created_at_idx" ON "_scenes_v" USING btree ("created_at");
  CREATE INDEX "_scenes_v_updated_at_idx" ON "_scenes_v" USING btree ("updated_at");
  CREATE INDEX "_scenes_v_latest_idx" ON "_scenes_v" USING btree ("latest");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_tours_id_idx" ON "payload_locked_documents_rels" USING btree ("tours_id");
  CREATE INDEX "payload_locked_documents_rels_floors_id_idx" ON "payload_locked_documents_rels" USING btree ("floors_id");
  CREATE INDEX "payload_locked_documents_rels_scenes_id_idx" ON "payload_locked_documents_rels" USING btree ("scenes_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media_tags" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "tours_tags" CASCADE;
  DROP TABLE "tours" CASCADE;
  DROP TABLE "tours_rels" CASCADE;
  DROP TABLE "_tours_v_version_tags" CASCADE;
  DROP TABLE "_tours_v" CASCADE;
  DROP TABLE "_tours_v_rels" CASCADE;
  DROP TABLE "floors_map_points" CASCADE;
  DROP TABLE "floors" CASCADE;
  DROP TABLE "scenes_tags" CASCADE;
  DROP TABLE "scenes_hotspots" CASCADE;
  DROP TABLE "scenes" CASCADE;
  DROP TABLE "_scenes_v_version_tags" CASCADE;
  DROP TABLE "_scenes_v_version_hotspots" CASCADE;
  DROP TABLE "_scenes_v" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."enum_tours_status";
  DROP TYPE "public"."enum__tours_v_version_status";
  DROP TYPE "public"."enum_scenes_hotspots_type";
  DROP TYPE "public"."enum_scenes_hotspots_icon_size";
  DROP TYPE "public"."enum_scenes_status";
  DROP TYPE "public"."enum__scenes_v_version_hotspots_type";
  DROP TYPE "public"."enum__scenes_v_version_hotspots_icon_size";
  DROP TYPE "public"."enum__scenes_v_version_status";`)
}

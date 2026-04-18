/*
 Navicat Premium Data Transfer

 Source Server         : postgres
 Source Server Type    : PostgreSQL
 Source Server Version : 170006 (170006)
 Source Host           : localhost:5432
 Source Catalog        : usyd_campus_tour
 Source Schema         : public

 Target Server Type    : PostgreSQL
 Target Server Version : 170006 (170006)
 File Encoding         : 65001

 Date: 05/04/2026 00:06:00
*/


-- ----------------------------
-- Type structure for enum__scenes_v_version_hotspots_icon_size
-- ----------------------------
DROP TYPE IF EXISTS "public"."enum__scenes_v_version_hotspots_icon_size";
CREATE TYPE "public"."enum__scenes_v_version_hotspots_icon_size" AS ENUM (
  'sm',
  'md',
  'lg'
);
ALTER TYPE "public"."enum__scenes_v_version_hotspots_icon_size" OWNER TO "postgres";

-- ----------------------------
-- Type structure for enum__scenes_v_version_hotspots_type
-- ----------------------------
DROP TYPE IF EXISTS "public"."enum__scenes_v_version_hotspots_type";
CREATE TYPE "public"."enum__scenes_v_version_hotspots_type" AS ENUM (
  'scene',
  'info'
);
ALTER TYPE "public"."enum__scenes_v_version_hotspots_type" OWNER TO "postgres";

-- ----------------------------
-- Type structure for enum__scenes_v_version_status
-- ----------------------------
DROP TYPE IF EXISTS "public"."enum__scenes_v_version_status";
CREATE TYPE "public"."enum__scenes_v_version_status" AS ENUM (
  'draft',
  'published'
);
ALTER TYPE "public"."enum__scenes_v_version_status" OWNER TO "postgres";

-- ----------------------------
-- Type structure for enum__tours_v_version_status
-- ----------------------------
DROP TYPE IF EXISTS "public"."enum__tours_v_version_status";
CREATE TYPE "public"."enum__tours_v_version_status" AS ENUM (
  'draft',
  'published'
);
ALTER TYPE "public"."enum__tours_v_version_status" OWNER TO "postgres";

-- ----------------------------
-- Type structure for enum_scenes_hotspots_icon_size
-- ----------------------------
DROP TYPE IF EXISTS "public"."enum_scenes_hotspots_icon_size";
CREATE TYPE "public"."enum_scenes_hotspots_icon_size" AS ENUM (
  'sm',
  'md',
  'lg'
);
ALTER TYPE "public"."enum_scenes_hotspots_icon_size" OWNER TO "postgres";

-- ----------------------------
-- Type structure for enum_scenes_hotspots_type
-- ----------------------------
DROP TYPE IF EXISTS "public"."enum_scenes_hotspots_type";
CREATE TYPE "public"."enum_scenes_hotspots_type" AS ENUM (
  'scene',
  'info'
);
ALTER TYPE "public"."enum_scenes_hotspots_type" OWNER TO "postgres";

-- ----------------------------
-- Type structure for enum_scenes_status
-- ----------------------------
DROP TYPE IF EXISTS "public"."enum_scenes_status";
CREATE TYPE "public"."enum_scenes_status" AS ENUM (
  'draft',
  'published'
);
ALTER TYPE "public"."enum_scenes_status" OWNER TO "postgres";

-- ----------------------------
-- Type structure for enum_tours_status
-- ----------------------------
DROP TYPE IF EXISTS "public"."enum_tours_status";
CREATE TYPE "public"."enum_tours_status" AS ENUM (
  'draft',
  'published'
);
ALTER TYPE "public"."enum_tours_status" OWNER TO "postgres";

-- ----------------------------
-- Sequence structure for _scenes_v_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."_scenes_v_id_seq";
CREATE SEQUENCE "public"."_scenes_v_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for _scenes_v_version_hotspots_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."_scenes_v_version_hotspots_id_seq";
CREATE SEQUENCE "public"."_scenes_v_version_hotspots_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for _scenes_v_version_tags_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."_scenes_v_version_tags_id_seq";
CREATE SEQUENCE "public"."_scenes_v_version_tags_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for _tours_v_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."_tours_v_id_seq";
CREATE SEQUENCE "public"."_tours_v_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for _tours_v_rels_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."_tours_v_rels_id_seq";
CREATE SEQUENCE "public"."_tours_v_rels_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for _tours_v_version_tags_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."_tours_v_version_tags_id_seq";
CREATE SEQUENCE "public"."_tours_v_version_tags_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for floors_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."floors_id_seq";
CREATE SEQUENCE "public"."floors_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for media_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."media_id_seq";
CREATE SEQUENCE "public"."media_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for payload_kv_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."payload_kv_id_seq";
CREATE SEQUENCE "public"."payload_kv_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for payload_locked_documents_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."payload_locked_documents_id_seq";
CREATE SEQUENCE "public"."payload_locked_documents_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for payload_locked_documents_rels_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."payload_locked_documents_rels_id_seq";
CREATE SEQUENCE "public"."payload_locked_documents_rels_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for payload_migrations_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."payload_migrations_id_seq";
CREATE SEQUENCE "public"."payload_migrations_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for payload_preferences_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."payload_preferences_id_seq";
CREATE SEQUENCE "public"."payload_preferences_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for payload_preferences_rels_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."payload_preferences_rels_id_seq";
CREATE SEQUENCE "public"."payload_preferences_rels_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for scenes_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."scenes_id_seq";
CREATE SEQUENCE "public"."scenes_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for tours_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."tours_id_seq";
CREATE SEQUENCE "public"."tours_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for tours_rels_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."tours_rels_id_seq";
CREATE SEQUENCE "public"."tours_rels_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for users_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."users_id_seq";
CREATE SEQUENCE "public"."users_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Table structure for _scenes_v
-- ----------------------------
DROP TABLE IF EXISTS "public"."_scenes_v";
CREATE TABLE "public"."_scenes_v" (
  "id" int4 NOT NULL DEFAULT nextval('_scenes_v_id_seq'::regclass),
  "parent_id" int4,
  "version_title" varchar COLLATE "pg_catalog"."default",
  "version_slug" varchar COLLATE "pg_catalog"."default",
  "version_floor_id" int4,
  "version_description" jsonb,
  "version_accessibility_notes" varchar COLLATE "pg_catalog"."default",
  "version_panorama_id" int4,
  "version_initial_yaw" numeric DEFAULT 0,
  "version_initial_pitch" numeric DEFAULT 0,
  "version_initial_hfov" numeric DEFAULT 120,
  "version_rotation" numeric DEFAULT 0,
  "version_updated_at" timestamptz(3),
  "version_created_at" timestamptz(3),
  "version__status" "public"."enum__scenes_v_version_status" DEFAULT 'draft'::enum__scenes_v_version_status,
  "created_at" timestamptz(3) NOT NULL DEFAULT now(),
  "updated_at" timestamptz(3) NOT NULL DEFAULT now(),
  "latest" bool
)
;

-- ----------------------------
-- Records of _scenes_v
-- ----------------------------
INSERT INTO "public"."_scenes_v" VALUES (249, 125, 'Courtyard', 'courtyard1-1', 21, NULL, NULL, 58, 90, 5, 120, 80, '2026-04-04 02:27:03.713+08', '2026-04-04 02:27:03.713+08', 'published', '2026-04-04 02:27:03.723+08', '2026-04-04 02:27:03.723+08', 'f');
INSERT INTO "public"."_scenes_v" VALUES (250, 126, 'Building Entrance', 'buildingEntrance', 21, NULL, NULL, 59, 90, 0, 120, 90, '2026-04-04 02:27:03.749+08', '2026-04-04 02:27:03.749+08', 'published', '2026-04-04 02:27:03.753+08', '2026-04-04 02:27:03.753+08', 'f');
INSERT INTO "public"."_scenes_v" VALUES (251, 127, 'Foyer 1 - Level 1', 'foyer1-1', 22, NULL, NULL, 61, 50, 0, 120, 90, '2026-04-04 02:27:03.774+08', '2026-04-04 02:27:03.774+08', 'published', '2026-04-04 02:27:03.778+08', '2026-04-04 02:27:03.778+08', 'f');
INSERT INTO "public"."_scenes_v" VALUES (252, 128, 'Foyer 2 - Level 1', 'foyer1-2', 22, NULL, NULL, 62, 200, 0, 120, 90, '2026-04-04 02:27:03.797+08', '2026-04-04 02:27:03.797+08', 'published', '2026-04-04 02:27:03.801+08', '2026-04-04 02:27:03.801+08', 'f');
INSERT INTO "public"."_scenes_v" VALUES (254, 130, '101 - Computer and Software Engineering Lab 2', '101-2', 22, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Computer and Software Engineering Lab is outfitted with high-performance computers featuring advanced NVIDIA GPUs. This lab offers students hands-on experience in cutting-edge fields such as the Internet of Things (IoT), Artificial Intelligence (AI), Software Defined Networks (SDN), and Multidimensional Signal Processing.", "type": "text"}]}]}}', NULL, 64, 60, 0, 120, 90, '2026-04-04 02:27:03.842+08', '2026-04-04 02:27:03.842+08', 'published', '2026-04-04 02:27:03.846+08', '2026-04-04 02:27:03.846+08', 'f');
INSERT INTO "public"."_scenes_v" VALUES (255, 131, '110 - Raymond Kirby Engineering on Display Lab 1', '110-1', 22, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Project Lab provides a range of common electrical benchtop instruments, catering to both catch-up coursework students and those working on projects or theses. This lab offers a supportive environment for students to experiment with their designs and enhance their practical skills.", "type": "text"}]}]}}', NULL, 65, -40, 0, 120, 90, '2026-04-04 02:27:03.867+08', '2026-04-04 02:27:03.867+08', 'published', '2026-04-04 02:27:03.872+08', '2026-04-04 02:27:03.872+08', 'f');
INSERT INTO "public"."_scenes_v" VALUES (256, 132, '110 - Raymond Kirby Engineering on Display Lab 2', '110-2', 22, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Project Lab provides a range of common electrical benchtop instruments, catering to both catch-up coursework students and those working on projects or theses. This lab offers a supportive environment for students to experiment with their designs and enhance their practical skills.", "type": "text"}]}]}}', NULL, 66, 200, 0, 120, 90, '2026-04-04 02:27:03.892+08', '2026-04-04 02:27:03.892+08', 'published', '2026-04-04 02:27:03.896+08', '2026-04-04 02:27:03.896+08', 'f');
INSERT INTO "public"."_scenes_v" VALUES (257, 133, '110 - Raymond Kirby Engineering on Display Lab 3', '110-3', 22, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Project Lab provides a range of common electrical benchtop instruments, catering to both catch-up coursework students and those working on projects or theses. This lab offers a supportive environment for students to experiment with their designs and enhance their practical skills.", "type": "text"}]}]}}', NULL, 67, 0, 0, 120, 90, '2026-04-04 02:27:03.914+08', '2026-04-04 02:27:03.914+08', 'published', '2026-04-04 02:27:03.917+08', '2026-04-04 02:27:03.917+08', 'f');
INSERT INTO "public"."_scenes_v" VALUES (258, 134, '110 - Raymond Kirby Engineering on Display Lab 4', '110-4', 22, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Project Lab provides a range of common electrical benchtop instruments, catering to both catch-up coursework students and those working on projects or theses. This lab offers a supportive environment for students to experiment with their designs and enhance their practical skills.", "type": "text"}]}]}}', NULL, 68, 50, 0, 120, 90, '2026-04-04 02:27:03.934+08', '2026-04-04 02:27:03.933+08', 'published', '2026-04-04 02:27:03.938+08', '2026-04-04 02:27:03.938+08', 'f');
INSERT INTO "public"."_scenes_v" VALUES (259, 135, '118 - Mechanical Support Lab 1', '110-5', 22, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Mechanical Support Room is a fabrication space equipped with tools such as a CNC router, laser cutter, press drill,  bench grinder, and 3D printer. It facilitates rapid prototyping, precision machining, and custom part production to support engineering and design activities.", "type": "text"}]}]}}', NULL, 69, 10, 0, 120, 90, '2026-04-04 02:27:03.955+08', '2026-04-04 02:27:03.955+08', 'published', '2026-04-04 02:27:03.959+08', '2026-04-04 02:27:03.959+08', 'f');
INSERT INTO "public"."_scenes_v" VALUES (260, 136, '118 - Mechanical Support Lab 2', '110-6', 22, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Mechanical Support Room is a fabrication space equipped with tools such as a CNC router, laser cutter, press drill,  bench grinder, and 3D printer. It facilitates rapid prototyping, precision machining, and custom part production to support engineering and design activities.", "type": "text"}]}]}}', NULL, 70, 100, 0, 120, 90, '2026-04-04 02:27:03.979+08', '2026-04-04 02:27:03.979+08', 'published', '2026-04-04 02:27:03.982+08', '2026-04-04 02:27:03.982+08', 'f');
INSERT INTO "public"."_scenes_v" VALUES (261, 137, '118 - Mechanical Support Lab 3', '110-7', 22, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Mechanical Support Room is a fabrication space equipped with tools such as a CNC router, laser cutter, press drill,  bench grinder, and 3D printer. It facilitates rapid prototyping, precision machining, and custom part production to support engineering and design activities.", "type": "text"}]}]}}', NULL, 71, -60, -20, 120, 90, '2026-04-04 02:27:04+08', '2026-04-04 02:27:04+08', 'published', '2026-04-04 02:27:04.004+08', '2026-04-04 02:27:04.004+08', 'f');
INSERT INTO "public"."_scenes_v" VALUES (262, 138, 'Foyer - Level 2', 'foyer2-1', 23, NULL, NULL, 73, 200, 0, 120, 90, '2026-04-04 02:27:04.022+08', '2026-04-04 02:27:04.022+08', 'published', '2026-04-04 02:27:04.026+08', '2026-04-04 02:27:04.026+08', 'f');
INSERT INTO "public"."_scenes_v" VALUES (263, 139, '201 - Analog and Digital Lab 1', '201-1', 23, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Analog and Digital Lab provides students with practical skills through hands-on experiments, covering fundamental principles of electronics, computer systems, circuit theories, and digital systems. This lab is designed to enhance students'' understanding and application of these core concepts, preparing them for real-world challenges in the field of electronics and computer engineering.", "type": "text"}]}]}}', NULL, 74, 0, 0, 120, 90, '2026-04-04 02:27:04.047+08', '2026-04-04 02:27:04.047+08', 'published', '2026-04-04 02:27:04.052+08', '2026-04-04 02:27:04.052+08', 'f');
INSERT INTO "public"."_scenes_v" VALUES (264, 140, '201 - Analog and Digital Lab 2', '201-2', 23, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Analog and Digital Lab provides students with practical skills through hands-on experiments, covering fundamental principles of electronics, computer systems, circuit theories, and digital systems. This lab is designed to enhance students'' understanding and application of these core concepts, preparing them for real-world challenges in the field of electronics and computer engineering.", "type": "text"}]}]}}', NULL, 75, -20, 0, 120, 90, '2026-04-04 02:27:04.07+08', '2026-04-04 02:27:04.07+08', 'published', '2026-04-04 02:27:04.074+08', '2026-04-04 02:27:04.074+08', 'f');
INSERT INTO "public"."_scenes_v" VALUES (266, 142, '210 - Electronics & Comm''s Lab 1', '210-1', 23, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Electronics and Communications Lab provides students with practical skills through hands-on experiments in RF Engineering, Communication Electronics, Antennas and Propagation, and Wireless Communications. This lab is equipped with advanced tools and equipment, allowing students to explore and understand the complexities of modern communication systems. By engaging in these experiments, students gain valuable experience in designing, testing, and optimizing electronic and communication devices, preparing them for careers in the rapidly evolving field of electronics and communications.", "type": "text"}]}]}}', NULL, 77, -1, 0, 120, 90, '2026-04-04 02:27:04.112+08', '2026-04-04 02:27:04.112+08', 'published', '2026-04-04 02:27:04.116+08', '2026-04-04 02:27:04.116+08', 'f');
INSERT INTO "public"."_scenes_v" VALUES (267, 143, '210 - Electronics & Comm''s Lab 2', '210-2', 23, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Electronics and Communications Lab provides students with practical skills through hands-on experiments in RF Engineering, Communication Electronics, Antennas and Propagation, and Wireless Communications. This lab is equipped with advanced tools and equipment, allowing students to explore and understand the complexities of modern communication systems. By engaging in these experiments, students gain valuable experience in designing, testing, and optimizing electronic and communication devices, preparing them for careers in the rapidly evolving field of electronics and communications.", "type": "text"}]}]}}', NULL, 78, 0, 0, 120, 90, '2026-04-04 02:27:04.132+08', '2026-04-04 02:27:04.132+08', 'published', '2026-04-04 02:27:04.135+08', '2026-04-04 02:27:04.135+08', 'f');
INSERT INTO "public"."_scenes_v" VALUES (268, 144, '210 - Electronics & Comm''s Lab 3', '210-3', 23, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Electronics and Communications Lab provides students with practical skills through hands-on experiments in RF Engineering, Communication Electronics, Antennas and Propagation, and Wireless Communications. This lab is equipped with advanced tools and equipment, allowing students to explore and understand the complexities of modern communication systems. By engaging in these experiments, students gain valuable experience in designing, testing, and optimizing electronic and communication devices, preparing them for careers in the rapidly evolving field of electronics and communications.", "type": "text"}]}]}}', NULL, 79, 250, 0, 120, 90, '2026-04-04 02:27:04.152+08', '2026-04-04 02:27:04.152+08', 'published', '2026-04-04 02:27:04.156+08', '2026-04-04 02:27:04.156+08', 'f');
INSERT INTO "public"."_scenes_v" VALUES (269, 145, 'Foyer 1 - Level 3', 'foyer3-1', 24, NULL, NULL, 81, 200, 0, 120, 90, '2026-04-04 02:27:04.174+08', '2026-04-04 02:27:04.173+08', 'published', '2026-04-04 02:27:04.177+08', '2026-04-04 02:27:04.177+08', 'f');
INSERT INTO "public"."_scenes_v" VALUES (270, 146, 'Foyer 2 - Level 3', 'foyer3-2', 24, NULL, NULL, 82, 200, 0, 120, 90, '2026-04-04 02:27:04.194+08', '2026-04-04 02:27:04.194+08', 'published', '2026-04-04 02:27:04.197+08', '2026-04-04 02:27:04.197+08', 'f');
INSERT INTO "public"."_scenes_v" VALUES (272, 148, '301 - Digital Systems & Comm''s Modelling 2', '301-2', 24, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Digital and Communications Systems Lab equips students with practical skills through hands-on experiments in embedded systems, digital logic (using modern FPGAs), communication systems modeling with TIMS, optical communication systems, and digital communication systems with software-defined radios. This lab is designed to provide students with a comprehensive understanding of digital and communication systems and their applications. By working with advanced tools and technologies, students gain valuable experience in designing, implementing, and testing complex digital systems, preparing them for careers in the rapidly evolving field of digital and communication technologies.", "type": "text"}]}]}}', NULL, 84, 90, -5, 120, 90, '2026-04-04 02:27:04.238+08', '2026-04-04 02:27:04.238+08', 'published', '2026-04-04 02:27:04.242+08', '2026-04-04 02:27:04.242+08', 'f');
INSERT INTO "public"."_scenes_v" VALUES (273, 149, '301 - Digital Systems & Comm''s Modelling 3', '301-3', 24, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Digital and Communications Systems Lab equips students with practical skills through hands-on experiments in embedded systems, digital logic (using modern FPGAs), communication systems modeling with TIMS, optical communication systems, and digital communication systems with software-defined radios. This lab is designed to provide students with a comprehensive understanding of digital and communication systems and their applications. By working with advanced tools and technologies, students gain valuable experience in designing, implementing, and testing complex digital systems, preparing them for careers in the rapidly evolving field of digital and communication technologies.", "type": "text"}]}]}}', NULL, 85, 200, 0, 120, 90, '2026-04-04 02:27:04.258+08', '2026-04-04 02:27:04.258+08', 'published', '2026-04-04 02:27:04.261+08', '2026-04-04 02:27:04.261+08', 'f');
INSERT INTO "public"."_scenes_v" VALUES (274, 150, '301 - Digital Systems & Comm''s Modelling 4', '301-4', 24, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Digital and Communications Systems Lab equips students with practical skills through hands-on experiments in embedded systems, digital logic (using modern FPGAs), communication systems modeling with TIMS, optical communication systems, and digital communication systems with software-defined radios. This lab is designed to provide students with a comprehensive understanding of digital and communication systems and their applications. By working with advanced tools and technologies, students gain valuable experience in designing, implementing, and testing complex digital systems, preparing them for careers in the rapidly evolving field of digital and communication technologies.", "type": "text"}]}]}}', NULL, 86, 190, -3, 120, 90, '2026-04-04 02:27:04.279+08', '2026-04-04 02:27:04.279+08', 'published', '2026-04-04 02:27:04.284+08', '2026-04-04 02:27:04.284+08', 'f');
INSERT INTO "public"."_scenes_v" VALUES (280, 125, 'Courtyard', 'courtyard1-1', 21, NULL, NULL, 58, 90, 5, 120, 80, '2026-04-04 02:27:04.447+08', '2026-04-04 02:27:03.713+08', 'published', '2026-04-04 02:27:04.472+08', '2026-04-04 02:27:04.472+08', 't');
INSERT INTO "public"."_scenes_v" VALUES (281, 126, 'Building Entrance', 'buildingEntrance', 21, NULL, NULL, 59, 90, 0, 120, 90, '2026-04-04 02:27:04.52+08', '2026-04-04 02:27:03.749+08', 'published', '2026-04-04 02:27:04.527+08', '2026-04-04 02:27:04.527+08', 't');
INSERT INTO "public"."_scenes_v" VALUES (282, 127, 'Foyer 1 - Level 1', 'foyer1-1', 22, NULL, NULL, 61, 50, 0, 120, 90, '2026-04-04 02:27:04.57+08', '2026-04-04 02:27:03.774+08', 'published', '2026-04-04 02:27:04.578+08', '2026-04-04 02:27:04.578+08', 't');
INSERT INTO "public"."_scenes_v" VALUES (283, 128, 'Foyer 2 - Level 1', 'foyer1-2', 22, NULL, NULL, 62, 200, 0, 120, 90, '2026-04-04 02:27:04.615+08', '2026-04-04 02:27:03.797+08', 'published', '2026-04-04 02:27:04.621+08', '2026-04-04 02:27:04.621+08', 't');
INSERT INTO "public"."_scenes_v" VALUES (284, 129, '101 - Computer and Software Engineering Lab 1', '101-1', 22, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Computer and Software Engineering Lab is outfitted with high-performance computers featuring advanced NVIDIA GPUs. This lab offers students hands-on experience in cutting-edge fields such as the Internet of Things (IoT), Artificial Intelligence (AI), Software Defined Networks (SDN), and Multidimensional Signal Processing.", "type": "text"}]}]}}', NULL, 63, 200, 0, 120, 90, '2026-04-04 02:27:04.665+08', '2026-04-04 02:27:03.819+08', 'published', '2026-04-04 02:27:04.672+08', '2026-04-04 02:27:04.672+08', 't');
INSERT INTO "public"."_scenes_v" VALUES (253, 129, '101 - Computer and Software Engineering Lab 1', '101-1', 22, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Computer and Software Engineering Lab is outfitted with high-performance computers featuring advanced NVIDIA GPUs. This lab offers students hands-on experience in cutting-edge fields such as the Internet of Things (IoT), Artificial Intelligence (AI), Software Defined Networks (SDN), and Multidimensional Signal Processing.", "type": "text"}]}]}}', NULL, 63, 200, 0, 120, 90, '2026-04-04 02:27:03.819+08', '2026-04-04 02:27:03.819+08', 'published', '2026-04-04 02:27:03.823+08', '2026-04-04 02:27:03.823+08', 'f');
INSERT INTO "public"."_scenes_v" VALUES (285, 130, '101 - Computer and Software Engineering Lab 2', '101-2', 22, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Computer and Software Engineering Lab is outfitted with high-performance computers featuring advanced NVIDIA GPUs. This lab offers students hands-on experience in cutting-edge fields such as the Internet of Things (IoT), Artificial Intelligence (AI), Software Defined Networks (SDN), and Multidimensional Signal Processing.", "type": "text"}]}]}}', NULL, 64, 60, 0, 120, 90, '2026-04-04 02:27:04.716+08', '2026-04-04 02:27:03.842+08', 'published', '2026-04-04 02:27:04.723+08', '2026-04-04 02:27:04.723+08', 't');
INSERT INTO "public"."_scenes_v" VALUES (286, 131, '110 - Raymond Kirby Engineering on Display Lab 1', '110-1', 22, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Project Lab provides a range of common electrical benchtop instruments, catering to both catch-up coursework students and those working on projects or theses. This lab offers a supportive environment for students to experiment with their designs and enhance their practical skills.", "type": "text"}]}]}}', NULL, 65, -40, 0, 120, 90, '2026-04-04 02:27:04.771+08', '2026-04-04 02:27:03.867+08', 'published', '2026-04-04 02:27:04.777+08', '2026-04-04 02:27:04.777+08', 't');
INSERT INTO "public"."_scenes_v" VALUES (287, 132, '110 - Raymond Kirby Engineering on Display Lab 2', '110-2', 22, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Project Lab provides a range of common electrical benchtop instruments, catering to both catch-up coursework students and those working on projects or theses. This lab offers a supportive environment for students to experiment with their designs and enhance their practical skills.", "type": "text"}]}]}}', NULL, 66, 200, 0, 120, 90, '2026-04-04 02:27:04.823+08', '2026-04-04 02:27:03.892+08', 'published', '2026-04-04 02:27:04.831+08', '2026-04-04 02:27:04.831+08', 't');
INSERT INTO "public"."_scenes_v" VALUES (276, 152, '310 - Energy and Machines Lab 2', '310-2', 24, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Energy and Machines Lab provides students with practical skills in advanced power electronics and energy systems. This includes hands-on experience with renewable energy systems and three-phase electrical machinery. The lab is designed to offer a comprehensive understanding of modern energy technologies, enabling students to design, analyze, and optimize various power and energy systems. By working with cutting-edge equipment and technologies, students are prepared for careers in the evolving field of energy engineering, focusing on sustainable and efficient energy solutions.", "type": "text"}]}]}}', NULL, 88, 160, 0, 120, 90, '2026-04-04 02:27:04.321+08', '2026-04-04 02:27:04.321+08', 'published', '2026-04-04 02:27:04.325+08', '2026-04-04 02:27:04.325+08', 'f');
INSERT INTO "public"."_scenes_v" VALUES (277, 153, '309 - RF Chamber Room 1', '309-1', 24, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The RF Chamber is a specially designed, shielded room that eliminates electromagnetic interference. It is crucial in RF engineering because electromagnetic radiation is everywhere, from both natural and artificial sources. Testing in an RF chamber ensures devices comply with communication regulations by preventing unwanted interference and avoiding regulatory violations.", "type": "text"}]}]}}', NULL, 89, 250, 0, 120, 90, '2026-04-04 02:27:04.343+08', '2026-04-04 02:27:04.343+08', 'published', '2026-04-04 02:27:04.347+08', '2026-04-04 02:27:04.347+08', 'f');
INSERT INTO "public"."_scenes_v" VALUES (278, 154, '309 - RF Chamber Room 2', '309-2', 24, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The RF Chamber is a specially designed, shielded room that eliminates electromagnetic interference. It is crucial in RF engineering because electromagnetic radiation is everywhere, from both natural and artificial sources. Testing in an RF chamber ensures devices comply with communication regulations by preventing unwanted interference and avoiding regulatory violations.", "type": "text"}]}]}}', NULL, 90, 200, 0, 120, 90, '2026-04-04 02:27:04.365+08', '2026-04-04 02:27:04.365+08', 'published', '2026-04-04 02:27:04.37+08', '2026-04-04 02:27:04.37+08', 'f');
INSERT INTO "public"."_scenes_v" VALUES (279, 155, '309 - RF Chamber Room 3', '309-3', 24, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The RF Chamber is a specially designed, shielded room that eliminates electromagnetic interference. It is crucial in RF engineering because electromagnetic radiation is everywhere, from both natural and artificial sources. Testing in an RF chamber ensures devices comply with communication regulations by preventing unwanted interference and avoiding regulatory violations.", "type": "text"}]}]}}', NULL, 91, 0, -10, 120, 90, '2026-04-04 02:27:04.39+08', '2026-04-04 02:27:04.39+08', 'published', '2026-04-04 02:27:04.394+08', '2026-04-04 02:27:04.394+08', 'f');
INSERT INTO "public"."_scenes_v" VALUES (288, 133, '110 - Raymond Kirby Engineering on Display Lab 3', '110-3', 22, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Project Lab provides a range of common electrical benchtop instruments, catering to both catch-up coursework students and those working on projects or theses. This lab offers a supportive environment for students to experiment with their designs and enhance their practical skills.", "type": "text"}]}]}}', NULL, 67, 0, 0, 120, 90, '2026-04-04 02:27:04.874+08', '2026-04-04 02:27:03.914+08', 'published', '2026-04-04 02:27:04.882+08', '2026-04-04 02:27:04.882+08', 't');
INSERT INTO "public"."_scenes_v" VALUES (289, 134, '110 - Raymond Kirby Engineering on Display Lab 4', '110-4', 22, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Project Lab provides a range of common electrical benchtop instruments, catering to both catch-up coursework students and those working on projects or theses. This lab offers a supportive environment for students to experiment with their designs and enhance their practical skills.", "type": "text"}]}]}}', NULL, 68, 50, 0, 120, 90, '2026-04-04 02:27:04.92+08', '2026-04-04 02:27:03.933+08', 'published', '2026-04-04 02:27:04.926+08', '2026-04-04 02:27:04.926+08', 't');
INSERT INTO "public"."_scenes_v" VALUES (290, 135, '118 - Mechanical Support Lab 1', '110-5', 22, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Mechanical Support Room is a fabrication space equipped with tools such as a CNC router, laser cutter, press drill,  bench grinder, and 3D printer. It facilitates rapid prototyping, precision machining, and custom part production to support engineering and design activities.", "type": "text"}]}]}}', NULL, 69, 10, 0, 120, 90, '2026-04-04 02:27:04.969+08', '2026-04-04 02:27:03.955+08', 'published', '2026-04-04 02:27:04.975+08', '2026-04-04 02:27:04.975+08', 't');
INSERT INTO "public"."_scenes_v" VALUES (291, 136, '118 - Mechanical Support Lab 2', '110-6', 22, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Mechanical Support Room is a fabrication space equipped with tools such as a CNC router, laser cutter, press drill,  bench grinder, and 3D printer. It facilitates rapid prototyping, precision machining, and custom part production to support engineering and design activities.", "type": "text"}]}]}}', NULL, 70, 100, 0, 120, 90, '2026-04-04 02:27:05.015+08', '2026-04-04 02:27:03.979+08', 'published', '2026-04-04 02:27:05.022+08', '2026-04-04 02:27:05.022+08', 't');
INSERT INTO "public"."_scenes_v" VALUES (292, 137, '118 - Mechanical Support Lab 3', '110-7', 22, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Mechanical Support Room is a fabrication space equipped with tools such as a CNC router, laser cutter, press drill,  bench grinder, and 3D printer. It facilitates rapid prototyping, precision machining, and custom part production to support engineering and design activities.", "type": "text"}]}]}}', NULL, 71, -60, -20, 120, 90, '2026-04-04 02:27:05.068+08', '2026-04-04 02:27:04+08', 'published', '2026-04-04 02:27:05.076+08', '2026-04-04 02:27:05.076+08', 't');
INSERT INTO "public"."_scenes_v" VALUES (293, 138, 'Foyer - Level 2', 'foyer2-1', 23, NULL, NULL, 73, 200, 0, 120, 90, '2026-04-04 02:27:05.121+08', '2026-04-04 02:27:04.022+08', 'published', '2026-04-04 02:27:05.128+08', '2026-04-04 02:27:05.128+08', 't');
INSERT INTO "public"."_scenes_v" VALUES (294, 139, '201 - Analog and Digital Lab 1', '201-1', 23, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Analog and Digital Lab provides students with practical skills through hands-on experiments, covering fundamental principles of electronics, computer systems, circuit theories, and digital systems. This lab is designed to enhance students'' understanding and application of these core concepts, preparing them for real-world challenges in the field of electronics and computer engineering.", "type": "text"}]}]}}', NULL, 74, 0, 0, 120, 90, '2026-04-04 02:27:05.182+08', '2026-04-04 02:27:04.047+08', 'published', '2026-04-04 02:27:05.196+08', '2026-04-04 02:27:05.196+08', 't');
INSERT INTO "public"."_scenes_v" VALUES (295, 140, '201 - Analog and Digital Lab 2', '201-2', 23, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Analog and Digital Lab provides students with practical skills through hands-on experiments, covering fundamental principles of electronics, computer systems, circuit theories, and digital systems. This lab is designed to enhance students'' understanding and application of these core concepts, preparing them for real-world challenges in the field of electronics and computer engineering.", "type": "text"}]}]}}', NULL, 75, -20, 0, 120, 90, '2026-04-04 02:27:05.243+08', '2026-04-04 02:27:04.07+08', 'published', '2026-04-04 02:27:05.25+08', '2026-04-04 02:27:05.25+08', 't');
INSERT INTO "public"."_scenes_v" VALUES (296, 141, '201 - Analog and Digital Lab 3', '201-3', 23, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Analog and Digital Lab provides students with practical skills through hands-on experiments, covering fundamental principles of electronics, computer systems, circuit theories, and digital systems. This lab is designed to enhance students'' understanding and application of these core concepts, preparing them for real-world challenges in the field of electronics and computer engineering.", "type": "text"}]}]}}', NULL, 76, 260, 0, 120, 90, '2026-04-04 02:27:05.293+08', '2026-04-04 02:27:04.09+08', 'published', '2026-04-04 02:27:05.299+08', '2026-04-04 02:27:05.299+08', 't');
INSERT INTO "public"."_scenes_v" VALUES (265, 141, '201 - Analog and Digital Lab 3', '201-3', 23, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Analog and Digital Lab provides students with practical skills through hands-on experiments, covering fundamental principles of electronics, computer systems, circuit theories, and digital systems. This lab is designed to enhance students'' understanding and application of these core concepts, preparing them for real-world challenges in the field of electronics and computer engineering.", "type": "text"}]}]}}', NULL, 76, 260, 0, 120, 90, '2026-04-04 02:27:04.09+08', '2026-04-04 02:27:04.09+08', 'published', '2026-04-04 02:27:04.094+08', '2026-04-04 02:27:04.094+08', 'f');
INSERT INTO "public"."_scenes_v" VALUES (297, 142, '210 - Electronics & Comm''s Lab 1', '210-1', 23, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Electronics and Communications Lab provides students with practical skills through hands-on experiments in RF Engineering, Communication Electronics, Antennas and Propagation, and Wireless Communications. This lab is equipped with advanced tools and equipment, allowing students to explore and understand the complexities of modern communication systems. By engaging in these experiments, students gain valuable experience in designing, testing, and optimizing electronic and communication devices, preparing them for careers in the rapidly evolving field of electronics and communications.", "type": "text"}]}]}}', NULL, 77, -1, 0, 120, 90, '2026-04-04 02:27:05.353+08', '2026-04-04 02:27:04.112+08', 'published', '2026-04-04 02:27:05.363+08', '2026-04-04 02:27:05.363+08', 't');
INSERT INTO "public"."_scenes_v" VALUES (298, 143, '210 - Electronics & Comm''s Lab 2', '210-2', 23, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Electronics and Communications Lab provides students with practical skills through hands-on experiments in RF Engineering, Communication Electronics, Antennas and Propagation, and Wireless Communications. This lab is equipped with advanced tools and equipment, allowing students to explore and understand the complexities of modern communication systems. By engaging in these experiments, students gain valuable experience in designing, testing, and optimizing electronic and communication devices, preparing them for careers in the rapidly evolving field of electronics and communications.", "type": "text"}]}]}}', NULL, 78, 0, 0, 120, 90, '2026-04-04 02:27:05.416+08', '2026-04-04 02:27:04.132+08', 'published', '2026-04-04 02:27:05.427+08', '2026-04-04 02:27:05.427+08', 't');
INSERT INTO "public"."_scenes_v" VALUES (299, 144, '210 - Electronics & Comm''s Lab 3', '210-3', 23, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Electronics and Communications Lab provides students with practical skills through hands-on experiments in RF Engineering, Communication Electronics, Antennas and Propagation, and Wireless Communications. This lab is equipped with advanced tools and equipment, allowing students to explore and understand the complexities of modern communication systems. By engaging in these experiments, students gain valuable experience in designing, testing, and optimizing electronic and communication devices, preparing them for careers in the rapidly evolving field of electronics and communications.", "type": "text"}]}]}}', NULL, 79, 250, 0, 120, 90, '2026-04-04 02:27:05.483+08', '2026-04-04 02:27:04.152+08', 'published', '2026-04-04 02:27:05.491+08', '2026-04-04 02:27:05.491+08', 't');
INSERT INTO "public"."_scenes_v" VALUES (300, 145, 'Foyer 1 - Level 3', 'foyer3-1', 24, NULL, NULL, 81, 200, 0, 120, 90, '2026-04-04 02:27:05.537+08', '2026-04-04 02:27:04.173+08', 'published', '2026-04-04 02:27:05.544+08', '2026-04-04 02:27:05.544+08', 't');
INSERT INTO "public"."_scenes_v" VALUES (301, 146, 'Foyer 2 - Level 3', 'foyer3-2', 24, NULL, NULL, 82, 200, 0, 120, 90, '2026-04-04 02:27:05.586+08', '2026-04-04 02:27:04.194+08', 'published', '2026-04-04 02:27:05.592+08', '2026-04-04 02:27:05.592+08', 't');
INSERT INTO "public"."_scenes_v" VALUES (302, 147, '301 - Digital Systems & Comm''s Modelling 1', '301-1', 24, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Digital and Communications Systems Lab equips students with practical skills through hands-on experiments in embedded systems, digital logic (using modern FPGAs), communication systems modeling with TIMS, optical communication systems, and digital communication systems with software-defined radios. This lab is designed to provide students with a comprehensive understanding of digital and communication systems and their applications. By working with advanced tools and technologies, students gain valuable experience in designing, implementing, and testing complex digital systems, preparing them for careers in the rapidly evolving field of digital and communication technologies.", "type": "text"}]}]}}', NULL, 83, 280, 0, 120, 90, '2026-04-04 02:27:05.631+08', '2026-04-04 02:27:04.216+08', 'published', '2026-04-04 02:27:05.638+08', '2026-04-04 02:27:05.638+08', 't');
INSERT INTO "public"."_scenes_v" VALUES (271, 147, '301 - Digital Systems & Comm''s Modelling 1', '301-1', 24, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Digital and Communications Systems Lab equips students with practical skills through hands-on experiments in embedded systems, digital logic (using modern FPGAs), communication systems modeling with TIMS, optical communication systems, and digital communication systems with software-defined radios. This lab is designed to provide students with a comprehensive understanding of digital and communication systems and their applications. By working with advanced tools and technologies, students gain valuable experience in designing, implementing, and testing complex digital systems, preparing them for careers in the rapidly evolving field of digital and communication technologies.", "type": "text"}]}]}}', NULL, 83, 280, 0, 120, 90, '2026-04-04 02:27:04.217+08', '2026-04-04 02:27:04.216+08', 'published', '2026-04-04 02:27:04.221+08', '2026-04-04 02:27:04.221+08', 'f');
INSERT INTO "public"."_scenes_v" VALUES (303, 148, '301 - Digital Systems & Comm''s Modelling 2', '301-2', 24, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Digital and Communications Systems Lab equips students with practical skills through hands-on experiments in embedded systems, digital logic (using modern FPGAs), communication systems modeling with TIMS, optical communication systems, and digital communication systems with software-defined radios. This lab is designed to provide students with a comprehensive understanding of digital and communication systems and their applications. By working with advanced tools and technologies, students gain valuable experience in designing, implementing, and testing complex digital systems, preparing them for careers in the rapidly evolving field of digital and communication technologies.", "type": "text"}]}]}}', NULL, 84, 90, -5, 120, 90, '2026-04-04 02:27:05.675+08', '2026-04-04 02:27:04.238+08', 'published', '2026-04-04 02:27:05.682+08', '2026-04-04 02:27:05.682+08', 't');
INSERT INTO "public"."_scenes_v" VALUES (304, 149, '301 - Digital Systems & Comm''s Modelling 3', '301-3', 24, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Digital and Communications Systems Lab equips students with practical skills through hands-on experiments in embedded systems, digital logic (using modern FPGAs), communication systems modeling with TIMS, optical communication systems, and digital communication systems with software-defined radios. This lab is designed to provide students with a comprehensive understanding of digital and communication systems and their applications. By working with advanced tools and technologies, students gain valuable experience in designing, implementing, and testing complex digital systems, preparing them for careers in the rapidly evolving field of digital and communication technologies.", "type": "text"}]}]}}', NULL, 85, 200, 0, 120, 90, '2026-04-04 02:27:05.716+08', '2026-04-04 02:27:04.258+08', 'published', '2026-04-04 02:27:05.722+08', '2026-04-04 02:27:05.722+08', 't');
INSERT INTO "public"."_scenes_v" VALUES (305, 150, '301 - Digital Systems & Comm''s Modelling 4', '301-4', 24, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Digital and Communications Systems Lab equips students with practical skills through hands-on experiments in embedded systems, digital logic (using modern FPGAs), communication systems modeling with TIMS, optical communication systems, and digital communication systems with software-defined radios. This lab is designed to provide students with a comprehensive understanding of digital and communication systems and their applications. By working with advanced tools and technologies, students gain valuable experience in designing, implementing, and testing complex digital systems, preparing them for careers in the rapidly evolving field of digital and communication technologies.", "type": "text"}]}]}}', NULL, 86, 190, -3, 120, 90, '2026-04-04 02:27:05.757+08', '2026-04-04 02:27:04.279+08', 'published', '2026-04-04 02:27:05.766+08', '2026-04-04 02:27:05.766+08', 't');
INSERT INTO "public"."_scenes_v" VALUES (306, 151, '310 - Energy and Machines Lab 1', '310-1', 24, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Energy and Machines Lab provides students with practical skills in advanced power electronics and energy systems. This includes hands-on experience with renewable energy systems and three-phase electrical machinery. The lab is designed to offer a comprehensive understanding of modern energy technologies, enabling students to design, analyze, and optimize various power and energy systems. By working with cutting-edge equipment and technologies, students are prepared for careers in the evolving field of energy engineering, focusing on sustainable and efficient energy solutions.", "type": "text"}]}]}}', NULL, 87, 200, 0, 120, 90, '2026-04-04 02:27:05.814+08', '2026-04-04 02:27:04.303+08', 'published', '2026-04-04 02:27:05.822+08', '2026-04-04 02:27:05.822+08', 't');
INSERT INTO "public"."_scenes_v" VALUES (275, 151, '310 - Energy and Machines Lab 1', '310-1', 24, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Energy and Machines Lab provides students with practical skills in advanced power electronics and energy systems. This includes hands-on experience with renewable energy systems and three-phase electrical machinery. The lab is designed to offer a comprehensive understanding of modern energy technologies, enabling students to design, analyze, and optimize various power and energy systems. By working with cutting-edge equipment and technologies, students are prepared for careers in the evolving field of energy engineering, focusing on sustainable and efficient energy solutions.", "type": "text"}]}]}}', NULL, 87, 200, 0, 120, 90, '2026-04-04 02:27:04.303+08', '2026-04-04 02:27:04.303+08', 'published', '2026-04-04 02:27:04.306+08', '2026-04-04 02:27:04.306+08', 'f');
INSERT INTO "public"."_scenes_v" VALUES (307, 152, '310 - Energy and Machines Lab 2', '310-2', 24, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Energy and Machines Lab provides students with practical skills in advanced power electronics and energy systems. This includes hands-on experience with renewable energy systems and three-phase electrical machinery. The lab is designed to offer a comprehensive understanding of modern energy technologies, enabling students to design, analyze, and optimize various power and energy systems. By working with cutting-edge equipment and technologies, students are prepared for careers in the evolving field of energy engineering, focusing on sustainable and efficient energy solutions.", "type": "text"}]}]}}', NULL, 88, 160, 0, 120, 90, '2026-04-04 02:27:05.871+08', '2026-04-04 02:27:04.321+08', 'published', '2026-04-04 02:27:05.877+08', '2026-04-04 02:27:05.877+08', 't');
INSERT INTO "public"."_scenes_v" VALUES (308, 153, '309 - RF Chamber Room 1', '309-1', 24, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The RF Chamber is a specially designed, shielded room that eliminates electromagnetic interference. It is crucial in RF engineering because electromagnetic radiation is everywhere, from both natural and artificial sources. Testing in an RF chamber ensures devices comply with communication regulations by preventing unwanted interference and avoiding regulatory violations.", "type": "text"}]}]}}', NULL, 89, 250, 0, 120, 90, '2026-04-04 02:27:05.919+08', '2026-04-04 02:27:04.343+08', 'published', '2026-04-04 02:27:05.925+08', '2026-04-04 02:27:05.925+08', 't');
INSERT INTO "public"."_scenes_v" VALUES (309, 154, '309 - RF Chamber Room 2', '309-2', 24, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The RF Chamber is a specially designed, shielded room that eliminates electromagnetic interference. It is crucial in RF engineering because electromagnetic radiation is everywhere, from both natural and artificial sources. Testing in an RF chamber ensures devices comply with communication regulations by preventing unwanted interference and avoiding regulatory violations.", "type": "text"}]}]}}', NULL, 90, 200, 0, 120, 90, '2026-04-04 02:27:05.969+08', '2026-04-04 02:27:04.365+08', 'published', '2026-04-04 02:27:05.974+08', '2026-04-04 02:27:05.974+08', 't');
INSERT INTO "public"."_scenes_v" VALUES (310, 155, '309 - RF Chamber Room 3', '309-3', 24, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The RF Chamber is a specially designed, shielded room that eliminates electromagnetic interference. It is crucial in RF engineering because electromagnetic radiation is everywhere, from both natural and artificial sources. Testing in an RF chamber ensures devices comply with communication regulations by preventing unwanted interference and avoiding regulatory violations.", "type": "text"}]}]}}', NULL, 91, 0, -10, 120, 90, '2026-04-04 02:27:06.013+08', '2026-04-04 02:27:04.39+08', 'published', '2026-04-04 02:27:06.021+08', '2026-04-04 02:27:06.021+08', 't');

-- ----------------------------
-- Table structure for _scenes_v_version_hotspots
-- ----------------------------
DROP TABLE IF EXISTS "public"."_scenes_v_version_hotspots";
CREATE TABLE "public"."_scenes_v_version_hotspots" (
  "_order" int4 NOT NULL,
  "_parent_id" int4 NOT NULL,
  "id" int4 NOT NULL DEFAULT nextval('_scenes_v_version_hotspots_id_seq'::regclass),
  "type" "public"."enum__scenes_v_version_hotspots_type",
  "pitch" numeric,
  "yaw" numeric,
  "text" varchar COLLATE "pg_catalog"."default",
  "target_scene_id" int4,
  "target_floor_id" int4,
  "info_content" jsonb,
  "css_class" varchar COLLATE "pg_catalog"."default",
  "icon_color" varchar COLLATE "pg_catalog"."default",
  "icon_size" "public"."enum__scenes_v_version_hotspots_icon_size" DEFAULT 'md'::enum__scenes_v_version_hotspots_icon_size,
  "_uuid" varchar COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Records of _scenes_v_version_hotspots
-- ----------------------------
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (1, 280, 605, 'scene', -2, 60, 'Building Entrance', 126, NULL, NULL, NULL, NULL, 'md', '69d0067823849e927c3a7454');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (1, 281, 606, 'scene', -10, 80, 'Shepherd St Building - Level 1', 127, 22, NULL, NULL, NULL, 'md', '69d0067823849e927c3a7455');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (2, 281, 607, 'scene', -5, 223, 'Courtyard', 125, NULL, NULL, NULL, NULL, 'md', '69d0067823849e927c3a7456');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (1, 282, 608, 'scene', -10, 25, 'Upstairs - Level 2', 138, 23, NULL, NULL, NULL, 'md', '69d0067823849e927c3a7457');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (2, 282, 609, 'scene', -10, 186, 'Building Entrance', 126, 21, NULL, NULL, NULL, 'md', '69d0067823849e927c3a7458');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (3, 282, 610, 'scene', -8, 280, 'Foyer 2 - Level 1', 128, NULL, NULL, NULL, NULL, 'md', '69d0067823849e927c3a7459');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (4, 282, 611, 'scene', -10, 90, '110 - Raymond Kirby Engineering on Display Lab', 131, NULL, NULL, NULL, NULL, 'md', '69d0067823849e927c3a745a');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (1, 283, 612, 'scene', -8, 175, '101 - Computer and Software Engineering Lab 1', 129, NULL, NULL, NULL, NULL, 'md', '69d0067823849e927c3a745b');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (2, 283, 613, 'scene', -20, -23, 'Foyer 1 - Level 1', 127, NULL, NULL, NULL, NULL, 'md', '69d0067823849e927c3a745c');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (1, 284, 614, 'scene', -5, -58, 'Exit to foyer', 128, NULL, NULL, NULL, NULL, 'md', '69d0067823849e927c3a745d');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (2, 284, 615, 'scene', -5, 170, '101 - Computer and Software Engineering Lab 2', 130, NULL, NULL, NULL, NULL, 'md', '69d0067823849e927c3a745e');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (3, 284, 616, 'info', -20, 220, 'High-performance computers', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "A high-performance computer equipped with a state-of-the-art NVIDIA GPU, designed to handle intensive tasks such as 3D rendering, and machine learning with exceptional speed and efficiency.", "type": "text"}]}]}}', NULL, NULL, 'md', '69d0067823849e927c3a745f');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (4, 284, 617, 'info', -7, 180, 'Group desks', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "A designated area for project work and group discussions to facilitate effective teamwork and communication.", "type": "text"}]}]}}', NULL, NULL, 'md', '69d0067823849e927c3a7460');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (1, 285, 618, 'scene', 0, 0, 'Exit to foyer', 128, NULL, NULL, NULL, NULL, 'md', '69d0067823849e927c3a7461');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (2, 285, 619, 'scene', -7, 73, '101 - Computer and Software Engineering Lab 1', 129, NULL, NULL, NULL, NULL, 'md', '69d0067823849e927c3a7462');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (3, 285, 620, 'info', -10, 30, 'Group desks', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "A designated area for project work and group discussions to facilitate effective teamwork and communication.", "type": "text"}]}]}}', NULL, NULL, 'md', '69d0067823849e927c3a7463');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (1, 286, 621, 'scene', -10, 50, 'Exit to foyer', 127, NULL, NULL, NULL, NULL, 'md', '69d0067823849e927c3a7464');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (2, 286, 622, 'scene', -18, -22, '110 - Raymond Kirby Engineering on Display Lab 2', 132, NULL, NULL, NULL, NULL, 'md', '69d0067823849e927c3a7465');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (3, 286, 623, 'scene', -3, 188, '110 - Raymond Kirby Engineering on Display Lab 3', 133, NULL, NULL, NULL, NULL, 'md', '69d0067823849e927c3a7466');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (4, 286, 624, 'scene', -25, 230, '110 - Raymond Kirby Engineering on Display Lab 4', 134, NULL, NULL, NULL, NULL, 'md', '69d0067823849e927c3a7467');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (5, 286, 625, 'scene', -3, 260, '118 - Mechanical Support Lab 1', 135, NULL, NULL, NULL, NULL, 'md', '69d0067823849e927c3a7468');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (6, 286, 626, 'info', -3, 290, 'Storage Area', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "A storage area for common electronics consumables and microchips.", "type": "text"}]}]}}', NULL, NULL, 'md', '69d0067823849e927c3a7469');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (7, 286, 627, 'info', -15, 280, 'Collaborative Workbench', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "A designated area with a collaborative and flexiable workbench for supporting various types of students'' project work.", "type": "text"}]}]}}', NULL, NULL, 'md', '69d0067823849e927c3a746a');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (8, 286, 628, 'info', -5, -10, 'Soldering and rework station', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "A soldering and rework station is used for precise soldering, desoldering, and repairing electronic components, ensuring reliable connections and efficient rework of circuit boards.", "type": "text"}]}]}}', NULL, NULL, 'md', '69d0067823849e927c3a746b');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (1, 287, 629, 'scene', 0, 0, 'Exit to foyer', 127, NULL, NULL, NULL, NULL, 'md', '69d0067823849e927c3a746c');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (2, 287, 630, 'scene', -18, 150, '110 - Raymond Kirby Engineering on Display Lab 1', 131, NULL, NULL, NULL, NULL, 'md', '69d0067823849e927c3a746d');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (3, 287, 631, 'info', -3, 220, 'Mechanical Support Room', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Mechanical Support Room is equipped with a benchtop drill, a laser cutter, a CNC router, and various other tools to assist with projects", "type": "text"}]}]}}', NULL, NULL, 'md', '69d0067823849e927c3a746e');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (4, 287, 632, 'info', -8, 230, 'Storage Area', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "A storage area for common electronics consumables and microchips.", "type": "text"}]}]}}', NULL, NULL, 'md', '69d0067823849e927c3a746f');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (5, 287, 633, 'info', -8, 70, 'Soldering and rework station', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "A soldering and rework station is used for precise soldering, desoldering, and repairing electronic components, ensuring reliable connections and efficient rework of circuit boards.", "type": "text"}]}]}}', NULL, NULL, 'md', '69d0067823849e927c3a7470');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (1, 288, 634, 'scene', 0, 0, 'Exit to foyer', 128, NULL, NULL, NULL, NULL, 'md', '69d0067823849e927c3a7471');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (2, 288, 635, 'scene', -18, 60, '110 - Raymond Kirby Engineering on Display Lab 1', 131, NULL, NULL, NULL, NULL, 'md', '69d0067823849e927c3a7472');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (3, 288, 636, 'scene', -18, -50, '110 - Raymond Kirby Engineering on Display Lab 4', 134, NULL, NULL, NULL, NULL, 'md', '69d0067823849e927c3a7473');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (4, 288, 637, 'info', -12, 15, 'DC (Direct Current) Power Supply', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "A DC (Direct Current) power supply is an essential piece of equipment in an electronics lab. It provides a constant voltage or current to power electronic circuits and devices. The voltage outputs can be adjusted as needed.", "type": "text"}]}]}}', NULL, NULL, 'md', '69d0067823849e927c3a7474');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (5, 288, 638, 'info', -12, 36, 'Oscilloscope', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "An oscilloscope is a valuable tool for analyzing both analog and digital signals. It enables students and staff to quickly identify and troubleshoot issues in complex designs.", "type": "text"}]}]}}', NULL, NULL, 'md', '69d0067823849e927c3a7475');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (6, 288, 639, 'info', -2, 28, 'Function Generator', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "A function generator can provide reconfigurable testing of electronics devices and common modulated signals, allowing for comprehensive investigation alongside digital electronics and systems.", "type": "text"}]}]}}', NULL, NULL, 'md', '69d0067823849e927c3a7476');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (7, 288, 640, 'info', -13, 28, 'Digital Multimeter', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "A digital multimeter is used to measure common electrical variables, including voltage (volts), current (amps), and resistance (ohms).", "type": "text"}]}]}}', NULL, NULL, 'md', '69d0067823849e927c3a7477');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (1, 289, 641, 'scene', 0, 0, 'Exit to foyer', 128, NULL, NULL, NULL, NULL, 'md', '69d0067823849e927c3a7478');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (2, 289, 642, 'scene', -18, 60, '110 - Raymond Kirby Engineering on Display Lab 1', 131, NULL, NULL, NULL, NULL, 'md', '69d0067823849e927c3a7479');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (3, 289, 643, 'scene', -25, 150, '110 - Raymond Kirby Engineering on Display Lab 3', 133, NULL, NULL, NULL, NULL, 'md', '69d0067823849e927c3a747a');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (4, 289, 644, 'scene', -5, -50, '118 - Mechanical Support Lab 1', 135, NULL, NULL, NULL, NULL, 'md', '69d0067823849e927c3a747b');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (1, 290, 645, 'scene', 0, 0, 'Exit to foyer', 128, NULL, NULL, NULL, NULL, 'md', '69d0067823849e927c3a747c');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (2, 290, 646, 'scene', -5, 95, '110 - Raymond Kirby Engineering on Display Lab 4', 134, NULL, NULL, NULL, NULL, 'md', '69d0067823849e927c3a747d');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (3, 290, 647, 'scene', -25, 20, '118 - Mechanical Support Lab 2', 136, NULL, NULL, NULL, NULL, 'md', '69d0067823849e927c3a747e');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (4, 290, 648, 'scene', -25, -20, '118 - Mechanical Support Lab 3', 137, NULL, NULL, NULL, NULL, 'md', '69d0067823849e927c3a747f');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (5, 290, 649, 'info', -2, -40, 'CNC Router', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Carbide 3D Shapeoko 5 Pro is a precision CNC router built for demanding hobbyists and light industrial applications. It has a rigid motion system with advanced linear components and is designed to deliver consistent, high-quality results across various materials, including wood, plastics, and soft metals.", "type": "text"}]}]}}', NULL, NULL, 'md', '69d0067823849e927c3a7480');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (6, 290, 650, 'info', -2, 40, 'Laser Cutter', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Thunder Laser Thunder Bolt is a compact desktop laser cutter and engraver engineered for high-speed, high-detail work. It uses a professional-grade laser source to produce clean, accurate engravings and light cuts on materials like wood, acrylic, and leather.", "type": "text"}]}]}}', NULL, NULL, 'md', '69d0067823849e927c3a7481');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (7, 290, 651, 'info', -2, 140, '3D Printer', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Bambu Lab X1E is a professional 3D printer for advanced material printing and high-throughput prototyping. With a reinforced motion system, actively controlled chamber environment, and support for engineering-grade filaments, it offers consistent performance for users working with complex parts and demanding materials.", "type": "text"}]}]}}', NULL, NULL, 'md', '69d0067823849e927c3a7482');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (1, 291, 652, 'scene', 0, 0, 'Exit to foyer', 128, NULL, NULL, NULL, NULL, 'md', '69d0067923849e927c3a7483');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (2, 291, 653, 'scene', -30, 210, '118 - Mechanical Support Lab 1', 135, NULL, NULL, NULL, NULL, 'md', '69d0067923849e927c3a7484');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (3, 291, 654, 'scene', -35, -70, '118 - Mechanical Support Lab 3', 137, NULL, NULL, NULL, NULL, 'md', '69d0067923849e927c3a7485');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (4, 291, 655, 'info', -2, -100, 'CNC Router', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Carbide 3D Shapeoko 5 Pro is a precision CNC router built for demanding hobbyists and light industrial applications. It has a rigid motion system with advanced linear components and is designed to deliver consistent, high-quality results across various materials, including wood, plastics, and soft metals.", "type": "text"}]}]}}', NULL, NULL, 'md', '69d0067923849e927c3a7486');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (5, 291, 656, 'info', -20, 170, 'Laser Cutter', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Thunder Laser Thunder Bolt is a compact desktop laser cutter and engraver engineered for high-speed, high-detail work. It uses a professional-grade laser source to produce clean, accurate engravings and light cuts on materials like wood, acrylic, and leather.", "type": "text"}]}]}}', NULL, NULL, 'md', '69d0067923849e927c3a7487');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (6, 291, 657, 'info', -2, 190, '3D Printer', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Bambu Lab X1E is a professional 3D printer for advanced material printing and high-throughput prototyping. With a reinforced motion system, actively controlled chamber environment, and support for engineering-grade filaments, it offers consistent performance for users working with complex parts and demanding materials.", "type": "text"}]}]}}', NULL, NULL, 'md', '69d0067923849e927c3a7488');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (1, 292, 658, 'scene', 0, 0, 'Exit to foyer', 128, NULL, NULL, NULL, NULL, 'md', '69d0067923849e927c3a7489');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (2, 292, 659, 'scene', -20, 150, '118 - Mechanical Support Lab 1', 135, NULL, NULL, NULL, NULL, 'md', '69d0067923849e927c3a748a');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (3, 292, 660, 'scene', -30, 90, '118 - Mechanical Support Lab 2', 136, NULL, NULL, NULL, NULL, 'md', '69d0067923849e927c3a748b');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (4, 292, 661, 'info', -2, -160, 'CNC Router', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Carbide 3D Shapeoko 5 Pro is a precision CNC router built for demanding hobbyists and light industrial applications. It has a rigid motion system with advanced linear components and is designed to deliver consistent, high-quality results across various materials, including wood, plastics, and soft metals.", "type": "text"}]}]}}', NULL, NULL, 'md', '69d0067923849e927c3a748c');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (5, 292, 662, 'info', -2, 100, 'Laser Cutter', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Thunder Laser Thunder Bolt is a compact desktop laser cutter and engraver engineered for high-speed, high-detail work. It uses a professional-grade laser source to produce clean, accurate engravings and light cuts on materials like wood, acrylic, and leather.", "type": "text"}]}]}}', NULL, NULL, 'md', '69d0067923849e927c3a748d');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (6, 292, 663, 'info', -2, 150, '3D Printer', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Bambu Lab X1E is a professional 3D printer for advanced material printing and high-throughput prototyping. With a reinforced motion system, actively controlled chamber environment, and support for engineering-grade filaments, it offers consistent performance for users working with complex parts and demanding materials.", "type": "text"}]}]}}', NULL, NULL, 'md', '69d0067923849e927c3a748e');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (1, 293, 664, 'scene', -10, -100, 'Upstairs - Level 3', 145, 24, NULL, NULL, NULL, 'md', '69d0067923849e927c3a748f');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (2, 293, 665, 'scene', -13, -65, 'Downstairs - Level 1', 127, 22, NULL, NULL, NULL, 'md', '69d0067923849e927c3a7490');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (3, 293, 666, 'scene', -6, 170, '201 - Analog and Digital Lab 1', 139, NULL, NULL, NULL, NULL, 'md', '69d0067923849e927c3a7491');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (4, 293, 667, 'scene', -5, -26, '210 - Electronics and Comms Lab 1', 142, NULL, NULL, NULL, NULL, 'md', '69d0067923849e927c3a7492');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (1, 294, 668, 'scene', -8, 195, 'Exit to foyer', 138, NULL, NULL, NULL, NULL, 'md', '69d0067923849e927c3a7493');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (2, 294, 669, 'scene', -8, -26, '201 - Analog and Digital Lab 2', 140, NULL, NULL, NULL, NULL, 'md', '69d0067923849e927c3a7494');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (3, 294, 670, 'scene', -3, 8, '201 - Analog and Digital Lab 3', 141, NULL, NULL, NULL, NULL, 'md', '69d0067923849e927c3a7495');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (4, 294, 671, 'info', -10, -10, 'Assorted test leads and hook-up cables', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "Assorted test leads and hook-up cables are used to establish temporary or permanent connections between electronic components, devices, and testing equipment. ", "type": "text"}]}]}}', NULL, NULL, 'md', '69d0067923849e927c3a7496');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (1, 295, 672, 'scene', 0, 0, 'Exit to foyer', 138, NULL, NULL, NULL, NULL, 'md', '69d0067923849e927c3a7497');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (2, 295, 673, 'scene', -7, 50, '201 - Analog and Digital Lab 1', 139, NULL, NULL, NULL, NULL, 'md', '69d0067923849e927c3a7498');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (3, 295, 674, 'scene', -10, -120, '201 - Analog and Digital Lab 3', 141, NULL, NULL, NULL, NULL, 'md', '69d0067923849e927c3a7499');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (4, 295, 675, 'info', 2, -63, 'DC (Direct Current) Power Supply', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "A DC (Direct Current) power supply is an essential piece of equipment in an electronics lab. It provides a constant voltage or current to power electronic circuits and devices. The voltage outputs can be adjusted as needed.", "type": "text"}]}]}}', NULL, NULL, 'md', '69d0067923849e927c3a749a');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (5, 295, 676, 'info', 2, -50, 'Digital Multimeter', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "A digital multimeter is used to measure common electrical variables, including voltage (volts), current (amps), and resistance (ohms).", "type": "text"}]}]}}', NULL, NULL, 'md', '69d0067923849e927c3a749b');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (6, 295, 677, 'info', 10, -30, 'Oscilloscope', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "An oscilloscope is a valuable tool for analyzing both analog and digital signals. It enables students and staff to quickly identify and troubleshoot issues in complex designs.", "type": "text"}]}]}}', NULL, NULL, 'md', '69d0067923849e927c3a749c');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (7, 295, 678, 'info', 15, -50, 'Function Generator', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "A function generator can provide reconfigurable testing of electronics devices and common modulated signals, allowing for comprehensive investigation alongside digital electronics and systems.", "type": "text"}]}]}}', NULL, NULL, 'md', '69d0067923849e927c3a749d');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (8, 295, 679, 'info', -23, -48, 'NI ELVIS II prototyping platform', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The NI ELVIS II prototyping platform is a modular educational laboratory device that integrates commonly used instruments, including an oscilloscope, digital multimeter, function generator, variable power supply, and Bode analyzer. Students can connect a PC to these instruments via USB plug-and-play capabilities and build circuits on a detachable protoboard.", "type": "text"}]}]}}', NULL, NULL, 'md', '69d0067923849e927c3a749e');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (1, 296, 680, 'scene', 0, 0, 'Exit to foyer', 138, NULL, NULL, NULL, NULL, 'md', '69d0067923849e927c3a749f');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (2, 296, 681, 'scene', 0, 275, '201 - Analog and Digital Lab 1', 139, NULL, NULL, NULL, NULL, 'md', '69d0067923849e927c3a74a0');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (3, 296, 682, 'scene', -2, -50, '201 - Analog and Digital Lab 2', 140, NULL, NULL, NULL, NULL, 'md', '69d0067923849e927c3a74a1');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (4, 296, 683, 'info', -10, -60, 'Assorted test leads and hook-up cables', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "Assorted test leads and hook-up cables are used to establish temporary or permanent connections between electronic components, devices, and testing equipment. ", "type": "text"}]}]}}', NULL, NULL, 'md', '69d0067923849e927c3a74a2');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (5, 296, 684, 'info', -20, -10, 'Robotics Maze', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "A Robotics Maze is a specially designed area where robots can navigate through a series of paths and obstacles. It''s used for testing and developing robotic algorithms, particularly those related to navigation, obstacle avoidance, and autonomous decision-making", "type": "text"}]}]}}', NULL, NULL, 'md', '69d0067923849e927c3a74a3');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (6, 296, 685, 'info', 5, 5, 'Storage Cupboards', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The cupboard storage contains all the items (e.g. devices, consumables, PCB boards and parts) needed to support individual UoS.", "type": "text"}]}]}}', NULL, NULL, 'md', '69d0067923849e927c3a74a4');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (1, 297, 686, 'scene', 0, 0, 'Exit to foyer', 138, NULL, NULL, NULL, NULL, 'md', '69d0067923849e927c3a74a5');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (2, 297, 687, 'scene', -20, 90, '210 - Electronics & Comm''s Lab 2', 143, NULL, NULL, NULL, NULL, 'md', '69d0067923849e927c3a74a6');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (3, 297, 688, 'scene', -10, 220, '210 - Electronics & Comm''s Lab  3', 144, NULL, NULL, NULL, NULL, 'md', '69d0067923849e927c3a74a7');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (4, 297, 689, 'info', -12, -6, 'DC (Direct Current) Power Supply', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "A DC (Direct Current) power supply is an essential piece of equipment in an electronics lab. It provides a constant voltage or current to power electronic circuits and devices. The voltage outputs can be adjusted as needed.", "type": "text"}]}]}}', NULL, NULL, 'md', '69d0067923849e927c3a74a8');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (5, 297, 690, 'info', -1, 20, 'Oscilloscope', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "An oscilloscope is a valuable tool for analyzing both analog and digital signals. It enables students and staff to quickly identify and troubleshoot issues in complex designs.", "type": "text"}]}]}}', NULL, NULL, 'md', '69d0067923849e927c3a74a9');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (6, 297, 691, 'info', -13, 5, 'Function Generator', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "A function generator can provide reconfigurable testing of electronics devices and common modulated signals, allowing for comprehensive investigation alongside digital electronics and systems.", "type": "text"}]}]}}', NULL, NULL, 'md', '69d0067923849e927c3a74aa');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (7, 297, 692, 'info', -1, 5, 'Digital Multimeter', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "A digital multimeter is used to measure common electrical variables, including voltage (volts), current (amps), and resistance (ohms).", "type": "text"}]}]}}', NULL, NULL, 'md', '69d0067923849e927c3a74ab');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (8, 297, 693, 'info', -1, -18, 'Spectrum Analyzer', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "A spectrum analyzer is a device that measures and displays the frequency spectrum of electrical signals. It shows the magnitude of an input signal across the instrument''s entire frequency range. This enables users to observe the power of both known and unknown signals, identify dominant frequencies, and analyze other spectral components", "type": "text"}]}]}}', NULL, NULL, 'md', '69d0067923849e927c3a74ac');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (9, 297, 694, 'info', -5, -80, 'Cupboard Storage', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The cupboard storage contains all the items (e.g. PCB boards, devices, consumables, and parts) needed to support individual UoS.", "type": "text"}]}]}}', NULL, NULL, 'md', '69d0067923849e927c3a74ad');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (10, 297, 695, 'info', -5, 65, 'Cupboard Storage', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The cupboard storage contains all the items (e.g. PCB boards, devices, consumables, and parts) needed to support individual UoS.", "type": "text"}]}]}}', NULL, NULL, 'md', '69d0067923849e927c3a74ae');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (1, 298, 696, 'scene', -10, 62, 'Exit to foyer', 138, NULL, NULL, NULL, NULL, 'md', '69d0067923849e927c3a74af');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (2, 298, 697, 'scene', -20, 0, '210 - Electronics & Comm''s Lab 1', 142, NULL, NULL, NULL, NULL, 'md', '69d0067923849e927c3a74b0');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (3, 298, 698, 'scene', 0, -60, '210 - Electronics & Comm''s Lab 3', 144, NULL, NULL, NULL, NULL, 'md', '69d0067923849e927c3a74b1');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (4, 298, 699, 'info', -15, -15, 'Assorted test leads and hook-up cables', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "Assorted test leads and hook-up cables are used to establish temporary or permanent connections between electronic components, devices, and testing equipment. ", "type": "text"}]}]}}', NULL, NULL, 'md', '69d0067923849e927c3a74b2');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (5, 298, 700, 'info', -10, 25, 'Assorted test leads and hook-up cables', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "Assorted test leads and hook-up cables are used to establish temporary or permanent connections between electronic components, devices, and testing equipment. ", "type": "text"}]}]}}', NULL, NULL, 'md', '69d0067923849e927c3a74b3');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (1, 299, 701, 'scene', 0, 0, 'Exit to foyer', 138, NULL, NULL, NULL, NULL, 'md', '69d0067923849e927c3a74b4');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (2, 299, 702, 'scene', -15, 232, '201 - Electronics & Comm''s Lab 1', 142, NULL, NULL, NULL, NULL, 'md', '69d0067923849e927c3a74b5');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (3, 299, 703, 'scene', -5, 280, '201 - Electronics & Comm''s Labs 2', 143, NULL, NULL, NULL, NULL, 'md', '69d0067923849e927c3a74b6');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (4, 299, 704, 'info', -10, 250, 'Assorted test leads and hook-up cables', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "Assorted test leads and hook-up cables are used to establish temporary or permanent connections between electronic components, devices, and testing equipment. ", "type": "text"}]}]}}', NULL, NULL, 'md', '69d0067923849e927c3a74b7');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (1, 300, 705, 'scene', -25, 195, 'Downstairs - Level 2', 138, 23, NULL, NULL, NULL, 'md', '69d0067923849e927c3a74b8');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (2, 300, 706, 'scene', -10, 73, 'Foyer 2 - Level 3', 146, NULL, NULL, NULL, NULL, 'md', '69d0067923849e927c3a74b9');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (3, 300, 707, 'scene', -10, 243, '310 - Energy and Machines Lab 1', 151, NULL, NULL, NULL, NULL, 'md', '69d0067923849e927c3a74ba');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (1, 301, 708, 'scene', -10, 25, 'Foyer 1 - Level 3', 145, NULL, NULL, NULL, NULL, 'md', '69d0067923849e927c3a74bb');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (2, 301, 709, 'scene', -10, 225, '301 - Digital Systems & Comm''s Modelling 1', 147, NULL, NULL, NULL, NULL, 'md', '69d0067923849e927c3a74bc');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (3, 301, 710, 'scene', -5, -8, '309 - RF Chamber Room 1', 153, NULL, NULL, NULL, NULL, 'md', '69d0067923849e927c3a74bd');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (1, 302, 711, 'scene', -10, 75, 'Exit to foyer', 146, NULL, NULL, NULL, NULL, 'md', '69d0067923849e927c3a74be');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (2, 302, 712, 'scene', -25, 190, '301 - Digital Systems & Comm''s Modelling 2', 148, NULL, NULL, NULL, NULL, 'md', '69d0067923849e927c3a74bf');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (3, 302, 713, 'scene', 5, 295, '301 - Digital Systems & Comm''s Modelling 3', 149, NULL, NULL, NULL, NULL, 'md', '69d0067923849e927c3a74c0');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (4, 302, 714, 'scene', -7, 273, '301 - Digital Systems & Comm''s Modelling 4', 150, NULL, NULL, NULL, NULL, 'md', '69d0067923849e927c3a74c1');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (1, 303, 715, 'scene', 0, 0, 'Exit to foyer', 146, NULL, NULL, NULL, NULL, 'md', '69d0067923849e927c3a74c2');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (2, 303, 716, 'scene', -20, 0, '301 - Digital Systems & Comm''s Modelling 1', 147, NULL, NULL, NULL, NULL, 'md', '69d0067923849e927c3a74c3');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (3, 303, 717, 'info', -15, 90, 'Soldering and rework station', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "A soldering and rework station is used for precise soldering, desoldering, and repairing electronic components, ensuring reliable connections and efficient rework of circuit boards.", "type": "text"}]}]}}', NULL, NULL, 'md', '69d0067923849e927c3a74c4');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (1, 304, 718, 'scene', 0, 0, 'Exit to foyer', 146, NULL, NULL, NULL, NULL, 'md', '69d0067923849e927c3a74c5');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (2, 304, 719, 'scene', 0, -110, '301 - Digital Systems & Comm''s Modelling 1', 147, NULL, NULL, NULL, NULL, 'md', '69d0067923849e927c3a74c6');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (3, 304, 720, 'scene', -10, -85, '301 - Digital Systems & Comm''s Modelling 4', 150, NULL, NULL, NULL, NULL, 'md', '69d0067923849e927c3a74c7');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (4, 304, 721, 'info', -20, -60, 'Group Desks', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "A designated area for project work and group discussions to facilitate effective teamwork and communication.", "type": "text"}]}]}}', NULL, NULL, 'md', '69d0067923849e927c3a74c8');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (5, 304, 722, 'info', 0, -50, 'Storage Cupboards', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The cupboard storage contains all the items (e.g. devices, consumables, TIMS cards and parts) needed to support individual UoS.", "type": "text"}]}]}}', NULL, NULL, 'md', '69d0067923849e927c3a74c9');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (1, 305, 723, 'scene', 0, 0, 'Exit to foyer', 146, NULL, NULL, NULL, NULL, 'md', '69d0067923849e927c3a74ca');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (2, 305, 724, 'scene', -8, 85, '301 - Digital Systems & Comm''s Modelling 1', 147, NULL, NULL, NULL, NULL, 'md', '69d0067923849e927c3a74cb');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (3, 305, 725, 'scene', -15, -5, '301 - Digital Systems & Comm''s Modelling 3', 149, NULL, NULL, NULL, NULL, 'md', '69d0067923849e927c3a74cc');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (4, 305, 726, 'info', -15, 156, 'TIMS (Telecommunications Modelling System)', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "TIMS is a telecommunications modelling system. It models mathematical equations representing electrical signals, or block diagrams representing telecommunications systems. Physically, TIMS is a dual rack system. The top rack accepts up to 12 Eurocard sized, compatible ''black boxes'', or modules. The lower rack houses a number of fixed modules, as well as the system power supply. Modules are patched together via the front panel sockets using interconnecting leads, to model the system under investigation.", "type": "text"}]}]}}', NULL, NULL, 'md', '69d0067923849e927c3a74cd');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (5, 305, 727, 'info', -10, -30, 'Group Desks', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "A designated area for project work and group discussions to facilitate effective teamwork and communication.", "type": "text"}]}]}}', NULL, NULL, 'md', '69d0067923849e927c3a74ce');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (6, 305, 728, 'info', 2, 140, 'DC (Direct Current) Power Supply', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "A DC (Direct Current) power supply is an essential piece of equipment in an electronics lab. It provides a constant voltage or current to power electronic circuits and devices. The voltage outputs can be adjusted as needed.", "type": "text"}]}]}}', NULL, NULL, 'md', '69d0067923849e927c3a74cf');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (7, 305, 729, 'info', 20, 160, 'Oscilloscope', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "An oscilloscope is a valuable tool for analyzing both analog and digital signals. It enables students and staff to quickly identify and troubleshoot issues in complex designs.", "type": "text"}]}]}}', NULL, NULL, 'md', '69d0067923849e927c3a74d0');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (8, 305, 730, 'info', 17, 185, 'Function Generator', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "A function generator can provide reconfigurable testing of electronics devices and common modulated signals, allowing for comprehensive investigation alongside digital electronics and systems.", "type": "text"}]}]}}', NULL, NULL, 'md', '69d0067923849e927c3a74d1');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (9, 305, 731, 'info', 18, 140, 'Digital Multimeter', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "A digital multimeter is used to measure common electrical variables, including voltage (volts), current (amps), and resistance (ohms).", "type": "text"}]}]}}', NULL, NULL, 'md', '69d0067923849e927c3a74d2');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (1, 306, 732, 'scene', -6, -45, 'Exit to foyer', 145, NULL, NULL, NULL, NULL, 'md', '69d0067923849e927c3a74d3');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (2, 306, 733, 'scene', -15, 110, '310 - Energy and Machines Lab 1', 152, NULL, NULL, NULL, NULL, 'md', '69d0067923849e927c3a74d4');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (3, 306, 734, 'info', 3, 190, 'Advanced testing instruments', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "Each workbench is equipped with advanced testing instruments, including Tektronix oscilloscopes, multi-channel function generators, high-capacity DC power supply units, and Tektronix current probes. These tools are essential for supporting the teaching of various units of study in electrical engineering and power engineering. The lab provides a comprehensive environment for students to gain hands-on experience with cutting-edge equipment, enhancing their practical skills and understanding of complex electrical and power systems.", "type": "text"}]}]}}', NULL, NULL, 'md', '69d0067923849e927c3a74d5');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (4, 306, 735, 'info', 8, 230, 'Labvolt modules', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "Lab 310 is equipped with a comprehensive range of Labvolt modules, covering areas from power electronics and renewable energy to three-phase electrical machinery. This includes IGBT inverters, thyristors, rectifiers, batteries, and DC, induction, and synchronous machines.", "type": "text"}]}]}}', NULL, NULL, 'md', '69d0067923849e927c3a74d6');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (5, 306, 736, 'info', -2, 255, 'Test leads and hook-up cables', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "Assorted test leads and hook-up cables are used to establish temporary or permanent connections between electronic components, devices, and testing equipment.", "type": "text"}]}]}}', NULL, NULL, 'md', '69d0067923849e927c3a74d7');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (1, 307, 737, 'scene', 0, 0, 'Exit to foyer', 145, NULL, NULL, NULL, NULL, 'md', '69d0067923849e927c3a74d8');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (2, 307, 738, 'scene', -6, 143, '310 - Energy and Machines Lab 1', 151, NULL, NULL, NULL, NULL, 'md', '69d0067923849e927c3a74d9');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (3, 307, 739, 'info', -30, 150, 'Group Desks', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "A designated area for project work and group discussions to facilitate effective teamwork and communication.", "type": "text"}]}]}}', NULL, NULL, 'md', '69d0067923849e927c3a74da');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (1, 308, 740, 'scene', -15, 125, 'Exit to foyer', 146, NULL, NULL, NULL, NULL, 'md', '69d0067923849e927c3a74db');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (2, 308, 741, 'scene', -15, 290, '309 - RF Chamber Room 2', 154, NULL, NULL, NULL, NULL, 'md', '69d0067923849e927c3a74dc');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (3, 308, 742, 'info', -10, 275, '309 - RF Chamber', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The RF Chamber is a specially designed, shielded room that eliminates electromagnetic interference. Its interior is lined with materials that absorb radiation, creating a controlled environment for precise testing and measurement of radio frequency (RF) devices. This chamber allows for rigorous testing of RF emissions, immunity, and other RF-related characteristics.", "type": "text"}]}]}}', NULL, NULL, 'md', '69d0067923849e927c3a74dd');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (4, 308, 743, 'info', 2, 226, 'Signal Analyzer', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "Used for analyzing the performance and characteristics of RF signals.", "type": "text"}]}]}}', NULL, NULL, 'md', '69d0067923849e927c3a74de');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (5, 308, 744, 'info', -6, 226, 'Vector Network Analyzer', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "Measures the network characteristics of RF devices, enabling a detailed analysis of performance.", "type": "text"}]}]}}', NULL, NULL, 'md', '69d0067923849e927c3a74df');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (6, 308, 745, 'info', -14, 236, 'Vector Signal Generator', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "Generates high-quality signals for testing and analysis.", "type": "text"}]}]}}', NULL, NULL, 'md', '69d0067923849e927c3a74e0');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (1, 309, 746, 'scene', 0, 0, 'Exit to foyer', 146, NULL, NULL, NULL, NULL, 'md', '69d0067923849e927c3a74e1');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (2, 309, 747, 'scene', -20, 153, '309 - RF Chamber Room 1', 153, NULL, NULL, NULL, NULL, 'md', '69d0067923849e927c3a74e2');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (3, 309, 748, 'scene', -15, 210, '309 - RF Chamber Room 3', 155, NULL, NULL, NULL, NULL, 'md', '69d0067923849e927c3a74e3');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (4, 309, 749, 'info', -10, 225, 'Antenna Mast', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The antenna mast is a structure that supports and positions antennas at various heights and angles within the RF chamber.", "type": "text"}]}]}}', NULL, NULL, 'md', '69d0067923849e927c3a74e4');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (5, 309, 750, 'info', -35, 225, 'DUT Table', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The DUT table is a platform where the device under test is placed during measurements. It is typically made of non-conductive materials to avoid interference with the RF signals.", "type": "text"}]}]}}', NULL, NULL, 'md', '69d0067923849e927c3a74e5');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (1, 310, 751, 'scene', 0, 0, 'Exit to foyer', 146, NULL, NULL, NULL, NULL, 'md', '69d0067a23849e927c3a74e6');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (2, 310, 752, 'scene', -10, 55, '309 - RF Chamber Room 1', 153, NULL, NULL, NULL, NULL, 'md', '69d0067a23849e927c3a74e7');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (3, 310, 753, 'scene', -15, 35, '309 - RF Chamber Room 2', 154, NULL, NULL, NULL, NULL, 'md', '69d0067a23849e927c3a74e8');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (4, 310, 754, 'info', -10, -30, 'Antenna Mast', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The antenna mast is a structure that supports and positions antennas at various heights and angles within the RF chamber.", "type": "text"}]}]}}', NULL, NULL, 'md', '69d0067a23849e927c3a74e9');
INSERT INTO "public"."_scenes_v_version_hotspots" VALUES (5, 310, 755, 'info', -10, 25, 'DUT Table', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The DUT table is a platform where the device under test is placed during measurements. It is typically made of non-conductive materials to avoid interference with the RF signals.", "type": "text"}]}]}}', NULL, NULL, 'md', '69d0067a23849e927c3a74ea');

-- ----------------------------
-- Table structure for _scenes_v_version_tags
-- ----------------------------
DROP TABLE IF EXISTS "public"."_scenes_v_version_tags";
CREATE TABLE "public"."_scenes_v_version_tags" (
  "_order" int4 NOT NULL,
  "_parent_id" int4 NOT NULL,
  "id" int4 NOT NULL DEFAULT nextval('_scenes_v_version_tags_id_seq'::regclass),
  "tag" varchar COLLATE "pg_catalog"."default",
  "_uuid" varchar COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Records of _scenes_v_version_tags
-- ----------------------------

-- ----------------------------
-- Table structure for _tours_v
-- ----------------------------
DROP TABLE IF EXISTS "public"."_tours_v";
CREATE TABLE "public"."_tours_v" (
  "id" int4 NOT NULL DEFAULT nextval('_tours_v_id_seq'::regclass),
  "parent_id" int4,
  "version_title" varchar COLLATE "pg_catalog"."default",
  "version_slug" varchar COLLATE "pg_catalog"."default",
  "version_description" jsonb,
  "version_cover_image_id" int4,
  "version_welcome_title" varchar COLLATE "pg_catalog"."default",
  "version_welcome_text" jsonb,
  "version_default_floor_id" int4,
  "version_updated_at" timestamptz(3),
  "version_created_at" timestamptz(3),
  "version__status" "public"."enum__tours_v_version_status" DEFAULT 'draft'::enum__tours_v_version_status,
  "created_at" timestamptz(3) NOT NULL DEFAULT now(),
  "updated_at" timestamptz(3) NOT NULL DEFAULT now(),
  "latest" bool
)
;

-- ----------------------------
-- Records of _tours_v
-- ----------------------------
INSERT INTO "public"."_tours_v" VALUES (11, 10, 'USYD Shepherd Street Building (J15)', 'shepherd-street-j15', NULL, 92, 'Welcome to the Shepherd Street Building (J15)', '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "Welcome to the J15 Shepherd Street Building! This premier facility features seven state-of-the-art laboratories dedicated to the discipline of electrical and computer engineering (ECE). Engineered to spark innovation and hands-on learning, the J15 ECE Labs are outfitted with the latest instruments and resources, empowering both students and academics to achieve unparalleled excellence.", "type": "text"}]}]}}', 21, '2026-04-04 02:27:06.202+08', '2026-04-04 02:27:03.604+08', 'published', '2026-04-04 02:27:06.211+08', '2026-04-04 02:27:06.211+08', 't');
INSERT INTO "public"."_tours_v" VALUES (10, 10, 'USYD Shepherd Street Building (J15)', 'shepherd-street-j15', NULL, 92, 'Welcome to the Shepherd Street Building (J15)', '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "Welcome to the J15 Shepherd Street Building! This premier facility features seven state-of-the-art laboratories dedicated to the discipline of electrical and computer engineering (ECE). Engineered to spark innovation and hands-on learning, the J15 ECE Labs are outfitted with the latest instruments and resources, empowering both students and academics to achieve unparalleled excellence.", "type": "text"}]}]}}', NULL, '2026-04-04 02:27:03.605+08', '2026-04-04 02:27:03.604+08', 'published', '2026-04-04 02:27:03.623+08', '2026-04-04 02:27:03.623+08', 'f');

-- ----------------------------
-- Table structure for _tours_v_rels
-- ----------------------------
DROP TABLE IF EXISTS "public"."_tours_v_rels";
CREATE TABLE "public"."_tours_v_rels" (
  "id" int4 NOT NULL DEFAULT nextval('_tours_v_rels_id_seq'::regclass),
  "order" int4,
  "parent_id" int4 NOT NULL,
  "path" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "floors_id" int4
)
;

-- ----------------------------
-- Records of _tours_v_rels
-- ----------------------------
INSERT INTO "public"."_tours_v_rels" VALUES (17, 1, 11, 'version.floors', 21);
INSERT INTO "public"."_tours_v_rels" VALUES (18, 2, 11, 'version.floors', 22);
INSERT INTO "public"."_tours_v_rels" VALUES (19, 3, 11, 'version.floors', 23);
INSERT INTO "public"."_tours_v_rels" VALUES (20, 4, 11, 'version.floors', 24);

-- ----------------------------
-- Table structure for _tours_v_version_tags
-- ----------------------------
DROP TABLE IF EXISTS "public"."_tours_v_version_tags";
CREATE TABLE "public"."_tours_v_version_tags" (
  "_order" int4 NOT NULL,
  "_parent_id" int4 NOT NULL,
  "id" int4 NOT NULL DEFAULT nextval('_tours_v_version_tags_id_seq'::regclass),
  "tag" varchar COLLATE "pg_catalog"."default",
  "_uuid" varchar COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Records of _tours_v_version_tags
-- ----------------------------
INSERT INTO "public"."_tours_v_version_tags" VALUES (1, 10, 19, 'engineering', '69d0067723849e927c3a7452');
INSERT INTO "public"."_tours_v_version_tags" VALUES (2, 10, 20, 'campus', '69d0067723849e927c3a7453');
INSERT INTO "public"."_tours_v_version_tags" VALUES (1, 11, 21, 'engineering', '69d0067723849e927c3a7452');
INSERT INTO "public"."_tours_v_version_tags" VALUES (2, 11, 22, 'campus', '69d0067723849e927c3a7453');

-- ----------------------------
-- Table structure for floors
-- ----------------------------
DROP TABLE IF EXISTS "public"."floors";
CREATE TABLE "public"."floors" (
  "id" int4 NOT NULL DEFAULT nextval('floors_id_seq'::regclass),
  "name" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "slug" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "tour_id" int4,
  "floorplan_id" int4,
  "initial_scene_id" int4,
  "order" numeric DEFAULT 0,
  "updated_at" timestamptz(3) NOT NULL DEFAULT now(),
  "created_at" timestamptz(3) NOT NULL DEFAULT now()
)
;

-- ----------------------------
-- Records of floors
-- ----------------------------
INSERT INTO "public"."floors" VALUES (21, 'Courtyard', 'courtyard', 10, 57, 125, 0, '2026-04-04 02:27:06.059+08', '2026-04-04 02:27:03.648+08');
INSERT INTO "public"."floors" VALUES (22, 'Level 1', 'level1', 10, 60, 127, 1, '2026-04-04 02:27:06.091+08', '2026-04-04 02:27:03.667+08');
INSERT INTO "public"."floors" VALUES (23, 'Level 2', 'level2', 10, 72, 138, 2, '2026-04-04 02:27:06.13+08', '2026-04-04 02:27:03.682+08');
INSERT INTO "public"."floors" VALUES (24, 'Level 3', 'level3', 10, 80, 145, 3, '2026-04-04 02:27:06.165+08', '2026-04-04 02:27:03.697+08');

-- ----------------------------
-- Table structure for floors_map_points
-- ----------------------------
DROP TABLE IF EXISTS "public"."floors_map_points";
CREATE TABLE "public"."floors_map_points" (
  "_order" int4 NOT NULL,
  "_parent_id" int4 NOT NULL,
  "id" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "scene_id" int4 NOT NULL,
  "cx" numeric NOT NULL,
  "cy" numeric NOT NULL,
  "color" varchar COLLATE "pg_catalog"."default" DEFAULT '#E64626'::character varying
)
;

-- ----------------------------
-- Records of floors_map_points
-- ----------------------------
INSERT INTO "public"."floors_map_points" VALUES (1, 21, '69d0067a23849e927c3a74eb', 125, 2800, 1200, '#E64626');
INSERT INTO "public"."floors_map_points" VALUES (2, 21, '69d0067a23849e927c3a74ec', 126, 2000, 400, '#E64626');
INSERT INTO "public"."floors_map_points" VALUES (1, 22, '69d0067a23849e927c3a74ed', 127, 3050, 1000, '#E64626');
INSERT INTO "public"."floors_map_points" VALUES (2, 22, '69d0067a23849e927c3a74ee', 128, 2050, 950, '#E64626');
INSERT INTO "public"."floors_map_points" VALUES (3, 22, '69d0067a23849e927c3a74ef', 129, 1380, 1140, '#E64626');
INSERT INTO "public"."floors_map_points" VALUES (4, 22, '69d0067a23849e927c3a74f0', 130, 380, 880, '#E64626');
INSERT INTO "public"."floors_map_points" VALUES (5, 22, '69d0067a23849e927c3a74f1', 131, 3700, 930, '#E64626');
INSERT INTO "public"."floors_map_points" VALUES (6, 22, '69d0067a23849e927c3a74f2', 132, 3700, 1450, '#E64626');
INSERT INTO "public"."floors_map_points" VALUES (7, 22, '69d0067a23849e927c3a74f3', 133, 3850, 430, '#E64626');
INSERT INTO "public"."floors_map_points" VALUES (8, 22, '69d0067a23849e927c3a74f4', 134, 4200, 930, '#E64626');
INSERT INTO "public"."floors_map_points" VALUES (9, 22, '69d0067a23849e927c3a74f5', 135, 4580, 1160, '#E64626');
INSERT INTO "public"."floors_map_points" VALUES (10, 22, '69d0067a23849e927c3a74f6', 136, 4480, 1400, '#E64626');
INSERT INTO "public"."floors_map_points" VALUES (11, 22, '69d0067a23849e927c3a74f7', 137, 4690, 1400, '#E64626');
INSERT INTO "public"."floors_map_points" VALUES (1, 23, '69d0067a23849e927c3a74f8', 138, 3050, 850, '#E64626');
INSERT INTO "public"."floors_map_points" VALUES (2, 23, '69d0067a23849e927c3a74f9', 139, 1950, 850, '#E64626');
INSERT INTO "public"."floors_map_points" VALUES (3, 23, '69d0067a23849e927c3a74fa', 140, 1000, 950, '#E64626');
INSERT INTO "public"."floors_map_points" VALUES (4, 23, '69d0067a23849e927c3a74fb', 141, 200, 600, '#E64626');
INSERT INTO "public"."floors_map_points" VALUES (5, 23, '69d0067a23849e927c3a74fc', 142, 4400, 1000, '#E64626');
INSERT INTO "public"."floors_map_points" VALUES (6, 23, '69d0067a23849e927c3a74fd', 143, 3700, 600, '#E64626');
INSERT INTO "public"."floors_map_points" VALUES (7, 23, '69d0067a23849e927c3a74fe', 144, 4750, 680, '#E64626');
INSERT INTO "public"."floors_map_points" VALUES (1, 24, '69d0067a23849e927c3a74ff', 145, 3100, 950, '#E64626');
INSERT INTO "public"."floors_map_points" VALUES (2, 24, '69d0067a23849e927c3a7500', 146, 2000, 950, '#E64626');
INSERT INTO "public"."floors_map_points" VALUES (3, 24, '69d0067a23849e927c3a7501', 147, 1350, 950, '#E64626');
INSERT INTO "public"."floors_map_points" VALUES (4, 24, '69d0067a23849e927c3a7502', 148, 1350, 1400, '#E64626');
INSERT INTO "public"."floors_map_points" VALUES (5, 24, '69d0067a23849e927c3a7503', 149, 200, 580, '#E64626');
INSERT INTO "public"."floors_map_points" VALUES (6, 24, '69d0067a23849e927c3a7504', 150, 350, 1050, '#E64626');
INSERT INTO "public"."floors_map_points" VALUES (7, 24, '69d0067a23849e927c3a7505', 151, 3800, 970, '#E64626');
INSERT INTO "public"."floors_map_points" VALUES (8, 24, '69d0067a23849e927c3a7506', 152, 4600, 380, '#E64626');
INSERT INTO "public"."floors_map_points" VALUES (9, 24, '69d0067a23849e927c3a7507', 153, 2350, 580, '#E64626');
INSERT INTO "public"."floors_map_points" VALUES (10, 24, '69d0067a23849e927c3a7508', 154, 2250, 310, '#E64626');
INSERT INTO "public"."floors_map_points" VALUES (11, 24, '69d0067a23849e927c3a7509', 155, 1900, 350, '#E64626');

-- ----------------------------
-- Table structure for media
-- ----------------------------
DROP TABLE IF EXISTS "public"."media";
CREATE TABLE "public"."media" (
  "id" int4 NOT NULL DEFAULT nextval('media_id_seq'::regclass),
  "alt" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "updated_at" timestamptz(3) NOT NULL DEFAULT now(),
  "created_at" timestamptz(3) NOT NULL DEFAULT now(),
  "url" varchar COLLATE "pg_catalog"."default",
  "thumbnail_u_r_l" varchar COLLATE "pg_catalog"."default",
  "filename" varchar COLLATE "pg_catalog"."default",
  "mime_type" varchar COLLATE "pg_catalog"."default",
  "filesize" numeric,
  "width" numeric,
  "height" numeric,
  "focal_x" numeric,
  "focal_y" numeric,
  "sizes_thumbnail_url" varchar COLLATE "pg_catalog"."default",
  "sizes_thumbnail_width" numeric,
  "sizes_thumbnail_height" numeric,
  "sizes_thumbnail_mime_type" varchar COLLATE "pg_catalog"."default",
  "sizes_thumbnail_filesize" numeric,
  "sizes_thumbnail_filename" varchar COLLATE "pg_catalog"."default",
  "sizes_preview_url" varchar COLLATE "pg_catalog"."default",
  "sizes_preview_width" numeric,
  "sizes_preview_height" numeric,
  "sizes_preview_mime_type" varchar COLLATE "pg_catalog"."default",
  "sizes_preview_filesize" numeric,
  "sizes_preview_filename" varchar COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Records of media
-- ----------------------------
INSERT INTO "public"."media" VALUES (57, 'Courtyard floorplan', '2026-04-04 02:26:52.757+08', '2026-04-04 02:26:52.755+08', '/api/media/file/courtyard.svg', NULL, 'courtyard.svg', 'image/svg+xml', 3332, 4828, 1551, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "public"."media" VALUES (58, 'Courtyard', '2026-04-04 02:26:53.104+08', '2026-04-04 02:26:53.104+08', '/api/media/file/courtyard2-2.jpg', NULL, 'courtyard2-2.jpg', 'image/jpeg', 1615829, 4096, 2048, 50, 50, '/api/media/file/courtyard2-2-400x200.jpg', 400, 200, 'image/jpeg', 10200, 'courtyard2-2-400x200.jpg', '/api/media/file/courtyard2-2-1200x600.jpg', 1200, 600, 'image/jpeg', 84080, 'courtyard2-2-1200x600.jpg');
INSERT INTO "public"."media" VALUES (59, 'Building Entrance', '2026-04-04 02:26:53.444+08', '2026-04-04 02:26:53.444+08', '/api/media/file/courtyard1-2.jpg', NULL, 'courtyard1-2.jpg', 'image/jpeg', 1615829, 4096, 2048, 50, 50, '/api/media/file/courtyard1-2-400x200.jpg', 400, 200, 'image/jpeg', 10200, 'courtyard1-2-400x200.jpg', '/api/media/file/courtyard1-2-1200x600.jpg', 1200, 600, 'image/jpeg', 84080, 'courtyard1-2-1200x600.jpg');
INSERT INTO "public"."media" VALUES (60, 'Level 1 floorplan', '2026-04-04 02:26:53.462+08', '2026-04-04 02:26:53.462+08', '/api/media/file/lvl1.svg', NULL, 'lvl1.svg', 'image/svg+xml', 40524, 4828, 1551, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "public"."media" VALUES (61, 'Foyer 1 - Level 1', '2026-04-04 02:26:53.813+08', '2026-04-04 02:26:53.813+08', '/api/media/file/a1-10.jpg', NULL, 'a1-10.jpg', 'image/jpeg', 1615829, 4096, 2048, 50, 50, '/api/media/file/a1-10-400x200.jpg', 400, 200, 'image/jpeg', 10200, 'a1-10-400x200.jpg', '/api/media/file/a1-10-1200x600.jpg', 1200, 600, 'image/jpeg', 84080, 'a1-10-1200x600.jpg');
INSERT INTO "public"."media" VALUES (62, 'Foyer 2 - Level 1', '2026-04-04 02:26:54.178+08', '2026-04-04 02:26:54.177+08', '/api/media/file/b1-4.jpg', NULL, 'b1-4.jpg', 'image/jpeg', 1615829, 4096, 2048, 50, 50, '/api/media/file/b1-4-400x200.jpg', 400, 200, 'image/jpeg', 10200, 'b1-4-400x200.jpg', '/api/media/file/b1-4-1200x600.jpg', 1200, 600, 'image/jpeg', 84080, 'b1-4-1200x600.jpg');
INSERT INTO "public"."media" VALUES (63, '101 - Computer and Software Engineering Lab 1', '2026-04-04 02:26:54.538+08', '2026-04-04 02:26:54.537+08', '/api/media/file/c1-4.jpg', NULL, 'c1-4.jpg', 'image/jpeg', 1615829, 4096, 2048, 50, 50, '/api/media/file/c1-4-400x200.jpg', 400, 200, 'image/jpeg', 10200, 'c1-4-400x200.jpg', '/api/media/file/c1-4-1200x600.jpg', 1200, 600, 'image/jpeg', 84080, 'c1-4-1200x600.jpg');
INSERT INTO "public"."media" VALUES (64, '101 - Computer and Software Engineering Lab 2', '2026-04-04 02:26:54.908+08', '2026-04-04 02:26:54.907+08', '/api/media/file/c2-4.jpg', NULL, 'c2-4.jpg', 'image/jpeg', 1615829, 4096, 2048, 50, 50, '/api/media/file/c2-4-400x200.jpg', 400, 200, 'image/jpeg', 10200, 'c2-4-400x200.jpg', '/api/media/file/c2-4-1200x600.jpg', 1200, 600, 'image/jpeg', 84080, 'c2-4-1200x600.jpg');
INSERT INTO "public"."media" VALUES (65, '110 - Raymond Kirby Engineering on Display Lab 1', '2026-04-04 02:26:55.279+08', '2026-04-04 02:26:55.279+08', '/api/media/file/d1-3.jpg', NULL, 'd1-3.jpg', 'image/jpeg', 1615829, 4096, 2048, 50, 50, '/api/media/file/d1-3-400x200.jpg', 400, 200, 'image/jpeg', 10200, 'd1-3-400x200.jpg', '/api/media/file/d1-3-1200x600.jpg', 1200, 600, 'image/jpeg', 84080, 'd1-3-1200x600.jpg');
INSERT INTO "public"."media" VALUES (66, '110 - Raymond Kirby Engineering on Display Lab 2', '2026-04-04 02:26:55.617+08', '2026-04-04 02:26:55.617+08', '/api/media/file/d2-3.jpg', NULL, 'd2-3.jpg', 'image/jpeg', 1615829, 4096, 2048, 50, 50, '/api/media/file/d2-3-400x200.jpg', 400, 200, 'image/jpeg', 10200, 'd2-3-400x200.jpg', '/api/media/file/d2-3-1200x600.jpg', 1200, 600, 'image/jpeg', 84080, 'd2-3-1200x600.jpg');
INSERT INTO "public"."media" VALUES (67, '110 - Raymond Kirby Engineering on Display Lab 3', '2026-04-04 02:26:55.942+08', '2026-04-04 02:26:55.942+08', '/api/media/file/d3-2.jpg', NULL, 'd3-2.jpg', 'image/jpeg', 1615829, 4096, 2048, 50, 50, '/api/media/file/d3-2-400x200.jpg', 400, 200, 'image/jpeg', 10200, 'd3-2-400x200.jpg', '/api/media/file/d3-2-1200x600.jpg', 1200, 600, 'image/jpeg', 84080, 'd3-2-1200x600.jpg');
INSERT INTO "public"."media" VALUES (68, '110 - Raymond Kirby Engineering on Display Lab 4', '2026-04-04 02:26:56.303+08', '2026-04-04 02:26:56.303+08', '/api/media/file/d4-2.jpg', NULL, 'd4-2.jpg', 'image/jpeg', 1615829, 4096, 2048, 50, 50, '/api/media/file/d4-2-400x200.jpg', 400, 200, 'image/jpeg', 10200, 'd4-2-400x200.jpg', '/api/media/file/d4-2-1200x600.jpg', 1200, 600, 'image/jpeg', 84080, 'd4-2-1200x600.jpg');
INSERT INTO "public"."media" VALUES (69, '118 - Mechanical Support Lab 1', '2026-04-04 02:26:56.698+08', '2026-04-04 02:26:56.698+08', '/api/media/file/e1-3.jpg', NULL, 'e1-3.jpg', 'image/jpeg', 1615829, 4096, 2048, 50, 50, '/api/media/file/e1-3-400x200.jpg', 400, 200, 'image/jpeg', 10200, 'e1-3-400x200.jpg', '/api/media/file/e1-3-1200x600.jpg', 1200, 600, 'image/jpeg', 84080, 'e1-3-1200x600.jpg');
INSERT INTO "public"."media" VALUES (70, '118 - Mechanical Support Lab 2', '2026-04-04 02:26:57.067+08', '2026-04-04 02:26:57.066+08', '/api/media/file/e3-3.jpg', NULL, 'e3-3.jpg', 'image/jpeg', 1615829, 4096, 2048, 50, 50, '/api/media/file/e3-3-400x200.jpg', 400, 200, 'image/jpeg', 10200, 'e3-3-400x200.jpg', '/api/media/file/e3-3-1200x600.jpg', 1200, 600, 'image/jpeg', 84080, 'e3-3-1200x600.jpg');
INSERT INTO "public"."media" VALUES (71, '118 - Mechanical Support Lab 3', '2026-04-04 02:26:57.369+08', '2026-04-04 02:26:57.369+08', '/api/media/file/e2-2.jpg', NULL, 'e2-2.jpg', 'image/jpeg', 1615829, 4096, 2048, 50, 50, '/api/media/file/e2-2-400x200.jpg', 400, 200, 'image/jpeg', 10200, 'e2-2-400x200.jpg', '/api/media/file/e2-2-1200x600.jpg', 1200, 600, 'image/jpeg', 84080, 'e2-2-1200x600.jpg');
INSERT INTO "public"."media" VALUES (72, 'Level 2 floorplan', '2026-04-04 02:26:57.385+08', '2026-04-04 02:26:57.385+08', '/api/media/file/level2.svg', NULL, 'level2.svg', 'image/svg+xml', 31034, 4828, 1551, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "public"."media" VALUES (73, 'Foyer - Level 2', '2026-04-04 02:26:57.716+08', '2026-04-04 02:26:57.716+08', '/api/media/file/a1-11.jpg', NULL, 'a1-11.jpg', 'image/jpeg', 1615829, 4096, 2048, 50, 50, '/api/media/file/a1-11-400x200.jpg', 400, 200, 'image/jpeg', 10200, 'a1-11-400x200.jpg', '/api/media/file/a1-11-1200x600.jpg', 1200, 600, 'image/jpeg', 84080, 'a1-11-1200x600.jpg');
INSERT INTO "public"."media" VALUES (74, '201 - Analog and Digital Lab 1', '2026-04-04 02:26:58.063+08', '2026-04-04 02:26:58.063+08', '/api/media/file/c1-5.jpg', NULL, 'c1-5.jpg', 'image/jpeg', 1615829, 4096, 2048, 50, 50, '/api/media/file/c1-5-400x200.jpg', 400, 200, 'image/jpeg', 10200, 'c1-5-400x200.jpg', '/api/media/file/c1-5-1200x600.jpg', 1200, 600, 'image/jpeg', 84080, 'c1-5-1200x600.jpg');
INSERT INTO "public"."media" VALUES (75, '201 - Analog and Digital Lab 2', '2026-04-04 02:26:58.42+08', '2026-04-04 02:26:58.42+08', '/api/media/file/c2-5.jpg', NULL, 'c2-5.jpg', 'image/jpeg', 1615829, 4096, 2048, 50, 50, '/api/media/file/c2-5-400x200.jpg', 400, 200, 'image/jpeg', 10200, 'c2-5-400x200.jpg', '/api/media/file/c2-5-1200x600.jpg', 1200, 600, 'image/jpeg', 84080, 'c2-5-1200x600.jpg');
INSERT INTO "public"."media" VALUES (76, '201 - Analog and Digital Lab 3', '2026-04-04 02:26:58.733+08', '2026-04-04 02:26:58.733+08', '/api/media/file/c3-3.jpg', NULL, 'c3-3.jpg', 'image/jpeg', 1615829, 4096, 2048, 50, 50, '/api/media/file/c3-3-400x200.jpg', 400, 200, 'image/jpeg', 10200, 'c3-3-400x200.jpg', '/api/media/file/c3-3-1200x600.jpg', 1200, 600, 'image/jpeg', 84080, 'c3-3-1200x600.jpg');
INSERT INTO "public"."media" VALUES (77, '210 - Electronics & Comm''s Lab 1', '2026-04-04 02:26:59.039+08', '2026-04-04 02:26:59.039+08', '/api/media/file/b1-5.jpg', NULL, 'b1-5.jpg', 'image/jpeg', 1615829, 4096, 2048, 50, 50, '/api/media/file/b1-5-400x200.jpg', 400, 200, 'image/jpeg', 10200, 'b1-5-400x200.jpg', '/api/media/file/b1-5-1200x600.jpg', 1200, 600, 'image/jpeg', 84080, 'b1-5-1200x600.jpg');
INSERT INTO "public"."media" VALUES (78, '210 - Electronics & Comm''s Lab 2', '2026-04-04 02:26:59.339+08', '2026-04-04 02:26:59.339+08', '/api/media/file/b2-2.jpg', NULL, 'b2-2.jpg', 'image/jpeg', 1615829, 4096, 2048, 50, 50, '/api/media/file/b2-2-400x200.jpg', 400, 200, 'image/jpeg', 10200, 'b2-2-400x200.jpg', '/api/media/file/b2-2-1200x600.jpg', 1200, 600, 'image/jpeg', 84080, 'b2-2-1200x600.jpg');
INSERT INTO "public"."media" VALUES (79, '210 - Electronics & Comm''s Lab 3', '2026-04-04 02:26:59.662+08', '2026-04-04 02:26:59.661+08', '/api/media/file/b3-2.jpg', NULL, 'b3-2.jpg', 'image/jpeg', 1615829, 4096, 2048, 50, 50, '/api/media/file/b3-2-400x200.jpg', 400, 200, 'image/jpeg', 10200, 'b3-2-400x200.jpg', '/api/media/file/b3-2-1200x600.jpg', 1200, 600, 'image/jpeg', 84080, 'b3-2-1200x600.jpg');
INSERT INTO "public"."media" VALUES (80, 'Level 3 floorplan', '2026-04-04 02:26:59.681+08', '2026-04-04 02:26:59.681+08', '/api/media/file/level3.svg', NULL, 'level3.svg', 'image/svg+xml', 40956, 4828, 1551, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "public"."media" VALUES (81, 'Foyer 1 - Level 3', '2026-04-04 02:27:00.037+08', '2026-04-04 02:27:00.036+08', '/api/media/file/a1-12.jpg', NULL, 'a1-12.jpg', 'image/jpeg', 1615829, 4096, 2048, 50, 50, '/api/media/file/a1-12-400x200.jpg', 400, 200, 'image/jpeg', 10200, 'a1-12-400x200.jpg', '/api/media/file/a1-12-1200x600.jpg', 1200, 600, 'image/jpeg', 84080, 'a1-12-1200x600.jpg');
INSERT INTO "public"."media" VALUES (82, 'Foyer 2 - Level 3', '2026-04-04 02:27:00.397+08', '2026-04-04 02:27:00.397+08', '/api/media/file/b1-6.jpg', NULL, 'b1-6.jpg', 'image/jpeg', 1615829, 4096, 2048, 50, 50, '/api/media/file/b1-6-400x200.jpg', 400, 200, 'image/jpeg', 10200, 'b1-6-400x200.jpg', '/api/media/file/b1-6-1200x600.jpg', 1200, 600, 'image/jpeg', 84080, 'b1-6-1200x600.jpg');
INSERT INTO "public"."media" VALUES (83, '301 - Digital Systems & Comm''s Modelling 1', '2026-04-04 02:27:00.723+08', '2026-04-04 02:27:00.723+08', '/api/media/file/c1-6.jpg', NULL, 'c1-6.jpg', 'image/jpeg', 1615829, 4096, 2048, 50, 50, '/api/media/file/c1-6-400x200.jpg', 400, 200, 'image/jpeg', 10200, 'c1-6-400x200.jpg', '/api/media/file/c1-6-1200x600.jpg', 1200, 600, 'image/jpeg', 84080, 'c1-6-1200x600.jpg');
INSERT INTO "public"."media" VALUES (84, '301 - Digital Systems & Comm''s Modelling 2', '2026-04-04 02:27:01.049+08', '2026-04-04 02:27:01.049+08', '/api/media/file/c2-6.jpg', NULL, 'c2-6.jpg', 'image/jpeg', 1615829, 4096, 2048, 50, 50, '/api/media/file/c2-6-400x200.jpg', 400, 200, 'image/jpeg', 10200, 'c2-6-400x200.jpg', '/api/media/file/c2-6-1200x600.jpg', 1200, 600, 'image/jpeg', 84080, 'c2-6-1200x600.jpg');
INSERT INTO "public"."media" VALUES (85, '301 - Digital Systems & Comm''s Modelling 3', '2026-04-04 02:27:01.398+08', '2026-04-04 02:27:01.398+08', '/api/media/file/c3-4.jpg', NULL, 'c3-4.jpg', 'image/jpeg', 1615829, 4096, 2048, 50, 50, '/api/media/file/c3-4-400x200.jpg', 400, 200, 'image/jpeg', 10200, 'c3-4-400x200.jpg', '/api/media/file/c3-4-1200x600.jpg', 1200, 600, 'image/jpeg', 84080, 'c3-4-1200x600.jpg');
INSERT INTO "public"."media" VALUES (86, '301 - Digital Systems & Comm''s Modelling 4', '2026-04-04 02:27:01.691+08', '2026-04-04 02:27:01.691+08', '/api/media/file/c4-2.jpg', NULL, 'c4-2.jpg', 'image/jpeg', 1615829, 4096, 2048, 50, 50, '/api/media/file/c4-2-400x200.jpg', 400, 200, 'image/jpeg', 10200, 'c4-2-400x200.jpg', '/api/media/file/c4-2-1200x600.jpg', 1200, 600, 'image/jpeg', 84080, 'c4-2-1200x600.jpg');
INSERT INTO "public"."media" VALUES (87, '310 - Energy and Machines Lab 1', '2026-04-04 02:27:01.982+08', '2026-04-04 02:27:01.982+08', '/api/media/file/d1-4.jpg', NULL, 'd1-4.jpg', 'image/jpeg', 1615829, 4096, 2048, 50, 50, '/api/media/file/d1-4-400x200.jpg', 400, 200, 'image/jpeg', 10200, 'd1-4-400x200.jpg', '/api/media/file/d1-4-1200x600.jpg', 1200, 600, 'image/jpeg', 84080, 'd1-4-1200x600.jpg');
INSERT INTO "public"."media" VALUES (88, '310 - Energy and Machines Lab 2', '2026-04-04 02:27:02.28+08', '2026-04-04 02:27:02.28+08', '/api/media/file/d2-4.jpg', NULL, 'd2-4.jpg', 'image/jpeg', 1615829, 4096, 2048, 50, 50, '/api/media/file/d2-4-400x200.jpg', 400, 200, 'image/jpeg', 10200, 'd2-4-400x200.jpg', '/api/media/file/d2-4-1200x600.jpg', 1200, 600, 'image/jpeg', 84080, 'd2-4-1200x600.jpg');
INSERT INTO "public"."media" VALUES (89, '309 - RF Chamber Room 1', '2026-04-04 02:27:02.57+08', '2026-04-04 02:27:02.57+08', '/api/media/file/e1-4.jpg', NULL, 'e1-4.jpg', 'image/jpeg', 1615829, 4096, 2048, 50, 50, '/api/media/file/e1-4-400x200.jpg', 400, 200, 'image/jpeg', 10200, 'e1-4-400x200.jpg', '/api/media/file/e1-4-1200x600.jpg', 1200, 600, 'image/jpeg', 84080, 'e1-4-1200x600.jpg');
INSERT INTO "public"."media" VALUES (90, '309 - RF Chamber Room 2', '2026-04-04 02:27:02.879+08', '2026-04-04 02:27:02.879+08', '/api/media/file/e3-4.jpg', NULL, 'e3-4.jpg', 'image/jpeg', 1615829, 4096, 2048, 50, 50, '/api/media/file/e3-4-400x200.jpg', 400, 200, 'image/jpeg', 10200, 'e3-4-400x200.jpg', '/api/media/file/e3-4-1200x600.jpg', 1200, 600, 'image/jpeg', 84080, 'e3-4-1200x600.jpg');
INSERT INTO "public"."media" VALUES (91, '309 - RF Chamber Room 3', '2026-04-04 02:27:03.236+08', '2026-04-04 02:27:03.236+08', '/api/media/file/e4-2.jpg', NULL, 'e4-2.jpg', 'image/jpeg', 1615829, 4096, 2048, 50, 50, '/api/media/file/e4-2-400x200.jpg', 400, 200, 'image/jpeg', 10200, 'e4-2-400x200.jpg', '/api/media/file/e4-2-1200x600.jpg', 1200, 600, 'image/jpeg', 84080, 'e4-2-1200x600.jpg');
INSERT INTO "public"."media" VALUES (92, 'Tour cover image', '2026-04-04 02:27:03.59+08', '2026-04-04 02:27:03.59+08', '/api/media/file/cover-1.jpg', NULL, 'cover-1.jpg', 'image/jpeg', 1615829, 4096, 2048, 50, 50, '/api/media/file/cover-1-400x200.jpg', 400, 200, 'image/jpeg', 10200, 'cover-1-400x200.jpg', '/api/media/file/cover-1-1200x600.jpg', 1200, 600, 'image/jpeg', 84080, 'cover-1-1200x600.jpg');

-- ----------------------------
-- Table structure for media_tags
-- ----------------------------
DROP TABLE IF EXISTS "public"."media_tags";
CREATE TABLE "public"."media_tags" (
  "_order" int4 NOT NULL,
  "_parent_id" int4 NOT NULL,
  "id" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "tag" varchar COLLATE "pg_catalog"."default" NOT NULL
)
;

-- ----------------------------
-- Records of media_tags
-- ----------------------------

-- ----------------------------
-- Table structure for payload_kv
-- ----------------------------
DROP TABLE IF EXISTS "public"."payload_kv";
CREATE TABLE "public"."payload_kv" (
  "id" int4 NOT NULL DEFAULT nextval('payload_kv_id_seq'::regclass),
  "key" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "data" jsonb NOT NULL
)
;

-- ----------------------------
-- Records of payload_kv
-- ----------------------------

-- ----------------------------
-- Table structure for payload_locked_documents
-- ----------------------------
DROP TABLE IF EXISTS "public"."payload_locked_documents";
CREATE TABLE "public"."payload_locked_documents" (
  "id" int4 NOT NULL DEFAULT nextval('payload_locked_documents_id_seq'::regclass),
  "global_slug" varchar COLLATE "pg_catalog"."default",
  "updated_at" timestamptz(3) NOT NULL DEFAULT now(),
  "created_at" timestamptz(3) NOT NULL DEFAULT now()
)
;

-- ----------------------------
-- Records of payload_locked_documents
-- ----------------------------

-- ----------------------------
-- Table structure for payload_locked_documents_rels
-- ----------------------------
DROP TABLE IF EXISTS "public"."payload_locked_documents_rels";
CREATE TABLE "public"."payload_locked_documents_rels" (
  "id" int4 NOT NULL DEFAULT nextval('payload_locked_documents_rels_id_seq'::regclass),
  "order" int4,
  "parent_id" int4 NOT NULL,
  "path" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "users_id" int4,
  "media_id" int4,
  "tours_id" int4,
  "floors_id" int4,
  "scenes_id" int4
)
;

-- ----------------------------
-- Records of payload_locked_documents_rels
-- ----------------------------

-- ----------------------------
-- Table structure for payload_migrations
-- ----------------------------
DROP TABLE IF EXISTS "public"."payload_migrations";
CREATE TABLE "public"."payload_migrations" (
  "id" int4 NOT NULL DEFAULT nextval('payload_migrations_id_seq'::regclass),
  "name" varchar COLLATE "pg_catalog"."default",
  "batch" numeric,
  "updated_at" timestamptz(3) NOT NULL DEFAULT now(),
  "created_at" timestamptz(3) NOT NULL DEFAULT now()
)
;

-- ----------------------------
-- Records of payload_migrations
-- ----------------------------
INSERT INTO "public"."payload_migrations" VALUES (1, 'dev', -1, '2026-04-04 02:31:40.271+08', '2026-04-04 02:04:46.534+08');

-- ----------------------------
-- Table structure for payload_preferences
-- ----------------------------
DROP TABLE IF EXISTS "public"."payload_preferences";
CREATE TABLE "public"."payload_preferences" (
  "id" int4 NOT NULL DEFAULT nextval('payload_preferences_id_seq'::regclass),
  "key" varchar COLLATE "pg_catalog"."default",
  "value" jsonb,
  "updated_at" timestamptz(3) NOT NULL DEFAULT now(),
  "created_at" timestamptz(3) NOT NULL DEFAULT now()
)
;

-- ----------------------------
-- Records of payload_preferences
-- ----------------------------
INSERT INTO "public"."payload_preferences" VALUES (1, 'collection-users', '{}', '2026-04-04 02:08:20.98+08', '2026-04-04 02:08:20.979+08');
INSERT INTO "public"."payload_preferences" VALUES (2, 'nav', '{"groups": {"Collections": {"open": true}}}', '2026-04-04 02:08:23.977+08', '2026-04-04 02:08:22.681+08');
INSERT INTO "public"."payload_preferences" VALUES (3, 'collection-media', '{}', '2026-04-04 02:08:34.889+08', '2026-04-04 02:08:34.889+08');
INSERT INTO "public"."payload_preferences" VALUES (4, 'collection-tours', '{}', '2026-04-04 02:08:35.049+08', '2026-04-04 02:08:35.048+08');
INSERT INTO "public"."payload_preferences" VALUES (5, 'collection-floors', '{}', '2026-04-04 02:08:35.463+08', '2026-04-04 02:08:35.463+08');
INSERT INTO "public"."payload_preferences" VALUES (6, 'collection-scenes', '{}', '2026-04-04 02:33:40.356+08', '2026-04-04 02:33:40.353+08');

-- ----------------------------
-- Table structure for payload_preferences_rels
-- ----------------------------
DROP TABLE IF EXISTS "public"."payload_preferences_rels";
CREATE TABLE "public"."payload_preferences_rels" (
  "id" int4 NOT NULL DEFAULT nextval('payload_preferences_rels_id_seq'::regclass),
  "order" int4,
  "parent_id" int4 NOT NULL,
  "path" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "users_id" int4
)
;

-- ----------------------------
-- Records of payload_preferences_rels
-- ----------------------------
INSERT INTO "public"."payload_preferences_rels" VALUES (1, NULL, 1, 'user', 1);
INSERT INTO "public"."payload_preferences_rels" VALUES (3, NULL, 2, 'user', 1);
INSERT INTO "public"."payload_preferences_rels" VALUES (4, NULL, 3, 'user', 1);
INSERT INTO "public"."payload_preferences_rels" VALUES (5, NULL, 4, 'user', 1);
INSERT INTO "public"."payload_preferences_rels" VALUES (6, NULL, 5, 'user', 1);
INSERT INTO "public"."payload_preferences_rels" VALUES (7, NULL, 6, 'user', 1);

-- ----------------------------
-- Table structure for scenes
-- ----------------------------
DROP TABLE IF EXISTS "public"."scenes";
CREATE TABLE "public"."scenes" (
  "id" int4 NOT NULL DEFAULT nextval('scenes_id_seq'::regclass),
  "title" varchar COLLATE "pg_catalog"."default",
  "slug" varchar COLLATE "pg_catalog"."default",
  "floor_id" int4,
  "description" jsonb,
  "accessibility_notes" varchar COLLATE "pg_catalog"."default",
  "panorama_id" int4,
  "initial_yaw" numeric DEFAULT 0,
  "initial_pitch" numeric DEFAULT 0,
  "initial_hfov" numeric DEFAULT 120,
  "rotation" numeric DEFAULT 0,
  "updated_at" timestamptz(3) NOT NULL DEFAULT now(),
  "created_at" timestamptz(3) NOT NULL DEFAULT now(),
  "_status" "public"."enum_scenes_status" DEFAULT 'draft'::enum_scenes_status
)
;

-- ----------------------------
-- Records of scenes
-- ----------------------------
INSERT INTO "public"."scenes" VALUES (125, 'Courtyard', 'courtyard1-1', 21, NULL, NULL, 58, 90, 5, 120, 80, '2026-04-04 02:27:04.447+08', '2026-04-04 02:27:03.713+08', 'published');
INSERT INTO "public"."scenes" VALUES (126, 'Building Entrance', 'buildingEntrance', 21, NULL, NULL, 59, 90, 0, 120, 90, '2026-04-04 02:27:04.52+08', '2026-04-04 02:27:03.749+08', 'published');
INSERT INTO "public"."scenes" VALUES (127, 'Foyer 1 - Level 1', 'foyer1-1', 22, NULL, NULL, 61, 50, 0, 120, 90, '2026-04-04 02:27:04.57+08', '2026-04-04 02:27:03.774+08', 'published');
INSERT INTO "public"."scenes" VALUES (128, 'Foyer 2 - Level 1', 'foyer1-2', 22, NULL, NULL, 62, 200, 0, 120, 90, '2026-04-04 02:27:04.615+08', '2026-04-04 02:27:03.797+08', 'published');
INSERT INTO "public"."scenes" VALUES (130, '101 - Computer and Software Engineering Lab 2', '101-2', 22, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Computer and Software Engineering Lab is outfitted with high-performance computers featuring advanced NVIDIA GPUs. This lab offers students hands-on experience in cutting-edge fields such as the Internet of Things (IoT), Artificial Intelligence (AI), Software Defined Networks (SDN), and Multidimensional Signal Processing.", "type": "text"}]}]}}', NULL, 64, 60, 0, 120, 90, '2026-04-04 02:27:04.716+08', '2026-04-04 02:27:03.842+08', 'published');
INSERT INTO "public"."scenes" VALUES (131, '110 - Raymond Kirby Engineering on Display Lab 1', '110-1', 22, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Project Lab provides a range of common electrical benchtop instruments, catering to both catch-up coursework students and those working on projects or theses. This lab offers a supportive environment for students to experiment with their designs and enhance their practical skills.", "type": "text"}]}]}}', NULL, 65, -40, 0, 120, 90, '2026-04-04 02:27:04.771+08', '2026-04-04 02:27:03.867+08', 'published');
INSERT INTO "public"."scenes" VALUES (132, '110 - Raymond Kirby Engineering on Display Lab 2', '110-2', 22, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Project Lab provides a range of common electrical benchtop instruments, catering to both catch-up coursework students and those working on projects or theses. This lab offers a supportive environment for students to experiment with their designs and enhance their practical skills.", "type": "text"}]}]}}', NULL, 66, 200, 0, 120, 90, '2026-04-04 02:27:04.823+08', '2026-04-04 02:27:03.892+08', 'published');
INSERT INTO "public"."scenes" VALUES (133, '110 - Raymond Kirby Engineering on Display Lab 3', '110-3', 22, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Project Lab provides a range of common electrical benchtop instruments, catering to both catch-up coursework students and those working on projects or theses. This lab offers a supportive environment for students to experiment with their designs and enhance their practical skills.", "type": "text"}]}]}}', NULL, 67, 0, 0, 120, 90, '2026-04-04 02:27:04.874+08', '2026-04-04 02:27:03.914+08', 'published');
INSERT INTO "public"."scenes" VALUES (134, '110 - Raymond Kirby Engineering on Display Lab 4', '110-4', 22, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Project Lab provides a range of common electrical benchtop instruments, catering to both catch-up coursework students and those working on projects or theses. This lab offers a supportive environment for students to experiment with their designs and enhance their practical skills.", "type": "text"}]}]}}', NULL, 68, 50, 0, 120, 90, '2026-04-04 02:27:04.92+08', '2026-04-04 02:27:03.933+08', 'published');
INSERT INTO "public"."scenes" VALUES (135, '118 - Mechanical Support Lab 1', '110-5', 22, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Mechanical Support Room is a fabrication space equipped with tools such as a CNC router, laser cutter, press drill,  bench grinder, and 3D printer. It facilitates rapid prototyping, precision machining, and custom part production to support engineering and design activities.", "type": "text"}]}]}}', NULL, 69, 10, 0, 120, 90, '2026-04-04 02:27:04.969+08', '2026-04-04 02:27:03.955+08', 'published');
INSERT INTO "public"."scenes" VALUES (136, '118 - Mechanical Support Lab 2', '110-6', 22, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Mechanical Support Room is a fabrication space equipped with tools such as a CNC router, laser cutter, press drill,  bench grinder, and 3D printer. It facilitates rapid prototyping, precision machining, and custom part production to support engineering and design activities.", "type": "text"}]}]}}', NULL, 70, 100, 0, 120, 90, '2026-04-04 02:27:05.015+08', '2026-04-04 02:27:03.979+08', 'published');
INSERT INTO "public"."scenes" VALUES (137, '118 - Mechanical Support Lab 3', '110-7', 22, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Mechanical Support Room is a fabrication space equipped with tools such as a CNC router, laser cutter, press drill,  bench grinder, and 3D printer. It facilitates rapid prototyping, precision machining, and custom part production to support engineering and design activities.", "type": "text"}]}]}}', NULL, 71, -60, -20, 120, 90, '2026-04-04 02:27:05.068+08', '2026-04-04 02:27:04+08', 'published');
INSERT INTO "public"."scenes" VALUES (138, 'Foyer - Level 2', 'foyer2-1', 23, NULL, NULL, 73, 200, 0, 120, 90, '2026-04-04 02:27:05.121+08', '2026-04-04 02:27:04.022+08', 'published');
INSERT INTO "public"."scenes" VALUES (139, '201 - Analog and Digital Lab 1', '201-1', 23, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Analog and Digital Lab provides students with practical skills through hands-on experiments, covering fundamental principles of electronics, computer systems, circuit theories, and digital systems. This lab is designed to enhance students'' understanding and application of these core concepts, preparing them for real-world challenges in the field of electronics and computer engineering.", "type": "text"}]}]}}', NULL, 74, 0, 0, 120, 90, '2026-04-04 02:27:05.182+08', '2026-04-04 02:27:04.047+08', 'published');
INSERT INTO "public"."scenes" VALUES (140, '201 - Analog and Digital Lab 2', '201-2', 23, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Analog and Digital Lab provides students with practical skills through hands-on experiments, covering fundamental principles of electronics, computer systems, circuit theories, and digital systems. This lab is designed to enhance students'' understanding and application of these core concepts, preparing them for real-world challenges in the field of electronics and computer engineering.", "type": "text"}]}]}}', NULL, 75, -20, 0, 120, 90, '2026-04-04 02:27:05.243+08', '2026-04-04 02:27:04.07+08', 'published');
INSERT INTO "public"."scenes" VALUES (141, '201 - Analog and Digital Lab 3', '201-3', 23, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Analog and Digital Lab provides students with practical skills through hands-on experiments, covering fundamental principles of electronics, computer systems, circuit theories, and digital systems. This lab is designed to enhance students'' understanding and application of these core concepts, preparing them for real-world challenges in the field of electronics and computer engineering.", "type": "text"}]}]}}', NULL, 76, 260, 0, 120, 90, '2026-04-04 02:27:05.293+08', '2026-04-04 02:27:04.09+08', 'published');
INSERT INTO "public"."scenes" VALUES (143, '210 - Electronics & Comm''s Lab 2', '210-2', 23, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Electronics and Communications Lab provides students with practical skills through hands-on experiments in RF Engineering, Communication Electronics, Antennas and Propagation, and Wireless Communications. This lab is equipped with advanced tools and equipment, allowing students to explore and understand the complexities of modern communication systems. By engaging in these experiments, students gain valuable experience in designing, testing, and optimizing electronic and communication devices, preparing them for careers in the rapidly evolving field of electronics and communications.", "type": "text"}]}]}}', NULL, 78, 0, 0, 120, 90, '2026-04-04 02:27:05.416+08', '2026-04-04 02:27:04.132+08', 'published');
INSERT INTO "public"."scenes" VALUES (144, '210 - Electronics & Comm''s Lab 3', '210-3', 23, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Electronics and Communications Lab provides students with practical skills through hands-on experiments in RF Engineering, Communication Electronics, Antennas and Propagation, and Wireless Communications. This lab is equipped with advanced tools and equipment, allowing students to explore and understand the complexities of modern communication systems. By engaging in these experiments, students gain valuable experience in designing, testing, and optimizing electronic and communication devices, preparing them for careers in the rapidly evolving field of electronics and communications.", "type": "text"}]}]}}', NULL, 79, 250, 0, 120, 90, '2026-04-04 02:27:05.483+08', '2026-04-04 02:27:04.152+08', 'published');
INSERT INTO "public"."scenes" VALUES (145, 'Foyer 1 - Level 3', 'foyer3-1', 24, NULL, NULL, 81, 200, 0, 120, 90, '2026-04-04 02:27:05.537+08', '2026-04-04 02:27:04.173+08', 'published');
INSERT INTO "public"."scenes" VALUES (146, 'Foyer 2 - Level 3', 'foyer3-2', 24, NULL, NULL, 82, 200, 0, 120, 90, '2026-04-04 02:27:05.586+08', '2026-04-04 02:27:04.194+08', 'published');
INSERT INTO "public"."scenes" VALUES (147, '301 - Digital Systems & Comm''s Modelling 1', '301-1', 24, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Digital and Communications Systems Lab equips students with practical skills through hands-on experiments in embedded systems, digital logic (using modern FPGAs), communication systems modeling with TIMS, optical communication systems, and digital communication systems with software-defined radios. This lab is designed to provide students with a comprehensive understanding of digital and communication systems and their applications. By working with advanced tools and technologies, students gain valuable experience in designing, implementing, and testing complex digital systems, preparing them for careers in the rapidly evolving field of digital and communication technologies.", "type": "text"}]}]}}', NULL, 83, 280, 0, 120, 90, '2026-04-04 02:27:05.631+08', '2026-04-04 02:27:04.216+08', 'published');
INSERT INTO "public"."scenes" VALUES (148, '301 - Digital Systems & Comm''s Modelling 2', '301-2', 24, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Digital and Communications Systems Lab equips students with practical skills through hands-on experiments in embedded systems, digital logic (using modern FPGAs), communication systems modeling with TIMS, optical communication systems, and digital communication systems with software-defined radios. This lab is designed to provide students with a comprehensive understanding of digital and communication systems and their applications. By working with advanced tools and technologies, students gain valuable experience in designing, implementing, and testing complex digital systems, preparing them for careers in the rapidly evolving field of digital and communication technologies.", "type": "text"}]}]}}', NULL, 84, 90, -5, 120, 90, '2026-04-04 02:27:05.675+08', '2026-04-04 02:27:04.238+08', 'published');
INSERT INTO "public"."scenes" VALUES (149, '301 - Digital Systems & Comm''s Modelling 3', '301-3', 24, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Digital and Communications Systems Lab equips students with practical skills through hands-on experiments in embedded systems, digital logic (using modern FPGAs), communication systems modeling with TIMS, optical communication systems, and digital communication systems with software-defined radios. This lab is designed to provide students with a comprehensive understanding of digital and communication systems and their applications. By working with advanced tools and technologies, students gain valuable experience in designing, implementing, and testing complex digital systems, preparing them for careers in the rapidly evolving field of digital and communication technologies.", "type": "text"}]}]}}', NULL, 85, 200, 0, 120, 90, '2026-04-04 02:27:05.716+08', '2026-04-04 02:27:04.258+08', 'published');
INSERT INTO "public"."scenes" VALUES (150, '301 - Digital Systems & Comm''s Modelling 4', '301-4', 24, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Digital and Communications Systems Lab equips students with practical skills through hands-on experiments in embedded systems, digital logic (using modern FPGAs), communication systems modeling with TIMS, optical communication systems, and digital communication systems with software-defined radios. This lab is designed to provide students with a comprehensive understanding of digital and communication systems and their applications. By working with advanced tools and technologies, students gain valuable experience in designing, implementing, and testing complex digital systems, preparing them for careers in the rapidly evolving field of digital and communication technologies.", "type": "text"}]}]}}', NULL, 86, 190, -3, 120, 90, '2026-04-04 02:27:05.757+08', '2026-04-04 02:27:04.279+08', 'published');
INSERT INTO "public"."scenes" VALUES (151, '310 - Energy and Machines Lab 1', '310-1', 24, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Energy and Machines Lab provides students with practical skills in advanced power electronics and energy systems. This includes hands-on experience with renewable energy systems and three-phase electrical machinery. The lab is designed to offer a comprehensive understanding of modern energy technologies, enabling students to design, analyze, and optimize various power and energy systems. By working with cutting-edge equipment and technologies, students are prepared for careers in the evolving field of energy engineering, focusing on sustainable and efficient energy solutions.", "type": "text"}]}]}}', NULL, 87, 200, 0, 120, 90, '2026-04-04 02:27:05.814+08', '2026-04-04 02:27:04.303+08', 'published');
INSERT INTO "public"."scenes" VALUES (129, '101 - Computer and Software Engineering Lab 1', '101-1', 22, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Computer and Software Engineering Lab is outfitted with high-performance computers featuring advanced NVIDIA GPUs. This lab offers students hands-on experience in cutting-edge fields such as the Internet of Things (IoT), Artificial Intelligence (AI), Software Defined Networks (SDN), and Multidimensional Signal Processing.", "type": "text"}]}]}}', NULL, 63, 200, 0, 120, 90, '2026-04-04 02:27:04.665+08', '2026-04-04 02:27:03.819+08', 'published');
INSERT INTO "public"."scenes" VALUES (142, '210 - Electronics & Comm''s Lab 1', '210-1', 23, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Electronics and Communications Lab provides students with practical skills through hands-on experiments in RF Engineering, Communication Electronics, Antennas and Propagation, and Wireless Communications. This lab is equipped with advanced tools and equipment, allowing students to explore and understand the complexities of modern communication systems. By engaging in these experiments, students gain valuable experience in designing, testing, and optimizing electronic and communication devices, preparing them for careers in the rapidly evolving field of electronics and communications.", "type": "text"}]}]}}', NULL, 77, -1, 0, 120, 90, '2026-04-04 02:27:05.353+08', '2026-04-04 02:27:04.112+08', 'published');
INSERT INTO "public"."scenes" VALUES (152, '310 - Energy and Machines Lab 2', '310-2', 24, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Energy and Machines Lab provides students with practical skills in advanced power electronics and energy systems. This includes hands-on experience with renewable energy systems and three-phase electrical machinery. The lab is designed to offer a comprehensive understanding of modern energy technologies, enabling students to design, analyze, and optimize various power and energy systems. By working with cutting-edge equipment and technologies, students are prepared for careers in the evolving field of energy engineering, focusing on sustainable and efficient energy solutions.", "type": "text"}]}]}}', NULL, 88, 160, 0, 120, 90, '2026-04-04 02:27:05.871+08', '2026-04-04 02:27:04.321+08', 'published');
INSERT INTO "public"."scenes" VALUES (153, '309 - RF Chamber Room 1', '309-1', 24, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The RF Chamber is a specially designed, shielded room that eliminates electromagnetic interference. It is crucial in RF engineering because electromagnetic radiation is everywhere, from both natural and artificial sources. Testing in an RF chamber ensures devices comply with communication regulations by preventing unwanted interference and avoiding regulatory violations.", "type": "text"}]}]}}', NULL, 89, 250, 0, 120, 90, '2026-04-04 02:27:05.919+08', '2026-04-04 02:27:04.343+08', 'published');
INSERT INTO "public"."scenes" VALUES (154, '309 - RF Chamber Room 2', '309-2', 24, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The RF Chamber is a specially designed, shielded room that eliminates electromagnetic interference. It is crucial in RF engineering because electromagnetic radiation is everywhere, from both natural and artificial sources. Testing in an RF chamber ensures devices comply with communication regulations by preventing unwanted interference and avoiding regulatory violations.", "type": "text"}]}]}}', NULL, 90, 200, 0, 120, 90, '2026-04-04 02:27:05.969+08', '2026-04-04 02:27:04.365+08', 'published');
INSERT INTO "public"."scenes" VALUES (155, '309 - RF Chamber Room 3', '309-3', 24, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The RF Chamber is a specially designed, shielded room that eliminates electromagnetic interference. It is crucial in RF engineering because electromagnetic radiation is everywhere, from both natural and artificial sources. Testing in an RF chamber ensures devices comply with communication regulations by preventing unwanted interference and avoiding regulatory violations.", "type": "text"}]}]}}', NULL, 91, 0, -10, 120, 90, '2026-04-04 02:27:06.013+08', '2026-04-04 02:27:04.39+08', 'published');

-- ----------------------------
-- Table structure for scenes_hotspots
-- ----------------------------
DROP TABLE IF EXISTS "public"."scenes_hotspots";
CREATE TABLE "public"."scenes_hotspots" (
  "_order" int4 NOT NULL,
  "_parent_id" int4 NOT NULL,
  "id" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "type" "public"."enum_scenes_hotspots_type",
  "pitch" numeric,
  "yaw" numeric,
  "text" varchar COLLATE "pg_catalog"."default",
  "target_scene_id" int4,
  "target_floor_id" int4,
  "info_content" jsonb,
  "css_class" varchar COLLATE "pg_catalog"."default",
  "icon_color" varchar COLLATE "pg_catalog"."default",
  "icon_size" "public"."enum_scenes_hotspots_icon_size" DEFAULT 'md'::enum_scenes_hotspots_icon_size
)
;

-- ----------------------------
-- Records of scenes_hotspots
-- ----------------------------
INSERT INTO "public"."scenes_hotspots" VALUES (1, 125, '69d0067823849e927c3a7454', 'scene', -2, 60, 'Building Entrance', 126, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (1, 126, '69d0067823849e927c3a7455', 'scene', -10, 80, 'Shepherd St Building - Level 1', 127, 22, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (2, 126, '69d0067823849e927c3a7456', 'scene', -5, 223, 'Courtyard', 125, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (1, 127, '69d0067823849e927c3a7457', 'scene', -10, 25, 'Upstairs - Level 2', 138, 23, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (2, 127, '69d0067823849e927c3a7458', 'scene', -10, 186, 'Building Entrance', 126, 21, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (3, 127, '69d0067823849e927c3a7459', 'scene', -8, 280, 'Foyer 2 - Level 1', 128, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (4, 127, '69d0067823849e927c3a745a', 'scene', -10, 90, '110 - Raymond Kirby Engineering on Display Lab', 131, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (1, 128, '69d0067823849e927c3a745b', 'scene', -8, 175, '101 - Computer and Software Engineering Lab 1', 129, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (2, 128, '69d0067823849e927c3a745c', 'scene', -20, -23, 'Foyer 1 - Level 1', 127, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (1, 129, '69d0067823849e927c3a745d', 'scene', -5, -58, 'Exit to foyer', 128, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (2, 129, '69d0067823849e927c3a745e', 'scene', -5, 170, '101 - Computer and Software Engineering Lab 2', 130, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (3, 129, '69d0067823849e927c3a745f', 'info', -20, 220, 'High-performance computers', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "A high-performance computer equipped with a state-of-the-art NVIDIA GPU, designed to handle intensive tasks such as 3D rendering, and machine learning with exceptional speed and efficiency.", "type": "text"}]}]}}', NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (4, 129, '69d0067823849e927c3a7460', 'info', -7, 180, 'Group desks', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "A designated area for project work and group discussions to facilitate effective teamwork and communication.", "type": "text"}]}]}}', NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (1, 130, '69d0067823849e927c3a7461', 'scene', 0, 0, 'Exit to foyer', 128, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (2, 130, '69d0067823849e927c3a7462', 'scene', -7, 73, '101 - Computer and Software Engineering Lab 1', 129, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (3, 130, '69d0067823849e927c3a7463', 'info', -10, 30, 'Group desks', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "A designated area for project work and group discussions to facilitate effective teamwork and communication.", "type": "text"}]}]}}', NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (1, 131, '69d0067823849e927c3a7464', 'scene', -10, 50, 'Exit to foyer', 127, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (2, 131, '69d0067823849e927c3a7465', 'scene', -18, -22, '110 - Raymond Kirby Engineering on Display Lab 2', 132, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (3, 131, '69d0067823849e927c3a7466', 'scene', -3, 188, '110 - Raymond Kirby Engineering on Display Lab 3', 133, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (4, 131, '69d0067823849e927c3a7467', 'scene', -25, 230, '110 - Raymond Kirby Engineering on Display Lab 4', 134, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (5, 131, '69d0067823849e927c3a7468', 'scene', -3, 260, '118 - Mechanical Support Lab 1', 135, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (6, 131, '69d0067823849e927c3a7469', 'info', -3, 290, 'Storage Area', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "A storage area for common electronics consumables and microchips.", "type": "text"}]}]}}', NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (7, 131, '69d0067823849e927c3a746a', 'info', -15, 280, 'Collaborative Workbench', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "A designated area with a collaborative and flexiable workbench for supporting various types of students'' project work.", "type": "text"}]}]}}', NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (8, 131, '69d0067823849e927c3a746b', 'info', -5, -10, 'Soldering and rework station', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "A soldering and rework station is used for precise soldering, desoldering, and repairing electronic components, ensuring reliable connections and efficient rework of circuit boards.", "type": "text"}]}]}}', NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (1, 132, '69d0067823849e927c3a746c', 'scene', 0, 0, 'Exit to foyer', 127, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (2, 132, '69d0067823849e927c3a746d', 'scene', -18, 150, '110 - Raymond Kirby Engineering on Display Lab 1', 131, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (3, 132, '69d0067823849e927c3a746e', 'info', -3, 220, 'Mechanical Support Room', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Mechanical Support Room is equipped with a benchtop drill, a laser cutter, a CNC router, and various other tools to assist with projects", "type": "text"}]}]}}', NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (4, 132, '69d0067823849e927c3a746f', 'info', -8, 230, 'Storage Area', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "A storage area for common electronics consumables and microchips.", "type": "text"}]}]}}', NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (5, 132, '69d0067823849e927c3a7470', 'info', -8, 70, 'Soldering and rework station', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "A soldering and rework station is used for precise soldering, desoldering, and repairing electronic components, ensuring reliable connections and efficient rework of circuit boards.", "type": "text"}]}]}}', NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (1, 133, '69d0067823849e927c3a7471', 'scene', 0, 0, 'Exit to foyer', 128, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (2, 133, '69d0067823849e927c3a7472', 'scene', -18, 60, '110 - Raymond Kirby Engineering on Display Lab 1', 131, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (3, 133, '69d0067823849e927c3a7473', 'scene', -18, -50, '110 - Raymond Kirby Engineering on Display Lab 4', 134, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (4, 133, '69d0067823849e927c3a7474', 'info', -12, 15, 'DC (Direct Current) Power Supply', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "A DC (Direct Current) power supply is an essential piece of equipment in an electronics lab. It provides a constant voltage or current to power electronic circuits and devices. The voltage outputs can be adjusted as needed.", "type": "text"}]}]}}', NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (5, 133, '69d0067823849e927c3a7475', 'info', -12, 36, 'Oscilloscope', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "An oscilloscope is a valuable tool for analyzing both analog and digital signals. It enables students and staff to quickly identify and troubleshoot issues in complex designs.", "type": "text"}]}]}}', NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (6, 133, '69d0067823849e927c3a7476', 'info', -2, 28, 'Function Generator', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "A function generator can provide reconfigurable testing of electronics devices and common modulated signals, allowing for comprehensive investigation alongside digital electronics and systems.", "type": "text"}]}]}}', NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (7, 133, '69d0067823849e927c3a7477', 'info', -13, 28, 'Digital Multimeter', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "A digital multimeter is used to measure common electrical variables, including voltage (volts), current (amps), and resistance (ohms).", "type": "text"}]}]}}', NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (1, 134, '69d0067823849e927c3a7478', 'scene', 0, 0, 'Exit to foyer', 128, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (2, 134, '69d0067823849e927c3a7479', 'scene', -18, 60, '110 - Raymond Kirby Engineering on Display Lab 1', 131, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (3, 134, '69d0067823849e927c3a747a', 'scene', -25, 150, '110 - Raymond Kirby Engineering on Display Lab 3', 133, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (4, 134, '69d0067823849e927c3a747b', 'scene', -5, -50, '118 - Mechanical Support Lab 1', 135, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (1, 135, '69d0067823849e927c3a747c', 'scene', 0, 0, 'Exit to foyer', 128, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (2, 135, '69d0067823849e927c3a747d', 'scene', -5, 95, '110 - Raymond Kirby Engineering on Display Lab 4', 134, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (3, 135, '69d0067823849e927c3a747e', 'scene', -25, 20, '118 - Mechanical Support Lab 2', 136, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (4, 135, '69d0067823849e927c3a747f', 'scene', -25, -20, '118 - Mechanical Support Lab 3', 137, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (5, 135, '69d0067823849e927c3a7480', 'info', -2, -40, 'CNC Router', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Carbide 3D Shapeoko 5 Pro is a precision CNC router built for demanding hobbyists and light industrial applications. It has a rigid motion system with advanced linear components and is designed to deliver consistent, high-quality results across various materials, including wood, plastics, and soft metals.", "type": "text"}]}]}}', NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (6, 135, '69d0067823849e927c3a7481', 'info', -2, 40, 'Laser Cutter', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Thunder Laser Thunder Bolt is a compact desktop laser cutter and engraver engineered for high-speed, high-detail work. It uses a professional-grade laser source to produce clean, accurate engravings and light cuts on materials like wood, acrylic, and leather.", "type": "text"}]}]}}', NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (7, 135, '69d0067823849e927c3a7482', 'info', -2, 140, '3D Printer', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Bambu Lab X1E is a professional 3D printer for advanced material printing and high-throughput prototyping. With a reinforced motion system, actively controlled chamber environment, and support for engineering-grade filaments, it offers consistent performance for users working with complex parts and demanding materials.", "type": "text"}]}]}}', NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (1, 136, '69d0067923849e927c3a7483', 'scene', 0, 0, 'Exit to foyer', 128, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (2, 136, '69d0067923849e927c3a7484', 'scene', -30, 210, '118 - Mechanical Support Lab 1', 135, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (3, 136, '69d0067923849e927c3a7485', 'scene', -35, -70, '118 - Mechanical Support Lab 3', 137, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (4, 136, '69d0067923849e927c3a7486', 'info', -2, -100, 'CNC Router', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Carbide 3D Shapeoko 5 Pro is a precision CNC router built for demanding hobbyists and light industrial applications. It has a rigid motion system with advanced linear components and is designed to deliver consistent, high-quality results across various materials, including wood, plastics, and soft metals.", "type": "text"}]}]}}', NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (5, 136, '69d0067923849e927c3a7487', 'info', -20, 170, 'Laser Cutter', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Thunder Laser Thunder Bolt is a compact desktop laser cutter and engraver engineered for high-speed, high-detail work. It uses a professional-grade laser source to produce clean, accurate engravings and light cuts on materials like wood, acrylic, and leather.", "type": "text"}]}]}}', NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (6, 136, '69d0067923849e927c3a7488', 'info', -2, 190, '3D Printer', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Bambu Lab X1E is a professional 3D printer for advanced material printing and high-throughput prototyping. With a reinforced motion system, actively controlled chamber environment, and support for engineering-grade filaments, it offers consistent performance for users working with complex parts and demanding materials.", "type": "text"}]}]}}', NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (1, 137, '69d0067923849e927c3a7489', 'scene', 0, 0, 'Exit to foyer', 128, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (2, 137, '69d0067923849e927c3a748a', 'scene', -20, 150, '118 - Mechanical Support Lab 1', 135, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (3, 137, '69d0067923849e927c3a748b', 'scene', -30, 90, '118 - Mechanical Support Lab 2', 136, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (4, 137, '69d0067923849e927c3a748c', 'info', -2, -160, 'CNC Router', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Carbide 3D Shapeoko 5 Pro is a precision CNC router built for demanding hobbyists and light industrial applications. It has a rigid motion system with advanced linear components and is designed to deliver consistent, high-quality results across various materials, including wood, plastics, and soft metals.", "type": "text"}]}]}}', NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (5, 137, '69d0067923849e927c3a748d', 'info', -2, 100, 'Laser Cutter', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Thunder Laser Thunder Bolt is a compact desktop laser cutter and engraver engineered for high-speed, high-detail work. It uses a professional-grade laser source to produce clean, accurate engravings and light cuts on materials like wood, acrylic, and leather.", "type": "text"}]}]}}', NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (6, 137, '69d0067923849e927c3a748e', 'info', -2, 150, '3D Printer', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The Bambu Lab X1E is a professional 3D printer for advanced material printing and high-throughput prototyping. With a reinforced motion system, actively controlled chamber environment, and support for engineering-grade filaments, it offers consistent performance for users working with complex parts and demanding materials.", "type": "text"}]}]}}', NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (1, 138, '69d0067923849e927c3a748f', 'scene', -10, -100, 'Upstairs - Level 3', 145, 24, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (2, 138, '69d0067923849e927c3a7490', 'scene', -13, -65, 'Downstairs - Level 1', 127, 22, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (3, 138, '69d0067923849e927c3a7491', 'scene', -6, 170, '201 - Analog and Digital Lab 1', 139, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (4, 138, '69d0067923849e927c3a7492', 'scene', -5, -26, '210 - Electronics and Comms Lab 1', 142, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (1, 139, '69d0067923849e927c3a7493', 'scene', -8, 195, 'Exit to foyer', 138, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (2, 139, '69d0067923849e927c3a7494', 'scene', -8, -26, '201 - Analog and Digital Lab 2', 140, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (3, 139, '69d0067923849e927c3a7495', 'scene', -3, 8, '201 - Analog and Digital Lab 3', 141, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (4, 139, '69d0067923849e927c3a7496', 'info', -10, -10, 'Assorted test leads and hook-up cables', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "Assorted test leads and hook-up cables are used to establish temporary or permanent connections between electronic components, devices, and testing equipment. ", "type": "text"}]}]}}', NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (1, 140, '69d0067923849e927c3a7497', 'scene', 0, 0, 'Exit to foyer', 138, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (2, 140, '69d0067923849e927c3a7498', 'scene', -7, 50, '201 - Analog and Digital Lab 1', 139, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (3, 140, '69d0067923849e927c3a7499', 'scene', -10, -120, '201 - Analog and Digital Lab 3', 141, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (4, 140, '69d0067923849e927c3a749a', 'info', 2, -63, 'DC (Direct Current) Power Supply', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "A DC (Direct Current) power supply is an essential piece of equipment in an electronics lab. It provides a constant voltage or current to power electronic circuits and devices. The voltage outputs can be adjusted as needed.", "type": "text"}]}]}}', NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (5, 140, '69d0067923849e927c3a749b', 'info', 2, -50, 'Digital Multimeter', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "A digital multimeter is used to measure common electrical variables, including voltage (volts), current (amps), and resistance (ohms).", "type": "text"}]}]}}', NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (6, 140, '69d0067923849e927c3a749c', 'info', 10, -30, 'Oscilloscope', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "An oscilloscope is a valuable tool for analyzing both analog and digital signals. It enables students and staff to quickly identify and troubleshoot issues in complex designs.", "type": "text"}]}]}}', NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (7, 140, '69d0067923849e927c3a749d', 'info', 15, -50, 'Function Generator', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "A function generator can provide reconfigurable testing of electronics devices and common modulated signals, allowing for comprehensive investigation alongside digital electronics and systems.", "type": "text"}]}]}}', NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (8, 140, '69d0067923849e927c3a749e', 'info', -23, -48, 'NI ELVIS II prototyping platform', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The NI ELVIS II prototyping platform is a modular educational laboratory device that integrates commonly used instruments, including an oscilloscope, digital multimeter, function generator, variable power supply, and Bode analyzer. Students can connect a PC to these instruments via USB plug-and-play capabilities and build circuits on a detachable protoboard.", "type": "text"}]}]}}', NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (1, 141, '69d0067923849e927c3a749f', 'scene', 0, 0, 'Exit to foyer', 138, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (2, 141, '69d0067923849e927c3a74a0', 'scene', 0, 275, '201 - Analog and Digital Lab 1', 139, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (3, 141, '69d0067923849e927c3a74a1', 'scene', -2, -50, '201 - Analog and Digital Lab 2', 140, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (4, 141, '69d0067923849e927c3a74a2', 'info', -10, -60, 'Assorted test leads and hook-up cables', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "Assorted test leads and hook-up cables are used to establish temporary or permanent connections between electronic components, devices, and testing equipment. ", "type": "text"}]}]}}', NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (5, 141, '69d0067923849e927c3a74a3', 'info', -20, -10, 'Robotics Maze', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "A Robotics Maze is a specially designed area where robots can navigate through a series of paths and obstacles. It''s used for testing and developing robotic algorithms, particularly those related to navigation, obstacle avoidance, and autonomous decision-making", "type": "text"}]}]}}', NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (6, 141, '69d0067923849e927c3a74a4', 'info', 5, 5, 'Storage Cupboards', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The cupboard storage contains all the items (e.g. devices, consumables, PCB boards and parts) needed to support individual UoS.", "type": "text"}]}]}}', NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (1, 142, '69d0067923849e927c3a74a5', 'scene', 0, 0, 'Exit to foyer', 138, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (2, 142, '69d0067923849e927c3a74a6', 'scene', -20, 90, '210 - Electronics & Comm''s Lab 2', 143, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (3, 142, '69d0067923849e927c3a74a7', 'scene', -10, 220, '210 - Electronics & Comm''s Lab  3', 144, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (4, 142, '69d0067923849e927c3a74a8', 'info', -12, -6, 'DC (Direct Current) Power Supply', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "A DC (Direct Current) power supply is an essential piece of equipment in an electronics lab. It provides a constant voltage or current to power electronic circuits and devices. The voltage outputs can be adjusted as needed.", "type": "text"}]}]}}', NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (5, 142, '69d0067923849e927c3a74a9', 'info', -1, 20, 'Oscilloscope', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "An oscilloscope is a valuable tool for analyzing both analog and digital signals. It enables students and staff to quickly identify and troubleshoot issues in complex designs.", "type": "text"}]}]}}', NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (6, 142, '69d0067923849e927c3a74aa', 'info', -13, 5, 'Function Generator', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "A function generator can provide reconfigurable testing of electronics devices and common modulated signals, allowing for comprehensive investigation alongside digital electronics and systems.", "type": "text"}]}]}}', NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (7, 142, '69d0067923849e927c3a74ab', 'info', -1, 5, 'Digital Multimeter', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "A digital multimeter is used to measure common electrical variables, including voltage (volts), current (amps), and resistance (ohms).", "type": "text"}]}]}}', NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (8, 142, '69d0067923849e927c3a74ac', 'info', -1, -18, 'Spectrum Analyzer', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "A spectrum analyzer is a device that measures and displays the frequency spectrum of electrical signals. It shows the magnitude of an input signal across the instrument''s entire frequency range. This enables users to observe the power of both known and unknown signals, identify dominant frequencies, and analyze other spectral components", "type": "text"}]}]}}', NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (9, 142, '69d0067923849e927c3a74ad', 'info', -5, -80, 'Cupboard Storage', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The cupboard storage contains all the items (e.g. PCB boards, devices, consumables, and parts) needed to support individual UoS.", "type": "text"}]}]}}', NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (10, 142, '69d0067923849e927c3a74ae', 'info', -5, 65, 'Cupboard Storage', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The cupboard storage contains all the items (e.g. PCB boards, devices, consumables, and parts) needed to support individual UoS.", "type": "text"}]}]}}', NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (1, 143, '69d0067923849e927c3a74af', 'scene', -10, 62, 'Exit to foyer', 138, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (2, 143, '69d0067923849e927c3a74b0', 'scene', -20, 0, '210 - Electronics & Comm''s Lab 1', 142, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (3, 143, '69d0067923849e927c3a74b1', 'scene', 0, -60, '210 - Electronics & Comm''s Lab 3', 144, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (4, 143, '69d0067923849e927c3a74b2', 'info', -15, -15, 'Assorted test leads and hook-up cables', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "Assorted test leads and hook-up cables are used to establish temporary or permanent connections between electronic components, devices, and testing equipment. ", "type": "text"}]}]}}', NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (5, 143, '69d0067923849e927c3a74b3', 'info', -10, 25, 'Assorted test leads and hook-up cables', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "Assorted test leads and hook-up cables are used to establish temporary or permanent connections between electronic components, devices, and testing equipment. ", "type": "text"}]}]}}', NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (1, 144, '69d0067923849e927c3a74b4', 'scene', 0, 0, 'Exit to foyer', 138, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (2, 144, '69d0067923849e927c3a74b5', 'scene', -15, 232, '201 - Electronics & Comm''s Lab 1', 142, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (3, 144, '69d0067923849e927c3a74b6', 'scene', -5, 280, '201 - Electronics & Comm''s Labs 2', 143, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (4, 144, '69d0067923849e927c3a74b7', 'info', -10, 250, 'Assorted test leads and hook-up cables', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "Assorted test leads and hook-up cables are used to establish temporary or permanent connections between electronic components, devices, and testing equipment. ", "type": "text"}]}]}}', NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (1, 145, '69d0067923849e927c3a74b8', 'scene', -25, 195, 'Downstairs - Level 2', 138, 23, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (2, 145, '69d0067923849e927c3a74b9', 'scene', -10, 73, 'Foyer 2 - Level 3', 146, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (3, 145, '69d0067923849e927c3a74ba', 'scene', -10, 243, '310 - Energy and Machines Lab 1', 151, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (1, 146, '69d0067923849e927c3a74bb', 'scene', -10, 25, 'Foyer 1 - Level 3', 145, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (2, 146, '69d0067923849e927c3a74bc', 'scene', -10, 225, '301 - Digital Systems & Comm''s Modelling 1', 147, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (3, 146, '69d0067923849e927c3a74bd', 'scene', -5, -8, '309 - RF Chamber Room 1', 153, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (1, 147, '69d0067923849e927c3a74be', 'scene', -10, 75, 'Exit to foyer', 146, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (2, 147, '69d0067923849e927c3a74bf', 'scene', -25, 190, '301 - Digital Systems & Comm''s Modelling 2', 148, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (3, 147, '69d0067923849e927c3a74c0', 'scene', 5, 295, '301 - Digital Systems & Comm''s Modelling 3', 149, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (4, 147, '69d0067923849e927c3a74c1', 'scene', -7, 273, '301 - Digital Systems & Comm''s Modelling 4', 150, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (1, 148, '69d0067923849e927c3a74c2', 'scene', 0, 0, 'Exit to foyer', 146, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (2, 148, '69d0067923849e927c3a74c3', 'scene', -20, 0, '301 - Digital Systems & Comm''s Modelling 1', 147, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (3, 148, '69d0067923849e927c3a74c4', 'info', -15, 90, 'Soldering and rework station', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "A soldering and rework station is used for precise soldering, desoldering, and repairing electronic components, ensuring reliable connections and efficient rework of circuit boards.", "type": "text"}]}]}}', NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (1, 149, '69d0067923849e927c3a74c5', 'scene', 0, 0, 'Exit to foyer', 146, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (2, 149, '69d0067923849e927c3a74c6', 'scene', 0, -110, '301 - Digital Systems & Comm''s Modelling 1', 147, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (3, 149, '69d0067923849e927c3a74c7', 'scene', -10, -85, '301 - Digital Systems & Comm''s Modelling 4', 150, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (4, 149, '69d0067923849e927c3a74c8', 'info', -20, -60, 'Group Desks', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "A designated area for project work and group discussions to facilitate effective teamwork and communication.", "type": "text"}]}]}}', NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (5, 149, '69d0067923849e927c3a74c9', 'info', 0, -50, 'Storage Cupboards', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The cupboard storage contains all the items (e.g. devices, consumables, TIMS cards and parts) needed to support individual UoS.", "type": "text"}]}]}}', NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (1, 150, '69d0067923849e927c3a74ca', 'scene', 0, 0, 'Exit to foyer', 146, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (2, 150, '69d0067923849e927c3a74cb', 'scene', -8, 85, '301 - Digital Systems & Comm''s Modelling 1', 147, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (3, 150, '69d0067923849e927c3a74cc', 'scene', -15, -5, '301 - Digital Systems & Comm''s Modelling 3', 149, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (4, 150, '69d0067923849e927c3a74cd', 'info', -15, 156, 'TIMS (Telecommunications Modelling System)', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "TIMS is a telecommunications modelling system. It models mathematical equations representing electrical signals, or block diagrams representing telecommunications systems. Physically, TIMS is a dual rack system. The top rack accepts up to 12 Eurocard sized, compatible ''black boxes'', or modules. The lower rack houses a number of fixed modules, as well as the system power supply. Modules are patched together via the front panel sockets using interconnecting leads, to model the system under investigation.", "type": "text"}]}]}}', NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (5, 150, '69d0067923849e927c3a74ce', 'info', -10, -30, 'Group Desks', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "A designated area for project work and group discussions to facilitate effective teamwork and communication.", "type": "text"}]}]}}', NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (6, 150, '69d0067923849e927c3a74cf', 'info', 2, 140, 'DC (Direct Current) Power Supply', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "A DC (Direct Current) power supply is an essential piece of equipment in an electronics lab. It provides a constant voltage or current to power electronic circuits and devices. The voltage outputs can be adjusted as needed.", "type": "text"}]}]}}', NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (7, 150, '69d0067923849e927c3a74d0', 'info', 20, 160, 'Oscilloscope', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "An oscilloscope is a valuable tool for analyzing both analog and digital signals. It enables students and staff to quickly identify and troubleshoot issues in complex designs.", "type": "text"}]}]}}', NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (8, 150, '69d0067923849e927c3a74d1', 'info', 17, 185, 'Function Generator', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "A function generator can provide reconfigurable testing of electronics devices and common modulated signals, allowing for comprehensive investigation alongside digital electronics and systems.", "type": "text"}]}]}}', NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (9, 150, '69d0067923849e927c3a74d2', 'info', 18, 140, 'Digital Multimeter', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "A digital multimeter is used to measure common electrical variables, including voltage (volts), current (amps), and resistance (ohms).", "type": "text"}]}]}}', NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (1, 151, '69d0067923849e927c3a74d3', 'scene', -6, -45, 'Exit to foyer', 145, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (2, 151, '69d0067923849e927c3a74d4', 'scene', -15, 110, '310 - Energy and Machines Lab 1', 152, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (3, 151, '69d0067923849e927c3a74d5', 'info', 3, 190, 'Advanced testing instruments', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "Each workbench is equipped with advanced testing instruments, including Tektronix oscilloscopes, multi-channel function generators, high-capacity DC power supply units, and Tektronix current probes. These tools are essential for supporting the teaching of various units of study in electrical engineering and power engineering. The lab provides a comprehensive environment for students to gain hands-on experience with cutting-edge equipment, enhancing their practical skills and understanding of complex electrical and power systems.", "type": "text"}]}]}}', NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (4, 151, '69d0067923849e927c3a74d6', 'info', 8, 230, 'Labvolt modules', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "Lab 310 is equipped with a comprehensive range of Labvolt modules, covering areas from power electronics and renewable energy to three-phase electrical machinery. This includes IGBT inverters, thyristors, rectifiers, batteries, and DC, induction, and synchronous machines.", "type": "text"}]}]}}', NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (5, 151, '69d0067923849e927c3a74d7', 'info', -2, 255, 'Test leads and hook-up cables', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "Assorted test leads and hook-up cables are used to establish temporary or permanent connections between electronic components, devices, and testing equipment.", "type": "text"}]}]}}', NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (1, 152, '69d0067923849e927c3a74d8', 'scene', 0, 0, 'Exit to foyer', 145, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (2, 152, '69d0067923849e927c3a74d9', 'scene', -6, 143, '310 - Energy and Machines Lab 1', 151, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (3, 152, '69d0067923849e927c3a74da', 'info', -30, 150, 'Group Desks', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "A designated area for project work and group discussions to facilitate effective teamwork and communication.", "type": "text"}]}]}}', NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (1, 153, '69d0067923849e927c3a74db', 'scene', -15, 125, 'Exit to foyer', 146, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (2, 153, '69d0067923849e927c3a74dc', 'scene', -15, 290, '309 - RF Chamber Room 2', 154, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (3, 153, '69d0067923849e927c3a74dd', 'info', -10, 275, '309 - RF Chamber', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The RF Chamber is a specially designed, shielded room that eliminates electromagnetic interference. Its interior is lined with materials that absorb radiation, creating a controlled environment for precise testing and measurement of radio frequency (RF) devices. This chamber allows for rigorous testing of RF emissions, immunity, and other RF-related characteristics.", "type": "text"}]}]}}', NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (4, 153, '69d0067923849e927c3a74de', 'info', 2, 226, 'Signal Analyzer', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "Used for analyzing the performance and characteristics of RF signals.", "type": "text"}]}]}}', NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (5, 153, '69d0067923849e927c3a74df', 'info', -6, 226, 'Vector Network Analyzer', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "Measures the network characteristics of RF devices, enabling a detailed analysis of performance.", "type": "text"}]}]}}', NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (6, 153, '69d0067923849e927c3a74e0', 'info', -14, 236, 'Vector Signal Generator', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "Generates high-quality signals for testing and analysis.", "type": "text"}]}]}}', NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (1, 154, '69d0067923849e927c3a74e1', 'scene', 0, 0, 'Exit to foyer', 146, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (2, 154, '69d0067923849e927c3a74e2', 'scene', -20, 153, '309 - RF Chamber Room 1', 153, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (3, 154, '69d0067923849e927c3a74e3', 'scene', -15, 210, '309 - RF Chamber Room 3', 155, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (4, 154, '69d0067923849e927c3a74e4', 'info', -10, 225, 'Antenna Mast', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The antenna mast is a structure that supports and positions antennas at various heights and angles within the RF chamber.", "type": "text"}]}]}}', NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (5, 154, '69d0067923849e927c3a74e5', 'info', -35, 225, 'DUT Table', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The DUT table is a platform where the device under test is placed during measurements. It is typically made of non-conductive materials to avoid interference with the RF signals.", "type": "text"}]}]}}', NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (1, 155, '69d0067a23849e927c3a74e6', 'scene', 0, 0, 'Exit to foyer', 146, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (2, 155, '69d0067a23849e927c3a74e7', 'scene', -10, 55, '309 - RF Chamber Room 1', 153, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (3, 155, '69d0067a23849e927c3a74e8', 'scene', -15, 35, '309 - RF Chamber Room 2', 154, NULL, NULL, NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (4, 155, '69d0067a23849e927c3a74e9', 'info', -10, -30, 'Antenna Mast', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The antenna mast is a structure that supports and positions antennas at various heights and angles within the RF chamber.", "type": "text"}]}]}}', NULL, NULL, 'md');
INSERT INTO "public"."scenes_hotspots" VALUES (5, 155, '69d0067a23849e927c3a74ea', 'info', -10, 25, 'DUT Table', NULL, NULL, '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "The DUT table is a platform where the device under test is placed during measurements. It is typically made of non-conductive materials to avoid interference with the RF signals.", "type": "text"}]}]}}', NULL, NULL, 'md');

-- ----------------------------
-- Table structure for scenes_tags
-- ----------------------------
DROP TABLE IF EXISTS "public"."scenes_tags";
CREATE TABLE "public"."scenes_tags" (
  "_order" int4 NOT NULL,
  "_parent_id" int4 NOT NULL,
  "id" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "tag" varchar COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Records of scenes_tags
-- ----------------------------

-- ----------------------------
-- Table structure for tours
-- ----------------------------
DROP TABLE IF EXISTS "public"."tours";
CREATE TABLE "public"."tours" (
  "id" int4 NOT NULL DEFAULT nextval('tours_id_seq'::regclass),
  "title" varchar COLLATE "pg_catalog"."default",
  "slug" varchar COLLATE "pg_catalog"."default",
  "description" jsonb,
  "cover_image_id" int4,
  "welcome_title" varchar COLLATE "pg_catalog"."default",
  "welcome_text" jsonb,
  "default_floor_id" int4,
  "updated_at" timestamptz(3) NOT NULL DEFAULT now(),
  "created_at" timestamptz(3) NOT NULL DEFAULT now(),
  "_status" "public"."enum_tours_status" DEFAULT 'draft'::enum_tours_status
)
;

-- ----------------------------
-- Records of tours
-- ----------------------------
INSERT INTO "public"."tours" VALUES (10, 'USYD Shepherd Street Building (J15)', 'shepherd-street-j15', NULL, 92, 'Welcome to the Shepherd Street Building (J15)', '{"root": {"type": "root", "children": [{"type": "paragraph", "children": [{"text": "Welcome to the J15 Shepherd Street Building! This premier facility features seven state-of-the-art laboratories dedicated to the discipline of electrical and computer engineering (ECE). Engineered to spark innovation and hands-on learning, the J15 ECE Labs are outfitted with the latest instruments and resources, empowering both students and academics to achieve unparalleled excellence.", "type": "text"}]}]}}', 21, '2026-04-04 02:27:06.202+08', '2026-04-04 02:27:03.604+08', 'published');

-- ----------------------------
-- Table structure for tours_rels
-- ----------------------------
DROP TABLE IF EXISTS "public"."tours_rels";
CREATE TABLE "public"."tours_rels" (
  "id" int4 NOT NULL DEFAULT nextval('tours_rels_id_seq'::regclass),
  "order" int4,
  "parent_id" int4 NOT NULL,
  "path" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "floors_id" int4
)
;

-- ----------------------------
-- Records of tours_rels
-- ----------------------------
INSERT INTO "public"."tours_rels" VALUES (17, 1, 10, 'floors', 21);
INSERT INTO "public"."tours_rels" VALUES (18, 2, 10, 'floors', 22);
INSERT INTO "public"."tours_rels" VALUES (19, 3, 10, 'floors', 23);
INSERT INTO "public"."tours_rels" VALUES (20, 4, 10, 'floors', 24);

-- ----------------------------
-- Table structure for tours_tags
-- ----------------------------
DROP TABLE IF EXISTS "public"."tours_tags";
CREATE TABLE "public"."tours_tags" (
  "_order" int4 NOT NULL,
  "_parent_id" int4 NOT NULL,
  "id" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "tag" varchar COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Records of tours_tags
-- ----------------------------
INSERT INTO "public"."tours_tags" VALUES (1, 10, '69d0067723849e927c3a7452', 'engineering');
INSERT INTO "public"."tours_tags" VALUES (2, 10, '69d0067723849e927c3a7453', 'campus');

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS "public"."users";
CREATE TABLE "public"."users" (
  "id" int4 NOT NULL DEFAULT nextval('users_id_seq'::regclass),
  "updated_at" timestamptz(3) NOT NULL DEFAULT now(),
  "created_at" timestamptz(3) NOT NULL DEFAULT now(),
  "email" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "reset_password_token" varchar COLLATE "pg_catalog"."default",
  "reset_password_expiration" timestamptz(3),
  "salt" varchar COLLATE "pg_catalog"."default",
  "hash" varchar COLLATE "pg_catalog"."default",
  "login_attempts" numeric DEFAULT 0,
  "lock_until" timestamptz(3)
)
;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO "public"."users" VALUES (1, '2026-04-04 02:08:11.694+08', '2026-04-04 02:08:11.693+08', 'admin@test.com', NULL, NULL, '1db3e748378fe2bb28e1a8743b7a1eccb1591a630898825f876d7645f7a5b65d', 'c983090d7258dc931891b01759473983ed8b3a42989b94acf1c1441fcbe1cc47eb8bf952b1ae97e03c68dbea241e58cdabb9499811c629dce228ea8fcc14894abf0c1a8b4aa3b2db5cd6fc0402c028b89bc4ccf0553caf2f8ed830c0353a8b66c3f8e3c5e600f626eaa86036ac9213a56cc51850b8b9d3ca361637346d7e98054fbdba18d86395f26d27e5978cacc9e927b2f8ad0b15ed1a252f9c20034d9318cc8ee80ddd5cb3b8135881289861548c252429d6e8d67d0dafb4ec38cc34e4d433f9e3f9e041ceadbdee5b721b4967da1bfac4c5bbaf06191055c3b9f957ce660affa819a9fc41e33ed81ce05640f67e295d0ef350b990595d9016193a26536d9fcacbf8dee3536a785da74dadc3034bdd89206a60f031a20a1ae8fd440dc27e2d207d6cf3aa83f2406d8e04f8b5ec4aaf8ab4f9c5a5e90126beda52d9d65ac4b395770baa29d0eb16b94fe6c0181e425eb81a74928c2ca1b283d42827eae29a42eb2477d2b42e44940ff024b5aa46e23f2226c710ef789d0b774d8ee230521e5204539a6d751605d6df5616c451a43ed919b7c61340ab61915c8b318eca393223f0507a0783d46973e4290b84d8c18f000bae7503c31eccfa02d798800d35572855c31c045e4eef69aa8c02ffdd1bbcbf56c6af7b4f024a2fe2a2a99eb0d0ba49e86629921779264b0d5691d3d6dbd009c61eeb13ccd2d97e44bac2e811c426', 0, NULL);

-- ----------------------------
-- Table structure for users_sessions
-- ----------------------------
DROP TABLE IF EXISTS "public"."users_sessions";
CREATE TABLE "public"."users_sessions" (
  "_order" int4 NOT NULL,
  "_parent_id" int4 NOT NULL,
  "id" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "created_at" timestamptz(3),
  "expires_at" timestamptz(3) NOT NULL
)
;

-- ----------------------------
-- Records of users_sessions
-- ----------------------------
INSERT INTO "public"."users_sessions" VALUES (1, 1, 'eae023bc-8330-45fe-bb7b-7a1bf6bdf93a', '2026-04-04 02:08:11.852+08', '2026-04-04 04:08:11.852+08');

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."_scenes_v_id_seq"
OWNED BY "public"."_scenes_v"."id";
SELECT setval('"public"."_scenes_v_id_seq"', 310, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."_scenes_v_version_hotspots_id_seq"
OWNED BY "public"."_scenes_v_version_hotspots"."id";
SELECT setval('"public"."_scenes_v_version_hotspots_id_seq"', 755, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."_scenes_v_version_tags_id_seq"
OWNED BY "public"."_scenes_v_version_tags"."id";
SELECT setval('"public"."_scenes_v_version_tags_id_seq"', 1, false);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."_tours_v_id_seq"
OWNED BY "public"."_tours_v"."id";
SELECT setval('"public"."_tours_v_id_seq"', 11, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."_tours_v_rels_id_seq"
OWNED BY "public"."_tours_v_rels"."id";
SELECT setval('"public"."_tours_v_rels_id_seq"', 20, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."_tours_v_version_tags_id_seq"
OWNED BY "public"."_tours_v_version_tags"."id";
SELECT setval('"public"."_tours_v_version_tags_id_seq"', 22, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."floors_id_seq"
OWNED BY "public"."floors"."id";
SELECT setval('"public"."floors_id_seq"', 24, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."media_id_seq"
OWNED BY "public"."media"."id";
SELECT setval('"public"."media_id_seq"', 92, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."payload_kv_id_seq"
OWNED BY "public"."payload_kv"."id";
SELECT setval('"public"."payload_kv_id_seq"', 1, false);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."payload_locked_documents_id_seq"
OWNED BY "public"."payload_locked_documents"."id";
SELECT setval('"public"."payload_locked_documents_id_seq"', 1, false);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."payload_locked_documents_rels_id_seq"
OWNED BY "public"."payload_locked_documents_rels"."id";
SELECT setval('"public"."payload_locked_documents_rels_id_seq"', 1, false);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."payload_migrations_id_seq"
OWNED BY "public"."payload_migrations"."id";
SELECT setval('"public"."payload_migrations_id_seq"', 1, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."payload_preferences_id_seq"
OWNED BY "public"."payload_preferences"."id";
SELECT setval('"public"."payload_preferences_id_seq"', 6, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."payload_preferences_rels_id_seq"
OWNED BY "public"."payload_preferences_rels"."id";
SELECT setval('"public"."payload_preferences_rels_id_seq"', 7, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."scenes_id_seq"
OWNED BY "public"."scenes"."id";
SELECT setval('"public"."scenes_id_seq"', 155, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."tours_id_seq"
OWNED BY "public"."tours"."id";
SELECT setval('"public"."tours_id_seq"', 10, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."tours_rels_id_seq"
OWNED BY "public"."tours_rels"."id";
SELECT setval('"public"."tours_rels_id_seq"', 20, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."users_id_seq"
OWNED BY "public"."users"."id";
SELECT setval('"public"."users_id_seq"', 1, true);

-- ----------------------------
-- Indexes structure for table _scenes_v
-- ----------------------------
CREATE INDEX "_scenes_v_created_at_idx" ON "public"."_scenes_v" USING btree (
  "created_at" "pg_catalog"."timestamptz_ops" ASC NULLS LAST
);
CREATE INDEX "_scenes_v_latest_idx" ON "public"."_scenes_v" USING btree (
  "latest" "pg_catalog"."bool_ops" ASC NULLS LAST
);
CREATE INDEX "_scenes_v_parent_idx" ON "public"."_scenes_v" USING btree (
  "parent_id" "pg_catalog"."int4_ops" ASC NULLS LAST
);
CREATE INDEX "_scenes_v_updated_at_idx" ON "public"."_scenes_v" USING btree (
  "updated_at" "pg_catalog"."timestamptz_ops" ASC NULLS LAST
);
CREATE INDEX "_scenes_v_version_version__status_idx" ON "public"."_scenes_v" USING btree (
  "version__status" "pg_catalog"."enum_ops" ASC NULLS LAST
);
CREATE INDEX "_scenes_v_version_version_created_at_idx" ON "public"."_scenes_v" USING btree (
  "version_created_at" "pg_catalog"."timestamptz_ops" ASC NULLS LAST
);
CREATE INDEX "_scenes_v_version_version_floor_idx" ON "public"."_scenes_v" USING btree (
  "version_floor_id" "pg_catalog"."int4_ops" ASC NULLS LAST
);
CREATE INDEX "_scenes_v_version_version_panorama_idx" ON "public"."_scenes_v" USING btree (
  "version_panorama_id" "pg_catalog"."int4_ops" ASC NULLS LAST
);
CREATE INDEX "_scenes_v_version_version_slug_idx" ON "public"."_scenes_v" USING btree (
  "version_slug" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "_scenes_v_version_version_updated_at_idx" ON "public"."_scenes_v" USING btree (
  "version_updated_at" "pg_catalog"."timestamptz_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table _scenes_v
-- ----------------------------
ALTER TABLE "public"."_scenes_v" ADD CONSTRAINT "_scenes_v_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table _scenes_v_version_hotspots
-- ----------------------------
CREATE INDEX "_scenes_v_version_hotspots_order_idx" ON "public"."_scenes_v_version_hotspots" USING btree (
  "_order" "pg_catalog"."int4_ops" ASC NULLS LAST
);
CREATE INDEX "_scenes_v_version_hotspots_parent_id_idx" ON "public"."_scenes_v_version_hotspots" USING btree (
  "_parent_id" "pg_catalog"."int4_ops" ASC NULLS LAST
);
CREATE INDEX "_scenes_v_version_hotspots_target_floor_idx" ON "public"."_scenes_v_version_hotspots" USING btree (
  "target_floor_id" "pg_catalog"."int4_ops" ASC NULLS LAST
);
CREATE INDEX "_scenes_v_version_hotspots_target_scene_idx" ON "public"."_scenes_v_version_hotspots" USING btree (
  "target_scene_id" "pg_catalog"."int4_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table _scenes_v_version_hotspots
-- ----------------------------
ALTER TABLE "public"."_scenes_v_version_hotspots" ADD CONSTRAINT "_scenes_v_version_hotspots_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table _scenes_v_version_tags
-- ----------------------------
CREATE INDEX "_scenes_v_version_tags_order_idx" ON "public"."_scenes_v_version_tags" USING btree (
  "_order" "pg_catalog"."int4_ops" ASC NULLS LAST
);
CREATE INDEX "_scenes_v_version_tags_parent_id_idx" ON "public"."_scenes_v_version_tags" USING btree (
  "_parent_id" "pg_catalog"."int4_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table _scenes_v_version_tags
-- ----------------------------
ALTER TABLE "public"."_scenes_v_version_tags" ADD CONSTRAINT "_scenes_v_version_tags_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table _tours_v
-- ----------------------------
CREATE INDEX "_tours_v_created_at_idx" ON "public"."_tours_v" USING btree (
  "created_at" "pg_catalog"."timestamptz_ops" ASC NULLS LAST
);
CREATE INDEX "_tours_v_latest_idx" ON "public"."_tours_v" USING btree (
  "latest" "pg_catalog"."bool_ops" ASC NULLS LAST
);
CREATE INDEX "_tours_v_parent_idx" ON "public"."_tours_v" USING btree (
  "parent_id" "pg_catalog"."int4_ops" ASC NULLS LAST
);
CREATE INDEX "_tours_v_updated_at_idx" ON "public"."_tours_v" USING btree (
  "updated_at" "pg_catalog"."timestamptz_ops" ASC NULLS LAST
);
CREATE INDEX "_tours_v_version_version__status_idx" ON "public"."_tours_v" USING btree (
  "version__status" "pg_catalog"."enum_ops" ASC NULLS LAST
);
CREATE INDEX "_tours_v_version_version_cover_image_idx" ON "public"."_tours_v" USING btree (
  "version_cover_image_id" "pg_catalog"."int4_ops" ASC NULLS LAST
);
CREATE INDEX "_tours_v_version_version_created_at_idx" ON "public"."_tours_v" USING btree (
  "version_created_at" "pg_catalog"."timestamptz_ops" ASC NULLS LAST
);
CREATE INDEX "_tours_v_version_version_default_floor_idx" ON "public"."_tours_v" USING btree (
  "version_default_floor_id" "pg_catalog"."int4_ops" ASC NULLS LAST
);
CREATE INDEX "_tours_v_version_version_slug_idx" ON "public"."_tours_v" USING btree (
  "version_slug" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "_tours_v_version_version_updated_at_idx" ON "public"."_tours_v" USING btree (
  "version_updated_at" "pg_catalog"."timestamptz_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table _tours_v
-- ----------------------------
ALTER TABLE "public"."_tours_v" ADD CONSTRAINT "_tours_v_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table _tours_v_rels
-- ----------------------------
CREATE INDEX "_tours_v_rels_floors_id_idx" ON "public"."_tours_v_rels" USING btree (
  "floors_id" "pg_catalog"."int4_ops" ASC NULLS LAST
);
CREATE INDEX "_tours_v_rels_order_idx" ON "public"."_tours_v_rels" USING btree (
  "order" "pg_catalog"."int4_ops" ASC NULLS LAST
);
CREATE INDEX "_tours_v_rels_parent_idx" ON "public"."_tours_v_rels" USING btree (
  "parent_id" "pg_catalog"."int4_ops" ASC NULLS LAST
);
CREATE INDEX "_tours_v_rels_path_idx" ON "public"."_tours_v_rels" USING btree (
  "path" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table _tours_v_rels
-- ----------------------------
ALTER TABLE "public"."_tours_v_rels" ADD CONSTRAINT "_tours_v_rels_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table _tours_v_version_tags
-- ----------------------------
CREATE INDEX "_tours_v_version_tags_order_idx" ON "public"."_tours_v_version_tags" USING btree (
  "_order" "pg_catalog"."int4_ops" ASC NULLS LAST
);
CREATE INDEX "_tours_v_version_tags_parent_id_idx" ON "public"."_tours_v_version_tags" USING btree (
  "_parent_id" "pg_catalog"."int4_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table _tours_v_version_tags
-- ----------------------------
ALTER TABLE "public"."_tours_v_version_tags" ADD CONSTRAINT "_tours_v_version_tags_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table floors
-- ----------------------------
CREATE INDEX "floors_created_at_idx" ON "public"."floors" USING btree (
  "created_at" "pg_catalog"."timestamptz_ops" ASC NULLS LAST
);
CREATE INDEX "floors_floorplan_idx" ON "public"."floors" USING btree (
  "floorplan_id" "pg_catalog"."int4_ops" ASC NULLS LAST
);
CREATE INDEX "floors_initial_scene_idx" ON "public"."floors" USING btree (
  "initial_scene_id" "pg_catalog"."int4_ops" ASC NULLS LAST
);
CREATE UNIQUE INDEX "floors_slug_idx" ON "public"."floors" USING btree (
  "slug" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "floors_tour_idx" ON "public"."floors" USING btree (
  "tour_id" "pg_catalog"."int4_ops" ASC NULLS LAST
);
CREATE INDEX "floors_updated_at_idx" ON "public"."floors" USING btree (
  "updated_at" "pg_catalog"."timestamptz_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table floors
-- ----------------------------
ALTER TABLE "public"."floors" ADD CONSTRAINT "floors_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table floors_map_points
-- ----------------------------
CREATE INDEX "floors_map_points_order_idx" ON "public"."floors_map_points" USING btree (
  "_order" "pg_catalog"."int4_ops" ASC NULLS LAST
);
CREATE INDEX "floors_map_points_parent_id_idx" ON "public"."floors_map_points" USING btree (
  "_parent_id" "pg_catalog"."int4_ops" ASC NULLS LAST
);
CREATE INDEX "floors_map_points_scene_idx" ON "public"."floors_map_points" USING btree (
  "scene_id" "pg_catalog"."int4_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table floors_map_points
-- ----------------------------
ALTER TABLE "public"."floors_map_points" ADD CONSTRAINT "floors_map_points_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table media
-- ----------------------------
CREATE INDEX "media_created_at_idx" ON "public"."media" USING btree (
  "created_at" "pg_catalog"."timestamptz_ops" ASC NULLS LAST
);
CREATE UNIQUE INDEX "media_filename_idx" ON "public"."media" USING btree (
  "filename" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "media_sizes_preview_sizes_preview_filename_idx" ON "public"."media" USING btree (
  "sizes_preview_filename" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "public"."media" USING btree (
  "sizes_thumbnail_filename" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "media_updated_at_idx" ON "public"."media" USING btree (
  "updated_at" "pg_catalog"."timestamptz_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table media
-- ----------------------------
ALTER TABLE "public"."media" ADD CONSTRAINT "media_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table media_tags
-- ----------------------------
CREATE INDEX "media_tags_order_idx" ON "public"."media_tags" USING btree (
  "_order" "pg_catalog"."int4_ops" ASC NULLS LAST
);
CREATE INDEX "media_tags_parent_id_idx" ON "public"."media_tags" USING btree (
  "_parent_id" "pg_catalog"."int4_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table media_tags
-- ----------------------------
ALTER TABLE "public"."media_tags" ADD CONSTRAINT "media_tags_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table payload_kv
-- ----------------------------
CREATE UNIQUE INDEX "payload_kv_key_idx" ON "public"."payload_kv" USING btree (
  "key" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table payload_kv
-- ----------------------------
ALTER TABLE "public"."payload_kv" ADD CONSTRAINT "payload_kv_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table payload_locked_documents
-- ----------------------------
CREATE INDEX "payload_locked_documents_created_at_idx" ON "public"."payload_locked_documents" USING btree (
  "created_at" "pg_catalog"."timestamptz_ops" ASC NULLS LAST
);
CREATE INDEX "payload_locked_documents_global_slug_idx" ON "public"."payload_locked_documents" USING btree (
  "global_slug" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "payload_locked_documents_updated_at_idx" ON "public"."payload_locked_documents" USING btree (
  "updated_at" "pg_catalog"."timestamptz_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table payload_locked_documents
-- ----------------------------
ALTER TABLE "public"."payload_locked_documents" ADD CONSTRAINT "payload_locked_documents_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table payload_locked_documents_rels
-- ----------------------------
CREATE INDEX "payload_locked_documents_rels_floors_id_idx" ON "public"."payload_locked_documents_rels" USING btree (
  "floors_id" "pg_catalog"."int4_ops" ASC NULLS LAST
);
CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "public"."payload_locked_documents_rels" USING btree (
  "media_id" "pg_catalog"."int4_ops" ASC NULLS LAST
);
CREATE INDEX "payload_locked_documents_rels_order_idx" ON "public"."payload_locked_documents_rels" USING btree (
  "order" "pg_catalog"."int4_ops" ASC NULLS LAST
);
CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "public"."payload_locked_documents_rels" USING btree (
  "parent_id" "pg_catalog"."int4_ops" ASC NULLS LAST
);
CREATE INDEX "payload_locked_documents_rels_path_idx" ON "public"."payload_locked_documents_rels" USING btree (
  "path" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "payload_locked_documents_rels_scenes_id_idx" ON "public"."payload_locked_documents_rels" USING btree (
  "scenes_id" "pg_catalog"."int4_ops" ASC NULLS LAST
);
CREATE INDEX "payload_locked_documents_rels_tours_id_idx" ON "public"."payload_locked_documents_rels" USING btree (
  "tours_id" "pg_catalog"."int4_ops" ASC NULLS LAST
);
CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "public"."payload_locked_documents_rels" USING btree (
  "users_id" "pg_catalog"."int4_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table payload_locked_documents_rels
-- ----------------------------
ALTER TABLE "public"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table payload_migrations
-- ----------------------------
CREATE INDEX "payload_migrations_created_at_idx" ON "public"."payload_migrations" USING btree (
  "created_at" "pg_catalog"."timestamptz_ops" ASC NULLS LAST
);
CREATE INDEX "payload_migrations_updated_at_idx" ON "public"."payload_migrations" USING btree (
  "updated_at" "pg_catalog"."timestamptz_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table payload_migrations
-- ----------------------------
ALTER TABLE "public"."payload_migrations" ADD CONSTRAINT "payload_migrations_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table payload_preferences
-- ----------------------------
CREATE INDEX "payload_preferences_created_at_idx" ON "public"."payload_preferences" USING btree (
  "created_at" "pg_catalog"."timestamptz_ops" ASC NULLS LAST
);
CREATE INDEX "payload_preferences_key_idx" ON "public"."payload_preferences" USING btree (
  "key" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "payload_preferences_updated_at_idx" ON "public"."payload_preferences" USING btree (
  "updated_at" "pg_catalog"."timestamptz_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table payload_preferences
-- ----------------------------
ALTER TABLE "public"."payload_preferences" ADD CONSTRAINT "payload_preferences_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table payload_preferences_rels
-- ----------------------------
CREATE INDEX "payload_preferences_rels_order_idx" ON "public"."payload_preferences_rels" USING btree (
  "order" "pg_catalog"."int4_ops" ASC NULLS LAST
);
CREATE INDEX "payload_preferences_rels_parent_idx" ON "public"."payload_preferences_rels" USING btree (
  "parent_id" "pg_catalog"."int4_ops" ASC NULLS LAST
);
CREATE INDEX "payload_preferences_rels_path_idx" ON "public"."payload_preferences_rels" USING btree (
  "path" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "payload_preferences_rels_users_id_idx" ON "public"."payload_preferences_rels" USING btree (
  "users_id" "pg_catalog"."int4_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table payload_preferences_rels
-- ----------------------------
ALTER TABLE "public"."payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table scenes
-- ----------------------------
CREATE INDEX "scenes__status_idx" ON "public"."scenes" USING btree (
  "_status" "pg_catalog"."enum_ops" ASC NULLS LAST
);
CREATE INDEX "scenes_created_at_idx" ON "public"."scenes" USING btree (
  "created_at" "pg_catalog"."timestamptz_ops" ASC NULLS LAST
);
CREATE INDEX "scenes_floor_idx" ON "public"."scenes" USING btree (
  "floor_id" "pg_catalog"."int4_ops" ASC NULLS LAST
);
CREATE INDEX "scenes_panorama_idx" ON "public"."scenes" USING btree (
  "panorama_id" "pg_catalog"."int4_ops" ASC NULLS LAST
);
CREATE UNIQUE INDEX "scenes_slug_idx" ON "public"."scenes" USING btree (
  "slug" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "scenes_updated_at_idx" ON "public"."scenes" USING btree (
  "updated_at" "pg_catalog"."timestamptz_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table scenes
-- ----------------------------
ALTER TABLE "public"."scenes" ADD CONSTRAINT "scenes_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table scenes_hotspots
-- ----------------------------
CREATE INDEX "scenes_hotspots_order_idx" ON "public"."scenes_hotspots" USING btree (
  "_order" "pg_catalog"."int4_ops" ASC NULLS LAST
);
CREATE INDEX "scenes_hotspots_parent_id_idx" ON "public"."scenes_hotspots" USING btree (
  "_parent_id" "pg_catalog"."int4_ops" ASC NULLS LAST
);
CREATE INDEX "scenes_hotspots_target_floor_idx" ON "public"."scenes_hotspots" USING btree (
  "target_floor_id" "pg_catalog"."int4_ops" ASC NULLS LAST
);
CREATE INDEX "scenes_hotspots_target_scene_idx" ON "public"."scenes_hotspots" USING btree (
  "target_scene_id" "pg_catalog"."int4_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table scenes_hotspots
-- ----------------------------
ALTER TABLE "public"."scenes_hotspots" ADD CONSTRAINT "scenes_hotspots_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table scenes_tags
-- ----------------------------
CREATE INDEX "scenes_tags_order_idx" ON "public"."scenes_tags" USING btree (
  "_order" "pg_catalog"."int4_ops" ASC NULLS LAST
);
CREATE INDEX "scenes_tags_parent_id_idx" ON "public"."scenes_tags" USING btree (
  "_parent_id" "pg_catalog"."int4_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table scenes_tags
-- ----------------------------
ALTER TABLE "public"."scenes_tags" ADD CONSTRAINT "scenes_tags_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table tours
-- ----------------------------
CREATE INDEX "tours__status_idx" ON "public"."tours" USING btree (
  "_status" "pg_catalog"."enum_ops" ASC NULLS LAST
);
CREATE INDEX "tours_cover_image_idx" ON "public"."tours" USING btree (
  "cover_image_id" "pg_catalog"."int4_ops" ASC NULLS LAST
);
CREATE INDEX "tours_created_at_idx" ON "public"."tours" USING btree (
  "created_at" "pg_catalog"."timestamptz_ops" ASC NULLS LAST
);
CREATE INDEX "tours_default_floor_idx" ON "public"."tours" USING btree (
  "default_floor_id" "pg_catalog"."int4_ops" ASC NULLS LAST
);
CREATE UNIQUE INDEX "tours_slug_idx" ON "public"."tours" USING btree (
  "slug" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "tours_updated_at_idx" ON "public"."tours" USING btree (
  "updated_at" "pg_catalog"."timestamptz_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table tours
-- ----------------------------
ALTER TABLE "public"."tours" ADD CONSTRAINT "tours_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table tours_rels
-- ----------------------------
CREATE INDEX "tours_rels_floors_id_idx" ON "public"."tours_rels" USING btree (
  "floors_id" "pg_catalog"."int4_ops" ASC NULLS LAST
);
CREATE INDEX "tours_rels_order_idx" ON "public"."tours_rels" USING btree (
  "order" "pg_catalog"."int4_ops" ASC NULLS LAST
);
CREATE INDEX "tours_rels_parent_idx" ON "public"."tours_rels" USING btree (
  "parent_id" "pg_catalog"."int4_ops" ASC NULLS LAST
);
CREATE INDEX "tours_rels_path_idx" ON "public"."tours_rels" USING btree (
  "path" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table tours_rels
-- ----------------------------
ALTER TABLE "public"."tours_rels" ADD CONSTRAINT "tours_rels_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table tours_tags
-- ----------------------------
CREATE INDEX "tours_tags_order_idx" ON "public"."tours_tags" USING btree (
  "_order" "pg_catalog"."int4_ops" ASC NULLS LAST
);
CREATE INDEX "tours_tags_parent_id_idx" ON "public"."tours_tags" USING btree (
  "_parent_id" "pg_catalog"."int4_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table tours_tags
-- ----------------------------
ALTER TABLE "public"."tours_tags" ADD CONSTRAINT "tours_tags_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table users
-- ----------------------------
CREATE INDEX "users_created_at_idx" ON "public"."users" USING btree (
  "created_at" "pg_catalog"."timestamptz_ops" ASC NULLS LAST
);
CREATE UNIQUE INDEX "users_email_idx" ON "public"."users" USING btree (
  "email" COLLATE "pg_catalog"."default" "pg_catalog"."text_ops" ASC NULLS LAST
);
CREATE INDEX "users_updated_at_idx" ON "public"."users" USING btree (
  "updated_at" "pg_catalog"."timestamptz_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table users
-- ----------------------------
ALTER TABLE "public"."users" ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Indexes structure for table users_sessions
-- ----------------------------
CREATE INDEX "users_sessions_order_idx" ON "public"."users_sessions" USING btree (
  "_order" "pg_catalog"."int4_ops" ASC NULLS LAST
);
CREATE INDEX "users_sessions_parent_id_idx" ON "public"."users_sessions" USING btree (
  "_parent_id" "pg_catalog"."int4_ops" ASC NULLS LAST
);

-- ----------------------------
-- Primary Key structure for table users_sessions
-- ----------------------------
ALTER TABLE "public"."users_sessions" ADD CONSTRAINT "users_sessions_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Foreign Keys structure for table _scenes_v
-- ----------------------------
ALTER TABLE "public"."_scenes_v" ADD CONSTRAINT "_scenes_v_parent_id_scenes_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."scenes" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."_scenes_v" ADD CONSTRAINT "_scenes_v_version_floor_id_floors_id_fk" FOREIGN KEY ("version_floor_id") REFERENCES "public"."floors" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."_scenes_v" ADD CONSTRAINT "_scenes_v_version_panorama_id_media_id_fk" FOREIGN KEY ("version_panorama_id") REFERENCES "public"."media" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table _scenes_v_version_hotspots
-- ----------------------------
ALTER TABLE "public"."_scenes_v_version_hotspots" ADD CONSTRAINT "_scenes_v_version_hotspots_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_scenes_v" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "public"."_scenes_v_version_hotspots" ADD CONSTRAINT "_scenes_v_version_hotspots_target_floor_id_floors_id_fk" FOREIGN KEY ("target_floor_id") REFERENCES "public"."floors" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."_scenes_v_version_hotspots" ADD CONSTRAINT "_scenes_v_version_hotspots_target_scene_id_scenes_id_fk" FOREIGN KEY ("target_scene_id") REFERENCES "public"."scenes" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table _scenes_v_version_tags
-- ----------------------------
ALTER TABLE "public"."_scenes_v_version_tags" ADD CONSTRAINT "_scenes_v_version_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_scenes_v" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table _tours_v
-- ----------------------------
ALTER TABLE "public"."_tours_v" ADD CONSTRAINT "_tours_v_parent_id_tours_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."tours" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."_tours_v" ADD CONSTRAINT "_tours_v_version_cover_image_id_media_id_fk" FOREIGN KEY ("version_cover_image_id") REFERENCES "public"."media" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."_tours_v" ADD CONSTRAINT "_tours_v_version_default_floor_id_floors_id_fk" FOREIGN KEY ("version_default_floor_id") REFERENCES "public"."floors" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table _tours_v_rels
-- ----------------------------
ALTER TABLE "public"."_tours_v_rels" ADD CONSTRAINT "_tours_v_rels_floors_fk" FOREIGN KEY ("floors_id") REFERENCES "public"."floors" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "public"."_tours_v_rels" ADD CONSTRAINT "_tours_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_tours_v" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table _tours_v_version_tags
-- ----------------------------
ALTER TABLE "public"."_tours_v_version_tags" ADD CONSTRAINT "_tours_v_version_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tours_v" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table floors
-- ----------------------------
ALTER TABLE "public"."floors" ADD CONSTRAINT "floors_floorplan_id_media_id_fk" FOREIGN KEY ("floorplan_id") REFERENCES "public"."media" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."floors" ADD CONSTRAINT "floors_initial_scene_id_scenes_id_fk" FOREIGN KEY ("initial_scene_id") REFERENCES "public"."scenes" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."floors" ADD CONSTRAINT "floors_tour_id_tours_id_fk" FOREIGN KEY ("tour_id") REFERENCES "public"."tours" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table floors_map_points
-- ----------------------------
ALTER TABLE "public"."floors_map_points" ADD CONSTRAINT "floors_map_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."floors" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "public"."floors_map_points" ADD CONSTRAINT "floors_map_points_scene_id_scenes_id_fk" FOREIGN KEY ("scene_id") REFERENCES "public"."scenes" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table media_tags
-- ----------------------------
ALTER TABLE "public"."media_tags" ADD CONSTRAINT "media_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table payload_locked_documents_rels
-- ----------------------------
ALTER TABLE "public"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_floors_fk" FOREIGN KEY ("floors_id") REFERENCES "public"."floors" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "public"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "public"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "public"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_scenes_fk" FOREIGN KEY ("scenes_id") REFERENCES "public"."scenes" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "public"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tours_fk" FOREIGN KEY ("tours_id") REFERENCES "public"."tours" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "public"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table payload_preferences_rels
-- ----------------------------
ALTER TABLE "public"."payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "public"."payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table scenes
-- ----------------------------
ALTER TABLE "public"."scenes" ADD CONSTRAINT "scenes_floor_id_floors_id_fk" FOREIGN KEY ("floor_id") REFERENCES "public"."floors" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."scenes" ADD CONSTRAINT "scenes_panorama_id_media_id_fk" FOREIGN KEY ("panorama_id") REFERENCES "public"."media" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table scenes_hotspots
-- ----------------------------
ALTER TABLE "public"."scenes_hotspots" ADD CONSTRAINT "scenes_hotspots_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."scenes" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "public"."scenes_hotspots" ADD CONSTRAINT "scenes_hotspots_target_floor_id_floors_id_fk" FOREIGN KEY ("target_floor_id") REFERENCES "public"."floors" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."scenes_hotspots" ADD CONSTRAINT "scenes_hotspots_target_scene_id_scenes_id_fk" FOREIGN KEY ("target_scene_id") REFERENCES "public"."scenes" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table scenes_tags
-- ----------------------------
ALTER TABLE "public"."scenes_tags" ADD CONSTRAINT "scenes_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."scenes" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table tours
-- ----------------------------
ALTER TABLE "public"."tours" ADD CONSTRAINT "tours_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;
ALTER TABLE "public"."tours" ADD CONSTRAINT "tours_default_floor_id_floors_id_fk" FOREIGN KEY ("default_floor_id") REFERENCES "public"."floors" ("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table tours_rels
-- ----------------------------
ALTER TABLE "public"."tours_rels" ADD CONSTRAINT "tours_rels_floors_fk" FOREIGN KEY ("floors_id") REFERENCES "public"."floors" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "public"."tours_rels" ADD CONSTRAINT "tours_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."tours" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table tours_tags
-- ----------------------------
ALTER TABLE "public"."tours_tags" ADD CONSTRAINT "tours_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tours" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table users_sessions
-- ----------------------------
ALTER TABLE "public"."users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

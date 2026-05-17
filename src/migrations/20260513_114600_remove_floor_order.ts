import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "floors" DROP COLUMN IF EXISTS "order";
    ALTER TABLE "_floors_v" DROP COLUMN IF EXISTS "version_order";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "floors" ADD COLUMN IF NOT EXISTS "order" numeric DEFAULT 0;
    ALTER TABLE "_floors_v" ADD COLUMN IF NOT EXISTS "version_order" numeric DEFAULT 0;
  `)
}

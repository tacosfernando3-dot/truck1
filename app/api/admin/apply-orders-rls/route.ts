import { readFileSync } from "fs";
import { join } from "path";
import { NextResponse } from "next/server";
import postgres from "postgres";
import { createAdminSessionToken } from "@/lib/cms/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * One-shot: apply orders RLS deny policies using POSTGRES_URL from
 * the Supabase↔Vercel integration. Remove after use.
 */
export async function POST(request: Request) {
  const secret = request.headers.get("x-admin-secret")?.trim() || "";
  const expected = createAdminSessionToken();
  // Accept either the session HMAC or raw ADMIN_SECRET for scripting.
  const raw =
    process.env.ADMIN_SECRET?.trim() || "los-compadres-admin-secret";
  if (secret !== expected && secret !== raw) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUrl =
    process.env.POSTGRES_URL?.trim() ||
    process.env.POSTGRES_PRISMA_URL?.trim() ||
    process.env.DATABASE_URL?.trim() ||
    "";
  if (!dbUrl) {
    return NextResponse.json(
      { error: "POSTGRES_URL not configured on this deployment" },
      { status: 503 },
    );
  }

  const sqlPath = join(
    process.cwd(),
    "supabase/migrations/20260826120000_orders_rls_policies.sql",
  );
  const migration = readFileSync(sqlPath, "utf8");

  const sql = postgres(dbUrl, { ssl: "require", max: 1 });
  try {
    await sql.unsafe(migration);
    const policies = await sql`
      select tablename, policyname, roles::text as roles, cmd
      from pg_policies
      where tablename in ('orders', 'order_items')
      order by tablename, policyname
    `;
    return NextResponse.json({ ok: true, policies });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Migration failed";
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await sql.end({ timeout: 5 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "../../lib/db";

export const runtime = "nodejs";

export async function GET() {
  const cohorts = await prisma.cohort.findMany({ orderBy: { position: "asc" } });
  return NextResponse.json({ cohorts });
}

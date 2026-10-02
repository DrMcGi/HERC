import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../lib/auth";
import { prisma } from "../../../lib/db";

export const runtime = "nodejs";

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return NextResponse.json({ error: "Admins only." }, { status: 403 });

  const body = await request.json().catch(() => null);
  const cohorts: { label: string; training: string; assessment: string }[] = body?.cohorts;
  if (!Array.isArray(cohorts)) return NextResponse.json({ error: "Invalid cohorts payload." }, { status: 400 });

  await prisma.$transaction([
    prisma.cohort.deleteMany({}),
    prisma.cohort.createMany({ data: cohorts.map((cohort, index) => ({ ...cohort, position: index })) }),
  ]);
  return NextResponse.json({ ok: true });
}

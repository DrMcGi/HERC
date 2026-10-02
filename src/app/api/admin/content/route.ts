import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../lib/auth";
import { prisma } from "../../../lib/db";

export const runtime = "nodejs";

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return NextResponse.json({ error: "Admins only." }, { status: 403 });

  const body = await request.json().catch(() => null);
  const { programmeTitle, programmeDescription, welcomeMessage } = body ?? {};
  if (!programmeTitle || !programmeDescription || !welcomeMessage) {
    return NextResponse.json({ error: "All content fields are required." }, { status: 400 });
  }

  await prisma.portalContent.upsert({
    where: { id: "singleton" },
    update: { programmeTitle, programmeDescription, welcomeMessage },
    create: { id: "singleton", programmeTitle, programmeDescription, welcomeMessage },
  });
  return NextResponse.json({ ok: true });
}

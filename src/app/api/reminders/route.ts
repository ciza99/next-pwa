import { db } from "@/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const GET = async () => {
  const items = await db.getAll();

  return NextResponse.json({
    items,
  });
};

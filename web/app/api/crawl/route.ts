import { NextRequest, NextResponse } from "next/server";
import { crawlTrendSector } from "@/services/crawler-trend";
import { crawlResearchSector } from "@/services/crawler-research";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { Sector } from "@/lib/types";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { sector?: Sector; userId?: string };
  const sector = body.sector;

  if (!body.userId) {
    return NextResponse.json({ success: false, message: "로그인이 필요해요" }, { status: 401 });
  }

  let result = { newCount: 0 };
  if (sector === "research") {
    result = await crawlResearchSector();
  } else {
    result = await crawlTrendSector();
  }

  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const supabaseAdmin = getSupabaseAdmin();
  const { count } = supabaseAdmin
    ? await supabaseAdmin
    .from("articles")
    .select("id", { count: "exact", head: true })
    .eq("sector", sector ?? "trend")
    .gte("fetched_at", start.toISOString())
    : { count: 0 };

  return NextResponse.json({
    success: true,
    newCount: result.newCount,
    totalToday: count ?? 0,
    crawledAt: new Date().toISOString()
  });
}

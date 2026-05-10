import { NextRequest, NextResponse } from "next/server";
import { crawlTrendSector } from "@/services/crawler-trend";
import { crawlResearchSector } from "@/services/crawler-research";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { Sector } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { sector?: Sector; userId?: string };
  const sector = body.sector ?? "trend";

  if (!body.userId) {
    return NextResponse.json({ success: false, message: "로그인이 필요해요" }, { status: 401 });
  }

  try {
    const result = sector === "research" ? await crawlResearchSector() : await crawlTrendSector();

    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const supabaseAdmin = getSupabaseAdmin();
    const { count } = supabaseAdmin
      ? await supabaseAdmin
          .from("articles")
          .select("id", { count: "exact", head: true })
          .eq("sector", sector)
          .gte("fetched_at", start.toISOString())
      : { count: 0 };

    return NextResponse.json({
      success: true,
      newCount: result.newCount,
      failedFeeds: result.failedFeeds ?? [],
      totalToday: count ?? 0,
      crawledAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("[api/crawl] failed", error);
    return NextResponse.json(
      { success: false, message: "수집 도중 오류가 발생했어요. 잠시 후 다시 시도해 주세요." },
      { status: 500 }
    );
  }
}

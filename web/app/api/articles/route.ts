import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { Sector } from "@/lib/types";
import { crawlResearchSector } from "@/services/crawler-research";
import { crawlTrendSector } from "@/services/crawler-trend";

export async function GET(req: NextRequest) {
  const sector = (req.nextUrl.searchParams.get("sector") as Sector | null) ?? "trend";
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json({ articles: [] });
  }
  const { data, error } = await supabaseAdmin
    .from("articles")
    .select("id,title,url,source,thumbnail,published_at,sector,category,summary")
    .eq("sector", sector)
    .order("published_at", { ascending: false })
    .limit(40);

  if (error) {
    console.error("[articles] select error", error);
    return NextResponse.json({ articles: [] }, { status: 200 });
  }

  // 첫 실행 시 DB가 비어있다면 해당 섹터를 한 번 자동 수집한다.
  if ((data ?? []).length === 0) {
    try {
      if (sector === "research") {
        await crawlResearchSector();
      } else {
        await crawlTrendSector();
      }
      const { data: recrawled } = await supabaseAdmin
        .from("articles")
        .select("id,title,url,source,thumbnail,published_at,sector,category,summary")
        .eq("sector", sector)
        .order("published_at", { ascending: false })
        .limit(40);
      return NextResponse.json({ articles: recrawled ?? [] });
    } catch (crawlError) {
      console.error("[articles] auto-crawl failed", crawlError);
    }
  }

  return NextResponse.json({ articles: data ?? [] });
}

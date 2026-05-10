import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type { ConceptCardItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    card?: ConceptCardItem;
    sourceType?: "article" | "newsletter";
    sourceId?: number;
  };

  if (!body.card?.concept_name) {
    return NextResponse.json({ message: "잘못된 카드 정보" }, { status: 400 });
  }

  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json({ message: "Supabase not configured" }, { status: 500 });
  }

  const { error } = await supabaseAdmin.from("concept_cards").insert({
    concept_name: body.card.concept_name,
    concept_en: body.card.concept_en ?? null,
    definition: body.card.definition ?? null,
    explanation: body.card.explanation ?? null,
    example: body.card.example ?? null,
    tags: body.card.tags ?? [],
    source_type: body.sourceType ?? null,
    source_id: body.sourceId ?? null
  });

  if (error) {
    console.error("[concepts/save] insert failed", error);
    return NextResponse.json({ message: "저장 실패" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

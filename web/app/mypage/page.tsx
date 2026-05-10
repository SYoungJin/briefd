import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { MyPageClient, NewsletterRow, ConceptRow } from "./MyPageClient";

export const dynamic = "force-dynamic";

export default async function MyPage() {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return (
      <main className="docPage">
        <h1>My page</h1>
        <p className="muted">Supabase 연결이 필요합니다.</p>
      </main>
    );
  }

  const [newslettersRes, cardsRes] = await Promise.all([
    supabaseAdmin
      .from("newsletters")
      .select("id,sector,content,created_at")
      .order("created_at", { ascending: false })
      .limit(30),
    supabaseAdmin
      .from("concept_cards")
      .select("id,concept_name,concept_en,definition,explanation,example,tags")
      .order("created_at", { ascending: false })
      .limit(60)
  ]);

  const newsletters = (newslettersRes.data ?? []) as NewsletterRow[];
  const cards = (cardsRes.data ?? []) as ConceptRow[];

  return <MyPageClient newsletters={newsletters} cards={cards} />;
}

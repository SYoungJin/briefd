import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { ConceptCard } from "@/components/ConceptCard";

export default async function MyCardsPage() {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return <main className="docPage">Supabase 연결이 필요합니다.</main>;
  }
  const { data } = await supabaseAdmin
    .from("concept_cards")
    .select("id,concept_name,concept_en,definition,explanation,example,tags")
    .order("created_at", { ascending: false })
    .limit(60);

  return (
    <main className="docPage">
      <h1>내 개념 카드</h1>
      <div className="myCardsGrid">
        {(data ?? []).map((card) => (
          <ConceptCard
            key={card.id}
            item={{
              concept_name: card.concept_name,
              concept_en: card.concept_en ?? "",
              definition: card.definition ?? "",
              explanation: card.explanation ?? "",
              example: card.example ?? "",
              tags: card.tags ?? []
            }}
          />
        ))}
      </div>
    </main>
  );
}

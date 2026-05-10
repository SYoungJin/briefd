"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/constants";
import { Article, ConceptCardItem } from "@/lib/types";
import { useSectorStore } from "@/store/sectorStore";
import { Header } from "@/components/Header";
import { ArticleCard } from "./components/ArticleCard";
import { ConceptCard } from "@/components/ConceptCard";

export default function Page() {
  const router = useRouter();
  const { sector } = useSectorStore();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>("all");
  const [loadingById, setLoadingById] = useState<Record<number, boolean>>({});
  const [summaryVisibleById, setSummaryVisibleById] = useState<Record<number, boolean>>({});
  const [concepts, setConcepts] = useState<ConceptCardItem[]>([]);
  const [conceptIndex, setConceptIndex] = useState(0);
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterError, setNewsletterError] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      articles.filter(
        (a) => a.sector === sector && (category === "all" || a.category === category)
      ),
    [articles, sector, category]
  );

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/articles?sector=${sector}`);
        if (!res.ok) return;
        const data = (await res.json()) as { articles: Article[] };
        if (!cancelled) setArticles(data.articles);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [sector]);

  async function handleSummarize(id: number) {
    setLoadingById((prev) => ({ ...prev, [id]: true }));
    const res = await fetch(`/api/articles/${id}/summarize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: "00000000-0000-0000-0000-000000000000" })
    });
    if (res.ok) {
      const data = (await res.json()) as { id: number; summary: string };
      setArticles((prev) => prev.map((a) => (a.id === data.id ? { ...a, summary: data.summary } : a)));
      setSummaryVisibleById((prev) => ({ ...prev, [id]: true }));
    }
    setLoadingById((prev) => ({ ...prev, [id]: false }));
  }

  async function handleGenerateNewsletter() {
    if (newsletterLoading) return;
    setNewsletterError(null);
    setNewsletterLoading(true);
    try {
      const res = await fetch("/api/newsletter/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sector, userId: "00000000-0000-0000-0000-000000000000" })
      });
      const data = (await res.json().catch(() => ({}))) as { id?: number; message?: string };
      if (!res.ok || !data.id) {
        setNewsletterError(data.message ?? "뉴스레터 생성에 실패했어요. 잠시 후 다시 시도해 주세요.");
        return;
      }
      router.push(`/newsletter/${data.id}`);
    } catch (error) {
      console.error(error);
      setNewsletterError("네트워크 오류로 뉴스레터를 만들 수 없어요.");
    } finally {
      setNewsletterLoading(false);
    }
  }

  async function handleExtractConcept(sourceText: string) {
    const res = await fetch("/api/concepts/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceText, sourceType: "article", userId: "00000000-0000-0000-0000-000000000000" })
    });
    if (!res.ok) return;
    const data = (await res.json()) as { concepts: ConceptCardItem[] };
    setConcepts(data.concepts ?? []);
    setConceptIndex(0);
  }

  const hero = filtered[0];
  const list = filtered.slice(1);

  return (
    <main className="briefdRoot">
      <Header onGenerateNewsletter={handleGenerateNewsletter} newsletterLoading={newsletterLoading} />

      <div className="layout">
        <aside className="sidebar">
          <h4>카테고리</h4>
          <button className={category === "all" ? "chip active" : "chip"} onClick={() => setCategory("all")}>
            전체
          </button>
          {CATEGORIES[sector].map((c) => (
            <button key={c} className={category === c ? "chip active" : "chip"} onClick={() => setCategory(c)}>
              {c}
            </button>
          ))}
          <div className="savedCount">오늘 저장 카드: {concepts.length}</div>
        </aside>

        <section className="feedArea">
          {loading && articles.length === 0 ? (
            <div className="emptyState">
              <p className="muted">콘텐츠를 불러오는 중이에요...</p>
            </div>
          ) : !hero ? (
            <div className="emptyState">
              <p>이 섹터에 표시할 기사가 없어요.</p>
              <p className="muted">우측 상단의 새로고침 버튼으로 최신 기사를 가져오세요.</p>
            </div>
          ) : (
            <>
              <article className="heroCard" onClick={() => window.open(hero.url, "_blank", "noopener,noreferrer")}>
                <div className="heroCardInner">
                  <span className="heroEyebrow">오늘의 헤드라인</span>
                  <span className="badge">{hero.category}</span>
                  <h2>{hero.title}</h2>
                  <p>{hero.source}</p>
                </div>
              </article>

              <div className="feedGrid">
                {list.map((item) => (
                  <ArticleCard
                    key={item.id}
                    article={item}
                    isLoading={Boolean(loadingById[item.id])}
                    summaryVisible={Boolean(summaryVisibleById[item.id])}
                    onToggleSummary={() =>
                      setSummaryVisibleById((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                    }
                    onSummarize={() => handleSummarize(item.id)}
                    onExtractConcept={() =>
                      handleExtractConcept(item.title + "\n" + (item.summary ?? ""))
                    }
                  />
                ))}
              </div>
            </>
          )}
        </section>
      </div>

      {newsletterLoading && (
        <div className="conceptModal">
          <div className="loadingCard">
            <h3>뉴스레터를 작성하고 있어요...</h3>
            <p>최신 기사 10건을 분석해 약 20초 정도 걸려요.</p>
            <div className="progressBar"><div className="progressFill" /></div>
          </div>
        </div>
      )}

      {newsletterError && !newsletterLoading && (
        <div className="conceptModal" onClick={() => setNewsletterError(null)}>
          <div className="loadingCard">
            <h3>뉴스레터를 만들 수 없어요</h3>
            <p className="muted">{newsletterError}</p>
            <button className="generateBtn" onClick={() => setNewsletterError(null)}>닫기</button>
          </div>
        </div>
      )}

      {concepts.length > 0 && (
        <div className="conceptModal" onClick={() => setConcepts([])}>
          <div className="conceptModalInner" onClick={(e) => e.stopPropagation()}>
            <div className="conceptNav">
              <button
                className="iconBtn"
                onClick={() => setConceptIndex((i) => Math.max(0, i - 1))}
                disabled={conceptIndex === 0}
              >
                ←
              </button>
              <span className="muted">
                {conceptIndex + 1} / {concepts.length}
              </span>
              <button
                className="iconBtn"
                onClick={() => setConceptIndex((i) => Math.min(concepts.length - 1, i + 1))}
                disabled={conceptIndex === concepts.length - 1}
              >
                →
              </button>
            </div>
            <ConceptCard item={concepts[conceptIndex]} />
            <div className="conceptModalActions">
              <button
                className="generateBtn"
                onClick={async () => {
                  const card = concepts[conceptIndex];
                  await fetch("/api/concepts/save", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ card, sourceType: "article" })
                  });
                }}
              >
                My page 에 저장
              </button>
              <button className="foldBtn" onClick={() => setConcepts([])}>닫기</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

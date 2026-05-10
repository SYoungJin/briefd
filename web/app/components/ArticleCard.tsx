"use client";

import { Loader2, ExternalLink, Bookmark } from "lucide-react";
import { Article } from "@/lib/types";
import { timeAgo } from "@/lib/time";

interface ArticleCardProps {
  article: Article;
  isLoading: boolean;
  summaryVisible: boolean;
  onToggleSummary: () => void;
  onSummarize: () => void;
  onExtractConcept?: () => void;
}

function gradientFor(seed: string) {
  const palette = [
    ["#6366F1", "#8B5CF6"],
    ["#EC4899", "#F59E0B"],
    ["#10B981", "#3B82F6"],
    ["#F43F5E", "#8B5CF6"],
    ["#06B6D4", "#3B82F6"],
    ["#FACC15", "#F97316"]
  ];
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash << 5) - hash + seed.charCodeAt(i);
  const [a, b] = palette[Math.abs(hash) % palette.length];
  return `linear-gradient(135deg, ${a}, ${b})`;
}

export function ArticleCard({
  article,
  isLoading,
  summaryVisible,
  onToggleSummary,
  onSummarize,
  onExtractConcept
}: ArticleCardProps) {
  const hasThumb = Boolean(article.thumbnail);
  return (
    <article
      className="newsCard clickable"
      onClick={() => window.open(article.url, "_blank", "noopener,noreferrer")}
    >
      {hasThumb ? (
        <div className="thumb" style={{ backgroundImage: `url(${article.thumbnail})` }} />
      ) : (
        <div className="thumb thumbFallback" style={{ background: gradientFor(article.title) }}>
          <div className="thumbInitial">{(article.source ?? "U").slice(0, 1).toUpperCase()}</div>
        </div>
      )}

      <div className="newsBody">
        <div className="badgeRow">
          <span className="badge">{article.category}</span>
          <ExternalLink size={14} className="externalIcon" />
        </div>
        <h3>{article.title}</h3>

        {summaryVisible && article.summary && (
          <div className="summaryBox">
            {article.summary.split("\n").map((line, i) => (
              <p key={`${article.id}-${i}`}>{line}</p>
            ))}
          </div>
        )}

        <div className="metaRow">
          <small>
            {article.source ?? "Unknown"} · {timeAgo(article.published_at)}
          </small>
          <div className="metaActions">
            {!article.summary ? (
              <button
                className="summaryBtn"
                onClick={(e) => {
                  e.stopPropagation();
                  onSummarize();
                }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={14} className="spin" />
                    요약 중...
                  </>
                ) : (
                  "✦ AI 요약"
                )}
              </button>
            ) : (
              <button
                className="foldBtn"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSummary();
                }}
              >
                {summaryVisible ? "접기" : "요약 보기"}
              </button>
            )}
            {article.sector === "research" && onExtractConcept && (
              <button
                className="foldBtn"
                onClick={(e) => {
                  e.stopPropagation();
                  onExtractConcept();
                }}
              >
                개념 추출
              </button>
            )}
            <button
              className="iconBtnSmall"
              onClick={(e) => e.stopPropagation()}
              aria-label="bookmark"
            >
              <Bookmark size={14} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

"use client";

import { Loader2 } from "lucide-react";
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

export function ArticleCard({
  article,
  isLoading,
  summaryVisible,
  onToggleSummary,
  onSummarize,
  onExtractConcept
}: ArticleCardProps) {
  return (
    <article className="newsCard clickable" onClick={() => window.open(article.url, "_blank", "noopener,noreferrer")}>
      <div className="thumb" style={article.thumbnail ? { backgroundImage: `url(${article.thumbnail})` } : undefined} />
      <div className="newsBody">
        <span className="badge">{article.category}</span>
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
                  "✦ AI 요약 보기"
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
            <span className="externalIcon">↗</span>
          </div>
        </div>
      </div>
    </article>
  );
}

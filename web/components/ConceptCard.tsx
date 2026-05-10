"use client";

import { useState } from "react";
import { ConceptCardItem } from "@/lib/types";

interface Props {
  item: ConceptCardItem;
  onSave?: () => void;
  onClose?: () => void;
}

export function ConceptCard({ item, onSave, onClose }: Props) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="conceptWrap">
      <button className={`conceptCard ${flipped ? "flipped" : ""}`} onClick={() => setFlipped((v) => !v)}>
        <div className="conceptFace front">
          <h3>{item.concept_name}</h3>
          <p>{item.concept_en}</p>
          <small>{item.definition}</small>
        </div>
        <div className="conceptFace back">
          <p>{item.explanation}</p>
          <small>예시: {item.example}</small>
        </div>
      </button>
      <div className="conceptActions">
        <button className="summaryBtn" onClick={onSave}>저장</button>
        <button className="foldBtn" onClick={onClose}>닫기</button>
      </div>
    </div>
  );
}

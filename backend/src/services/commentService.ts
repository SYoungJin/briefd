export async function getCommentsByTarget(targetType: "news" | "report", targetId: string) {
  // TODO: DB 조회로 교체
  return [
    {
      id: "c1",
      targetType,
      targetId,
      authorName: "Jin",
      authorIcon: "👤",
      content: "좋은 인사이트 감사합니다.",
      likes: 5,
      createdAt: new Date().toISOString(),
      replies: [
        {
          id: "c1-r1",
          authorName: "Mina",
          authorIcon: "🧠",
          content: "다음 주도 기대돼요.",
          likes: 1,
          createdAt: new Date().toISOString()
        }
      ]
    }
  ];
}

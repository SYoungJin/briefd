interface ReportSourceRow {
  id: number;
  title: string;
  summary: string;
}

export async function getWeeklyReports() {
  return [];
}

export async function generateWeeklyReport() {
  // 지난 7일 기사 중 summary가 있는 기사만 대상
  // 실제 저장은 추후 reports 테이블 확장 시 연결
  const { db } = await import("../config/db");
  const rows = await db.query<ReportSourceRow>(
    `SELECT id, title, summary
     FROM articles
     WHERE published_at >= NOW() - INTERVAL '7 days'
       AND summary IS NOT NULL
     ORDER BY published_at DESC`
  );

  const reportItems = rows.rows.map((row) => ({
    id: row.id,
    title: row.title,
    summary: row.summary
  }));

  return {
    success: true,
    generatedAt: new Date().toISOString(),
    articleCount: reportItems.length,
    items: reportItems
  };
}

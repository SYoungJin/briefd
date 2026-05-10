export function startWeeklyReportJob() {
  // 자동 생성 cron 비활성화: 레포트는 수동 트리거(/api/reports/generate)로만 생성
  console.log("[job] weekly report cron disabled (manual trigger only)");
}

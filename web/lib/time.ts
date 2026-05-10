export function timeAgo(iso: string | null): string {
  if (!iso) {
    return "방금 전";
  }
  const diff = Date.now() - new Date(iso).getTime();
  const hour = Math.floor(diff / (1000 * 60 * 60));
  if (hour < 1) {
    const minute = Math.max(1, Math.floor(diff / (1000 * 60)));
    return `${minute}분 전`;
  }
  if (hour < 24) {
    return `${hour}시간 전`;
  }
  const day = Math.floor(hour / 24);
  return `${day}일 전`;
}

export function todayLabel(): string {
  return new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short"
  });
}

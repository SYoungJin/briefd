# UXPulse

모빌리티/테크 UXUI 트렌드 학습 및 커뮤니티 소통 앱 MVP 프로젝트입니다.

## Tech Stack
- Frontend: Next.js (Web) + TypeScript
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL
- Auth: Firebase Auth (클라이언트 SDK, 서버 토큰 검증 확장 구조)
- News: RSS + NewsAPI 연동 구조
- AI Report: OpenAI API 연동 구조

## Monorepo Structure
```txt
UXPulse/
  web/
    app/
  backend/
    src/
      config/
      routes/
      services/
      jobs/
      types/
```

## MVP Scope (1단계)
1. 뉴스 피드
2. 트렌드 레포트
3. 댓글/토론

## Quick Start
### 1) Backend
```bash
cd backend
npm install
npm run dev
```

`tsx watch` 이슈가 있으면 안전 실행:
```bash
npm run dev:safe
```

### 2) Web App (Next.js)
```bash
cd web
npm install
npm run dev
```

휴대폰에서 접속하려면 같은 Wi-Fi에서 아래 주소로 접속:
```txt
http://<내_컴퓨터_IP>:3000
```

IP 확인(macOS):
```bash
ipconfig getifaddr en0
```

## Local Links
- Backend Health: http://localhost:4000/health
- Backend News API: http://localhost:4000/api/news
- Backend Reports API: http://localhost:4000/api/reports
- Web App(실행 후): http://localhost:3000

## Next Steps
- PostgreSQL 스키마(Prisma or Knex) 연결
- Firebase Auth 토큰 검증 미들웨어 연결
- RSS/NewsAPI 실제 수집 파이프라인 구현
- OpenAI 기반 주간 레포트 생성 크론 활성화

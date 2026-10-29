# 사실 중심 리포트 전송 — P0 프로토타입

스펙: [`docs/specs/이승재-fact-report.md`](../../docs/specs/이승재-fact-report.md)

임차인이 고장·하자 상황을 자유롭게 쓰고 사진을 첨부하면, AI(Claude Haiku 5.5)가 사실만 다섯 항목으로 정리한다. 임차인이 확인·수정한 뒤 보내면 공유 링크가 생기고, 임대인은 로그인 없이 링크로 리포트를 본다.

## 실행

Node 18 이상이 필요하다. 추가로 설치할 패키지는 없다.

```bash
cd prototypes/이승재
cp .env.example .env      # .env를 열어 ANTHROPIC_API_KEY에 본인 키를 넣는다
node server.js            # http://localhost:3000
```

- `.env`, `data/`(리포트 JSON), `uploads/`(사진)는 저장소에 올라가지 않는다.
- 저장소가 로컬이라서 공유 링크는 서버를 실행한 컴퓨터에서만 열린다.

## 파일

- `server.js`: 서버. AI 정리(`/api/organize`), 리포트 저장(`/api/reports`), 공유 페이지(`/r/:id`)
- `public/`: 작성 → 확인 → 링크 화면

## 확인 항목

스펙의 "직접 해볼 확인 항목" 1~3을 따른다.

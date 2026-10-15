# QUESTIONS.md

Team: [team 1, 조지이김]
Last updated: [2026-10-06]

Your biggest open questions about this project.
Write this together, after the premortem merge.

At most five, most important first.
The consultation opens with question 1, so put the one you are least sure about there, not the one that is easiest to ask.

Write in Korean or English.
Keep the headings exactly as they are.

---

## What counts as an open question

- **The answer would change what you do next.** If every possible answer leaves your next two weeks the same, it is curiosity, not an open question.
- **It is specific to this project.** "Is our idea good?" cannot be answered in 30 minutes. "We assume the person in `PROJECT.md` will enter data by hand every day, and none of us has asked one. How do we test that in a week?" can.
- **You have already tried something.** Say what you think the answer is today, even if it is a guess. A question with a guess attached gets a much better answer than a bare one.

Two good places to look for questions:

- `docs/PREMORTEM.md` — a cause of failure you could not find a countermeasure for is a question.
- `docs/PROJECT.md` — the section you argued about longest, or the one where you wrote "nobody yet".

## Our questions

### 1. 임대인은 왜 확인·서명해야 하며, 그렇게 만든 앱 기록은 분쟁 증거로 어디까지 쓸 수 있을까요?

- **Why it matters:** 양측 참여를 필수로 할지, 한쪽 기록부터 이용할 수 있게 할지 결정해야 한다. 또한 기록·서명·원본 보관 방식을 정하고, 사용자에게 약속할 수 있는 증거 활용 범위를 정해야 한다.
- **What we think today:** 프리모텀에서 임대인 참여 문제가 제기되었다. 요청 내용과 수리 이력 정리가 임대인의 편익이 될 것이라고 생각하지만 실제 참여는 검증하지 않았다. 미응답 기록의 실용적 가치도 확인해야 한다. 기능정의서에는 원본·서버 접수시각·파일 해시·변경 이력 보관을 넣었다. 기록이 도움이 될 것이라는 가설이지만, 증거 제출과 사실 입증의 차이, 추가 전자서명·공증의 필요성은 전문가에게 확인하지 못했다.
- **Who could answer it:** 개인 임대인, 입주·퇴거 경험이 있는 임차인, 임대차 분쟁·소송 변호사, 전자서명·전자문서 서비스 실무자.

### 2. 분쟁 빈도·금액과 낮은 사용 빈도를 고려하면, 누가 어떤 가치에 얼마를 지불할까요?

- **Why it matters:** 초기 유료 고객과 가격을 정하고, 분쟁 대비 서비스만으로 운영비를 감당할 수 있는지 판단해야 한다.
- **What we think today:** 프리모텀에서 낮은 사용 빈도와 지불 의사 부족이 함께 나왔다. 5천~1만 원 건당 과금을 가설로 두었지만 분쟁 빈도·금액과 실제 결제 근거는 없다. 분쟁 경험이 없는 사람도 지불하는지 확인하려 한다.
- **Who could answer it:** 분쟁 경험이 있는 사람과 없는 임대인·임차인, 주택임대차 분쟁조정 실무자. 지불 의사는 사용자에게, 분쟁 유형과 금액 자료는 실무자에게 확인한다.

### 3. 사용자가 직접 찍은 사진으로 입주·퇴실 상태를 얼마나 신뢰성 있게 비교할 수 있을까요?

- **Why it matters:** 자동 비교를 개발할지, 촬영 가이드와 사진 나란히 보기에 집중할지 결정해야 한다.
- **What we think today:** 기능정의서에서는 같은 공간·위치의 사진을 나란히 보여주고 자동 비교는 보조로 쓰려 했다. 각도·조명·가구 배치가 달라도 하자를 구분할 수 있는지는 시험하지 않았다. 실제 사진으로 작은 비교 실험부터 할 생각이다.
- **Who could answer it:** 컴퓨터비전 개발자, 주택 하자 점검 전문가, 실제 촬영 테스트 참가자.

### 4. 기존 서비스·카톡 대신 집사이를 선택할 이유는 무엇이며, 효과적인 초기 유통 채널은 무엇일까요?

- **Why it matters:** 차별화할 가치와 첫 고객 모집 방법을 정하고, 고객 확보 비용이 매출보다 커지는 것을 피해야 한다.
- **What we think today:** 핵심 사용자는 임대인·임차인이고, 중개사·임대관리업체는 가능한 유통 채널로만 검토한다. 유사 서비스의 이용 규모와 널리 쓰이지 않는 이유는 확인하지 않았다. 기록 보관·공동 확인·AI 전달문이 전환 이유인지 비교하려 한다. 수리업체는 향후 확장 단계에 둔다.
- **Who could answer it:** 유사 서비스 이용자·이탈자, 개인 임대인·임차인, 공인중개사, 임대관리업체 운영자.

### 5. 어떤 사용자 행동과 기준으로 구상의 유지·변경·중단을 결정해야 할까요?

- **Why it matters:** 인터뷰의 호의적인 반응만으로 개발을 계속하지 않도록 다음 검증의 판단 기준을 정해야 한다.
- **What we think today:** 참여·기록 완료·응답·지불을 관찰하려 한다. PROJECT의 '5쌍 중 3쌍이 거절하면 전환'은 가설적 기준이다. 모집할 사람과 검증 상황, 성공·중단 기준을 함께 설계해야 한다.
- **Who could answer it:** 사용자 조사·실험 설계 경험이 있는 제품기획자, 실제 파일럿 참가자.

## Where we disagree

양측 참여의 필수 여부, 과금 대상, 첫 버전 범위, AI의 역할에 대한 팀원별 입장은 아직 확인하지 않았다. 실제 이견이 있으면 양쪽 입장을 기록한다.

---

## After the consultation

Fill this in within a week of your slot.

| # | What we heard | What we will do about it | Owner | By when |
|---|---|---|---|---|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |
| 4 | | | | |
| 5 | | | | |

## Revision log

| Date | What changed and why |
|---|---|
| 2026-10-06 | Draft for consultation |

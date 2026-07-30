# 영근록 靈根錄

생년월일시의 사주팔자를 계산하고 오행 구조를 선협 소설식 영근 설정으로 번역하는 한국어 웹 애플리케이션입니다. 실제 점술이나 미래 예측이 아닌 창작·오락용 도구입니다.

## 실행

Node.js 20.9 이상이 필요합니다.

```bash
npm install
npm run dev
```

`http://localhost:3000`에서 확인할 수 있습니다.

```bash
npm test
npm run lint
npm run build
```

## 배포

`main` 브랜치에 푸시하면 GitHub Actions가 테스트와 정적 빌드를 실행한 뒤 GitHub Pages에 자동 배포합니다.

- 공개 사이트: <https://kz2g1ew-commits.github.io/yeonggeunrok/>
- 배포 방식: Next.js static export (`out/`)
- 민감한 입력값은 URL, GitHub 또는 호스팅 서버에 전송하지 않음

## 기술 구성

- Next.js 16.2.12, React 19, TypeScript, App Router
- Tailwind CSS 4
- `lunar-typescript` 1.8.6 (MIT): 양·음력/윤달, 절기표, 입춘·절입 기준 팔자
- Luxon 3.7.2 (MIT): IANA 시간대 정규화
- Vitest 4

계산은 클라이언트에서 실행됩니다. 생년월일시는 서버, 데이터베이스, 쿠키, `localStorage`에 저장하지 않으며 결과 URL에도 넣지 않습니다. 결과 페이지 새로고침 시 브라우저 메모리의 결과가 사라지는 것이 의도된 동작입니다.

## 계산 기준

### 사주 네 기둥

- 연주: 정확한 입춘 시각 기준
- 월주: 음력 월이 아닌 12절기의 절입 시각 기준
- 일주: `lunar-typescript`의 율리우스일 기반 60갑자 계산
- 시주: 현지 2시간 시진과 오서둔
- 야자시: 옵션을 켠 경우 보정된 현지 시각 23:00부터 일주를 다음 날로 계산

`lunar-typescript`의 절기 시각은 중국 표준시로 표현됩니다. 입력한 현지 시각을 Luxon으로 UTC 순간에 고정한 후 `Asia/Shanghai`의 같은 순간으로 바꾸어 Exact 연주·월주 경계를 계산합니다. 일주와 시주는 선택한 출생지의 현지 벽시계를 사용합니다.

### 진태양시

옵션을 켰을 때만 다음 보정을 현지 일주·시주 계산 시각에 적용합니다.

```text
경도 보정(분) = 4 × (출생지 경도 − 시간대 표준 자오선)
균시차(분) = 9.87 sin(2B) − 7.53 cos(B) − 1.5 sin(B)
B = 2π(연중일 − 81) / 364
```

시간대 표준 자오선은 출생 순간의 UTC 오프셋 × 15°입니다. 도시 선택값은 도시 중심 경도이므로 결과에 근사값으로 표시됩니다.

### 오행과 영근

천간, 지지 본기, 지장간은 `src/lib/bazi`의 데이터 객체로 관리합니다. 영근의 점수·임계값은 [`spiritualRootRules.ts`](src/lib/spiritual-root/spiritualRootRules.ts), 변이 조건은 [`mutationRules.ts`](src/lib/spiritual-root/mutationRules.ts)에 있습니다.

유효 영근은 4점 이상이면서 다음 중 하나를 만족해야 합니다.

- 천간 투출과 지지 통근이 함께 있음
- 월령을 얻음
- 삼합 또는 방합 세력을 이룸
- 일간 오행이고 뿌리 또는 강한 생조가 있음

2점 이상 4점 미만은 잠재 영근입니다. 신살은 영근 개수를 바꾸지 않고 부가 성향에만 사용됩니다. 변이영근과 수련 추천은 전통 명리학 규칙이 아닌 창작 규칙입니다.

## 주요 구조

```text
src/
  app/                  # 입력, 결과, 해설 페이지
  components/           # 폼, 사주표, 차트, 결과 및 상세 근거
  lib/calendar/         # 시간대, 절기, 진태양시, 네 기둥
  lib/bazi/             # 천간·지지·지장간·관계·신살 데이터
  lib/spiritual-root/   # 점수, 유효근, 분류, 변이, 신뢰도
  tests/                # 달력 경계 및 영근 순수 함수 테스트
  types/                # 공통 타입
```

## 검증과 한계

달력 테스트에는 라이브러리 관리자가 README에 공개한 `1986-05-29` 예시(병인년·계사월·계유일), 2024년 입춘/절입 전후, 자시, 야자시, 시간대, 윤년, 2023년 윤2월, 진태양시를 포함합니다. 영근 테스트는 인공 명식 데이터로 0~5개 분류, 혼원, 빙·뇌·풍·용암 변이, 경계 후보와 제3 영근 방해를 검증합니다.

- UI 지원 범위는 1900~2100년입니다.
- 역사적 표준시와 서머타임 정확도는 실행 환경의 IANA 시간대 데이터에 의존합니다.
- 균시차는 일반 근사식이며 고정밀 천문력은 아닙니다.
- 야자시, 신살, 합화는 명리 유파마다 기준이 다릅니다.
- 절기·시진 경계 30분 이내에는 보수적인 경고를 표시합니다.
- 규칙 점수는 세계관 설계용 초기값이며 실제 명리학적 사실을 뜻하지 않습니다.

라이브러리 문서: [lunar-typescript](https://github.com/6tail/lunar-typescript), [Luxon](https://moment.github.io/luxon/), [Next.js App Router](https://nextjs.org/docs/app/getting-started)

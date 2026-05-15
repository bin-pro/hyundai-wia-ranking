# 현대위아 50주년 챌린지 랭킹 시스템

3일 행사용. 태블릿에서 참가자가 점수 입력 → TV에서 실시간 랭킹 표시. 게임 3종: **타이핑 / 컨트롤 / 점프업**.

## 기기 / 화면 비율

| 화면 | 디바이스 | 해상도 | 비율 | viewBox |
|---|---|---|---|---|
| 입력 페이지(3종) | 태블릿 12.4" | 2800×1752 | 16:10 | **1077.06 × 1920** (세로) |
| 랭킹보드 | TV 43" | 1920×1080 | 16:9 | **1920 × 1080** (가로) |

## 스택

- Node.js + Express, **build 없음**. `npm start` → `server.js`.
- DB: `node:sqlite` (DatabaseSync) → `ranking.db` (gitignore됨).
- Frontend: 순수 HTML/CSS/JS. CDN으로 SheetJS(`xlsx`) 로드.
- 배포: `git push origin main` → GitHub Actions(`appleboy/ssh-action`) → EC2 `pm2 restart hyundai-wia`. 워크플로: `.github/workflows/deploy.yml`.

## 디렉토리

```
server.js              # Express, admin Basic Auth, / → /ranking.html 리다이렉트
db.js                  # SQLite 초기화. scores 테이블 (phone 컬럼 남아있으나 미사용)
routes/scores.js       # POST/GET/PUT/DELETE. DELETE / (전체삭제)가 DELETE /:id 보다 위에 있어야 함
routes/rankings.js     # /api/rankings — 게임별 top10. 게임별 정렬 방향 ORDER 객체
public/
  ranking.html         # TV용. 랭킹보드.svg를 배경으로 9개 행 오버레이
  input-typing.html    # 태블릿용
  input-control.html
  input-jump.html
  admin.html           # /admin, Basic Auth (admin / wia2026)
  디자인/
    랭킹보드.svg        # 13MB. TV용 배경
    타이핑챌린지.svg     # 11MB. 입력 페이지 배경
    컨트롤챌린지.svg
    점프업챌린지.svg
    [원본]*.ai          # gitignore (178MB)
```

## ⭐ SVG-오버레이 패턴 (이 프로젝트의 핵심)

디자이너가 SVG를 만들어주면, **SVG를 배경 이미지로 그대로 깔고** 그 위에 input/button/text를 **% 좌표**로 절대 위치시킴. SVG → PNG 변환 금지 (디자인 충실도 유지가 우선순위).

### 표준 구조

```html
<div class="stage">
  <img class="bg" src="디자인/XXX.svg" />
  <!-- 오버레이 요소들 (input, button, div) -->
</div>
```

```css
/* viewBox 비율을 화면에 맞춰 letterbox. 좌표계는 항상 viewBox 기준 %. */
.stage {
  position: relative;
  width:  min(100vw, calc(100vh * <W> / <H>));
  height: min(100vh, calc(100vw * <H> / <W>));
  overflow: hidden;
}
.bg { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
```

- 입력 페이지: `<W>/<H>` = `1077.06/1920` (세로)
- 랭킹보드: `<W>/<H>` = `1920/1080` (가로)

### 좌표 추출 방법

SVG 11~13MB라 통째로 `Read` 하면 컨텍스트 폭발. 두 가지 방법:

```bash
# 1. base64 라인 제거 후 보기 (디자인 SVG는 raster를 base64로 embed)
awk 'length > 300 { next } { print }' 디자인/랭킹보드.svg | head -200

# 2. python 정규식으로 path 시작점만 추출
python3 -c "
import re
with open('디자인/랭킹보드.svg') as f: content = f.read()
for m in re.finditer(r'<rect[^>]*x=\"(\d+\.?\d*)\"[^>]*y=\"(\d+\.?\d*)\"[^>]*width=\"(\d+\.?\d*)\"[^>]*height=\"(\d+\.?\d*)\"', content):
  print(m.groups())
"
```

좌표 → % 변환: `x% = x_svg / viewBox_W * 100`.

**한글 텍스트는 path로 렌더링됨** (`<text>` 없음). 위치만 보면 됨, 콘텐츠는 추론 불가.

### 랭킹보드 좌표 (외워둘 만함)

viewBox 1920×1080 기준 / 9개 흰색 둥근 사각형 행:
- 좌측 카드: `left=8.07%` (x=155)
- 중간 카드: `left=38.12%` (x=731.91)
- 우측 카드: `left=68.17%` (x=1308.81)
- 행 크기: `width=23.72%, height=7.88%` (455.46 × 85.06)
- 행 top: `57.78% / 67.53% / 77.27%` (1위/2위/3위)
- 행 내 분리선: 좌측 0~24.68%가 "X위" 라벨 영역 → 콘텐츠는 `left: 25%`부터

**SVG에 "1위/2위/3위" 라벨이 9행 모두 미리 그려져 있음.** HTML로 번호 오버레이 추가하면 겹친다. 콘텐츠(이름·기록)만 오버레이.

### 입력 페이지 좌표

3종 모두 거의 동일 (1077.06×1920):
- 점수 input: `left: ~13.3%, top: 45.02%, width: 73.45%, height: 6.71%`
- 이름 input: `left: ~13.3%, top: 57.21%, width: 73.45%, height: 6.71%`
- 소속 버튼 6개 (3×2 grid): row1 `top: 69.40%`, row2 `top: 74.21%`
- 등록 버튼: `top: 80.40%, height: 4.94%`

`컨트롤챌린지.svg`만 x 오프셋이 미세하게 다름 (13.27% vs 13.41%) — SVG의 카드 위치가 다른 게 아니라 디자이너 작업 차이.

## 게임별 차이 (꼭 일관)

| 게임 | 정렬 | 단위 | 입력 포맷 | 저장값 | 표시 |
|---|---|---|---|---|---|
| typing | DESC | CPM | 콤마 자동 (`123,145`) | 정수 | `123,145CPM` |
| control | **ASC (작을수록 1등)** | 초 | 6자리 → 콜론 자동 (`123456`→`12:34:56`) | **정수 그대로 저장** | `12:34:56초` |
| jump | DESC | cm | 그냥 정수 | 정수 | `123cm` |

### 컨트롤 챌린지 핵심 규칙

- 입력값을 **변환 없이 정수**로 저장. `123456` → DB에 123456 (`Number(digits)`).
- 콜론은 표시용. `String(score).padStart(6,'0')` 후 2자리씩 끊어 `:` 삽입.
- 단위 "초"는 라벨일 뿐 값을 초로 해석하지 않음.
- ASC 정렬: 작은 정수 = 짧은 시간 = 1등.
- ⚠️ 과거에 14.32 같은 **소수점 데이터**가 들어있을 수 있음 (변환 시 잠깐 사용한 포맷). 이건 정렬 시 항상 위로 와버림 — 행사 시작 전에 admin Delete All로 비울 것.

## API

```
GET    /api/rankings          → { typing:[...], control:[...], jump:[...] } 각 top10
POST   /api/scores            { name, site, game, score }
GET    /api/scores            전체 (admin용, created_at DESC)
PUT    /api/scores/:id        수정
DELETE /api/scores/:id        개별 삭제
DELETE /api/scores            전체 삭제  ← 라우트 순서상 /:id보다 위
```

`phone` 컬럼은 스키마에 남아있으나 입력 폼에서 미수집. POST 시 안 보내면 `''` 기본값.

## 프론트엔드 공통

```js
// 로컬 개발: 프론트 8080, 백엔드 3000 분리 가능.
// EC2 배포: 같은 도메인이라 API_BASE는 ''.
const API_BASE = (location.port && location.port !== '3000') ? 'http://localhost:3000' : '';
```

CORS는 server.js에서 `*` 허용 중. 행사 끝나면 좁힐 것.

## Admin (`/admin`, Basic Auth `admin/wia2026`)

- 게임/소속 필터 버튼 + 등록시간 컬럼의 날짜 드롭다운 필터.
- Excel(xlsx) 다운로드: SheetJS, **현재 필터/정렬 적용된 화면 기준** (`getFiltered()`).
- 전체 삭제 버튼 (별도 확인 모달).
- 게임별 정렬 방향(`GAME_ASC = { control: true }`)이 admin/excel/ranking 모두에서 일관.
- 컨트롤 점수 표시: `formatScoreText()` — 6자리 패딩 후 콜론 삽입.

## 자주 하는 실수 / 사용자 피드백 누적

- **SVG → PNG 금지.** 디자이너 SVG의 의미는 "개발도 똑같이". 그래서 SVG.
- **AskUserQuestion 남발 금지.** 간단한 건 그냥 구현하고 보여줘.
- **불필요한 백워드 호환 코드 금지.** 포맷 바뀌면 그냥 바꿔. 행사 전이라 데이터 비울 수 있음.
- **댓글/요약 길게 쓰지 마.** 짧고 결과 위주로.
- **작업 끝나면 `git push origin main`까지** (자동 배포 트리거).
- 큰 .ai 원본 파일은 gitignore (`*.ai`). GitHub 100MB 제한 초과.

## 알려진 미해결

- 컨트롤 챌린지에 과거 포맷(소수점)으로 들어간 데이터가 섞이면 정렬 깨짐 → 행사 시작 전 Delete All 필요.
- SVG 13MB가 첫 로드 시 무거움. CloudFront보단 Express `compression` + `Cache-Control` 먼저 고려.
- `phone` 컬럼은 스키마에 남아있음. 마이그레이션 없이 그냥 무시 중.

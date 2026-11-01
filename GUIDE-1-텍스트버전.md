# 📝 버전 1: 텍스트 전용 가이드

> **목표:** 이미지 없이 글만 생성하는 기본 버전을 완성합니다!

---

## 🎯 이 버전에서 배울 것

- ✅ Node.js HTTP 서버 만들기
- ✅ OpenRouter API 사용하기
- ✅ 한국어 글 스타일 분석
- ✅ AI로 블로그 글 자동 생성
- ✅ ClipboardAPI로 복사 기능

**❌ 이미지 생성은 버전 2에서!**

---

## 🚀 실행 방법

```bash
node blog-server.js
```

브라우저: `http://localhost:3000`

---

## 📝 구현 단계

### 1단계: OpenRouter API 연결 ⭐ 중요!

**파일:** `blog-server.js`  
**함수:** `callOpenRouter()`

#### AI한테 이렇게 물어보세요:

```
"Node.js에서 https.request()로 POST 요청 보내는 코드 작성해줘.
엔드포인트: https://openrouter.ai/api/v1/chat/completions
헤더:
- Authorization: Bearer ${ENV.OPENROUTER_API_KEY}
- Content-Type: application/json
본문: { model: 'anthropic/claude-sonnet-4.5', messages: messages }
응답은 JSON으로 받아서 callback(null, data) 호출해야 해."
```

#### 확인 방법:
- 서버 재시작
- 스타일 분석 클릭
- 콘솔에 응답 확인

---

### 2단계: 스타일 분석 프롬프트 작성

**파일:** `blog-server.js`  
**위치:** `/api/analyze-style` 엔드포인트

#### AI한테 이렇게 물어보세요:

```
"한국어 블로그 글의 스타일을 분석하는 프롬프트 만들어줘.

분석할 항목:
1. 말투 (반말/해요체/합니다체/한다체)
   - 문장 끝을 보고 판단
   - ~해, ~야 → 반말
   - ~해요, ~예요 → 해요체
   - ~합니다, ~습니다 → 합니다체
   - ~한다, ~다 → 한다체

2. 소제목 스타일
   - 개수
   - 이모지 사용 여부
   - 번호 사용 여부

3. 문단 길이
   - 짧음 (1~2줄)
   - 보통 (3~5줄)
   - 길게 (6줄 이상)

4. 해시태그 개수

5. 도입부 패턴 (첫 1~2문장 스타일)

6. 마무리 패턴 (마지막 1~2문장 스타일)

결과는 JSON 형식으로:
{
  \"tone\": \"반말\",
  \"subheadings\": \"3개, 이모지 사용\",
  \"paragraphLength\": \"짧음\",
  \"hashtagCount\": \"5개\",
  \"introFormula\": \"안녕! 오늘은~\",
  \"closingFormula\": \"다음에 또 올게~\"
}
"
```

#### 확인 방법:
- 실제 블로그 글 붙여넣기
- 분석 결과 확인
- 말투가 정확한지 체크

---

### 3단계: 블로그 글 생성 프롬프트

**파일:** `blog-server.js`  
**위치:** `/api/generate-post` 엔드포인트

#### AI한테 이렇게 물어보세요:

```
"네이버 블로그 글을 생성하는 프롬프트 만들어줘.

입력:
- keyword: 키워드 (예: \"강남 맛집\")
- style: 스타일 분석 결과 객체
- storeInfo: 가게 정보 객체

요구사항:
1. 분석된 말투 그대로 사용 (반말이면 끝까지 반말)
2. 소제목은 **별표**로 감싸기
3. 문단 길이는 style.paragraphLength 따라서
4. 제목은 40자 이내, 클릭 유도형
5. 본문은 자연스럽고 유용한 정보 위주
6. 광고 티 안 나게
7. 해시태그는 style.hashtagCount 개수 맞춰서

출력 형식:
{
  \"title\": \"제목\",
  \"body\": \"본문 (마크다운 아님, **별표**만)\",
  \"hashtags\": [\"태그1\", \"태그2\"]
}

프롬프트는 상세하고 구체적으로 작성해줘.
"
```

#### 확인 방법:
- 키워드 입력해서 글 생성
- 말투가 일관된지 확인
- 소제목이 **별표**로 되어있는지
- 네이버에 붙여넣어보기

---

### 4단계: 프론트엔드 API 호출

**파일:** `blog-index.html`  
**함수:** `analyzeStyle()`, `generatePosts()`

#### AI한테 이렇게 물어보세요:

```
"JavaScript fetch()로 POST 요청 보내는 코드 작성해줘.

analyzeStyle 함수:
- 엔드포인트: /api/analyze-style
- body: { referencePosts: '글 내용' }
- 응답받아서 analyzedStyle 변수에 저장
- localStorage에도 저장
- 화면에 결과 표시

generatePosts 함수:
- 키워드 배열 순회 (for...of)
- 각 키워드마다 /api/generate-post 호출
- await로 순차 처리
- 결과를 generatedPosts 배열에 추가
- displayResults() 호출

에러 처리도 포함해줘."
```

#### 확인 방법:
- 스타일 분석 작동
- 글 생성 작동
- 여러 키워드 한 번에 입력
- 로딩 표시 확인

---

### 5단계: 복사 기능 구현

**파일:** `blog-index.html`  
**함수:** `copyTitle()`, `copyBody()`, `copyTags()`

#### 제목 복사 - AI한테:

```
"navigator.clipboard.writeText()로 텍스트 복사하는 코드 작성해줘.
복사 완료되면 alert으로 알림 띄워줘."
```

#### 본문 복사 (HTML 서식 유지) - AI한테:

```
"ClipboardItem API로 HTML 서식 유지하면서 복사하는 코드 작성해줘.

단계:
1. **별표** → <strong>굵게</strong> 변환
2. 줄바꿈(\\n) → <br> 변환
3. text/html과 text/plain 둘 다 ClipboardItem에 넣기
4. navigator.clipboard.write() 호출

네이버 블로그에 붙여넣으면 서식이 그대로 유지되어야 해."
```

#### 태그 복사 - AI한테:

```
"hashtags 배열을 \"#태그1 #태그2 #태그3\" 형식으로 변환해서
클립보드에 복사하는 코드 작성해줘."
```

#### 확인 방법:
- 제목 복사 → 어디든 붙여넣기
- 본문 복사 → **네이버 블로그**에 붙여넣기
- 태그 복사 → 태그창에 붙여넣기
- 서식이 유지되는지 확인!

---

### 6단계: localStorage 저장

**파일:** `blog-index.html`  
**함수:** `saveToStorage()`, `loadFromStorage()`

#### AI한테 이렇게 물어보세요:

```
"localStorage에 객체 저장하고 불러오는 코드 작성해줘.

저장할 것:
- analyzedStyle (스타일 분석 결과)
- storeInfo (가게 정보)

저장: JSON.stringify() 후 localStorage.setItem()
불러오기: localStorage.getItem() 후 JSON.parse()

페이지 로드 시 자동으로 불러와서 화면에 채워넣기."
```

#### 확인 방법:
- 스타일 분석 → 새로고침 → 남아있음
- 가게 정보 입력 → 새로고침 → 남아있음

---

## ✅ 완성 체크리스트

- [ ] 서버 실행 성공 (`http://localhost:3000`)
- [ ] 스타일 분석 작동
- [ ] 말투 분석 정확함 (반말/존댓말 구분)
- [ ] 블로그 글 생성 작동
- [ ] 말투 일관성 유지
- [ ] 소제목 **별표** 표시
- [ ] 제목 복사 작동
- [ ] 본문 복사 작동 (서식 유지)
- [ ] 태그 복사 작동
- [ ] 네이버 블로그 붙여넣기 성공!
- [ ] localStorage 저장/불러오기 작동

---

## 🐛 자주 하는 실수

### 1. API 키 오타
```
❌ OPENROUTER_API_KEY=sk or v1...  (띄어쓰기 있음)
✅ OPENROUTER_API_KEY=sk-or-v1...  (붙여쓰기)
```

### 2. CORS 에러
```
서버에서 이미 설정했으니 괜찮아요!
res.setHeader('Access-Control-Allow-Origin', '*');
```

### 3. JSON 파싱 실패
```javascript
// AI가 "```json" 으로 감싸서 보낼 수 있음
const jsonMatch = content.match(/\{[\s\S]*\}/);
const data = JSON.parse(jsonMatch[0]);
```

### 4. 복사 버튼 안 눌림
```javascript
// 함수 이름 확인
onclick="copyBody(0)"  // 0은 인덱스
```

---

## 🎉 완성했다면?

### 다음 단계:
**버전 2: 이미지 포함 버전 도전!**

- `GUIDE-2-이미지버전.md` 읽기
- `blog-server-with-image.js` 사용
- Higgsfield API로 이미지 생성
- 훨씬 멋진 완성본!

### 추가 기능 아이디어:
- 생성된 글 수정 기능
- 여러 스타일 저장하기
- 글 히스토리 보기
- 예약 발행 기능

---

## 💪 막혔을 때?

1. **에러 메시지 복사**
2. **AI한테 보여주기**
3. **"이 에러 뭐야? 어떻게 고쳐?" 물어보기**

**기억하세요:**
- 에러는 배움의 기회! 🎓
- AI가 옆에 있어요! 🤖
- 천천히 하나씩! 🐢

**화이팅! 🚀**

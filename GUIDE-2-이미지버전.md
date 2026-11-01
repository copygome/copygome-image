# 🎨 버전 2: 이미지 포함 가이드

> **목표:** 버전 1에 이미지 생성 기능을 추가합니다!

**⚠️ 중요:** 버전 1을 먼저 완성하고 오세요!  
→ `GUIDE-1-텍스트버전.md` 참고

---

## 🎯 버전 2에서 추가되는 것

- ✅ 버전 1의 모든 기능 (글 스타일 분석, 글 생성, 복사)
- ✨ **Higgsfield 이미지 생성** (NEW!)
- ✨ **이미지 포함된 블로그 글** (NEW!)
- ✨ **제출→폴링 비동기 패턴** (NEW!)

**난이도:** 버전 1보다 약간 어려워요 (비동기 처리 추가)

---

## 📝 진행 순서

### 0단계: 버전 1 완료 확인

- [ ] 버전 1 완성했나요?
- [ ] OpenRouter API 호출 이해했나요?
- [ ] fetch()와 async/await 익숙한가요?

**아니라면?** → `GUIDE-1-텍스트버전.md`로 돌아가세요!

---

### 1단계: 기본 서버 테스트
```bash
node blog-server-with-image.js
```

브라우저에서 `http://localhost:3000` 접속

✅ **확인사항:** 화면이 나오고 "V2 이미지 포함" 배지 보이면 성공!

---

### 2단계: OpenRouter API 구현 (버전 1과 동일)
**파일:** `blog-server-with-image.js`  
**위치:** `callOpenRouter` 함수

💡 **팁:** 버전 1에서 이미 만들었다면 그대로 복붙!

**AI한테 물어볼 것:**
```
"Node.js에서 https.request()로 POST 요청 보내는 방법 알려줘"
"OpenRouter API 사용법 알려줘. 엔드포인트는 openrouter.ai/api/v1/chat/completions이야"
```

**힌트:**
- POST 요청
- 헤더: `Authorization: Bearer ${API_KEY}`
- body: `{ model: 'anthropic/claude-sonnet-4.5', messages: [...] }`

✅ **테스트:** 스타일 분석 버튼 눌러보기

---

### 3단계: 스타일 분석 프롬프트 작성
**파일:** `blog-server.js`  
**위치:** `/api/analyze-style` 엔드포인트

**AI한테 물어볼 것:**
```
"한국어 블로그 글의 말투를 분석하는 프롬프트 만들어줘.
반말/존댓말/문어체/격식체를 구분하고,
소제목 스타일, 문단 길이, 해시태그 개수도 분석해야 해."
```

**결과 형식:**
```json
{
  "tone": "반말/해요체/합니다체/한다체",
  "subheadings": "개수와 형태",
  "paragraphLength": "짧음/보통/길게",
  "photoPlacement": "위치 패턴",
  "hashtagCount": "N개",
  "introFormula": "도입부 예시",
  "closingFormula": "마무리 예시"
}
```

✅ **테스트:** 실제 블로그 글 붙여넣고 분석해보기

---

### 4단계: 블로그 글 생성 프롬프트
**파일:** `blog-server.js`  
**위치:** `/api/generate-post-with-image` 엔드포인트

**AI한테 물어볼 것:**
```
"분석된 스타일에 맞춰서 네이버 블로그 글을 생성하는 프롬프트 만들어줘.
키워드, 가게 정보, 스타일 정보를 받아서
제목, 본문, 해시태그, 이미지 프롬프트를 JSON으로 반환해야 해."
```

**결과 형식:**
```json
{
  "title": "제목",
  "body": "본문 (마크다운 아님, [IMAGE_PROMPT: ...] 포함)",
  "hashtags": ["태그1", "태그2"],
  "imagePrompts": ["이미지1 설명", "이미지2 설명"]
}
```

✅ **테스트:** 키워드 하나로 글 생성해보기 (이미지는 나중에)

---

### 5단계: Higgsfield 이미지 생성 ⭐ 핵심!
**파일:** `blog-server-with-image.js`  
**위치:** `generateImage`와 `pollForResult` 함수

**🆕 이게 버전 2의 핵심입니다!**

**AI한테 물어볼 것:**
```
"Higgsfield API로 이미지 생성하는 방법 알려줘.
2단계 패턴이야:
1. POST로 이미지 생성 요청 제출 → request_id 받기
   엔드포인트: https://api.higgsfield.ai/ideogram/v4.0
   헤더: Authorization: Key ${ENV.HIGGSFIELD_API_KEY}
   body: { prompt: '설명', aspect_ratio: '4:3' }

2. GET으로 폴링해서 완성 확인하기
   엔드포인트: https://api.higgsfield.ai/requests/{request_id}/status
   2초마다 확인
   status === 'completed' 되면 images[0].url 가져오기

코드 작성해줘."
```

**제출 body:**
```json
{
  "prompt": "이미지 설명",
  "aspect_ratio": "4:3"
}
```

**폴링:**
- 2초마다 `/requests/{request_id}/status` 확인
- status === 'completed' → 성공
- images[0].url → 이미지 URL

✅ **테스트:** 이미지 포함된 글 생성해보기

---

### 6단계: HTML 프론트엔드 완성
**파일:** `blog-index-with-image.html`  

**버전 1과 다른 점:**
- API 엔드포인트: `/api/generate-post-with-image` (이미지 포함)
- `formatBodyHtml()` 함수에서 `[IMAGE_PROMPT: ...]` → `<img>` 변환 추가

**구현할 함수들:**
1. `analyzeStyle()` - API 호출 (버전 1과 동일)
2. `generatePosts()` - API 엔드포인트만 다름!
3. `copyTitle()` - 제목 복사 (버전 1과 동일)
4. `copyBody()` - HTML 복사, 이미지 포함!
5. `copyTags()` - 태그 복사 (버전 1과 동일)
6. `formatBodyHtml()` - 이미지 처리 추가!

**AI한테 물어볼 것:**
```
"fetch()로 POST 요청 보내는 방법 알려줘"
"ClipboardItem API로 HTML 복사하는 방법 알려줘"
"localStorage 사용법 알려줘"
```

✅ **테스트:** 전체 플로우 테스트

---

## 🐛 디버깅 팁

### 에러 날 때
1. 콘솔에 뭐가 나오는지 확인
2. 에러 메시지 그대로 AI한테 보여주기
3. "이 에러 뭐야? 어떻게 고쳐?" 물어보기

### API가 안 될 때
1. `.env` 파일 API 키 확인
2. console.log()로 요청/응답 찍어보기
3. AI한테 "API 호출 코드 검토해줘" 요청

### 화면이 안 나올 때
1. `http://localhost:3000` 주소 확인
2. 서버가 실행 중인지 확인 (터미널)
3. 브라우저 개발자 도구 (F12) 열어서 에러 확인

---

## ✨ 완성 체크리스트

- [ ] 서버 실행 성공
- [ ] HTML 화면 나옴
- [ ] 스타일 분석 작동
- [ ] 글 생성 작동
- [ ] 이미지 생성 작동
- [ ] 복사 기능 작동
- [ ] 네이버 블로그에 붙여넣기 성공!

---

## 🎉 완성했다면?

### 추가 기능 아이디어
- 생성된 글 수정 기능
- 이미지 개수 선택 기능
- 여러 스타일 저장하기
- 글 히스토리 보기
- PDF 다운로드
- 예약 발행 기능

**AI한테 물어보세요:**
- "이 기능 어떻게 추가해?"
- "이렇게 바꾸고 싶은데 방법 알려줘"
- "더 좋은 방법 없어?"

---

## 💪 화이팅!

막히는 게 당연해요!  
AI한테 계속 물어보면서 하면 됩니다!

**기억하세요:**
- 코딩은 구글링(또는 AI한테 물어보기)입니다
- 에러는 배움의 기회입니다
- 작동하는 코드가 최고입니다!

🚀 **Let's Go!**

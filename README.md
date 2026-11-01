# 🤖 AI 네이버 블로그 자동 생성기

> **바이브 코딩으로 만들어봐요!**  
> AI와 대화하면서 네이버 블로그 자동 생성기를 직접 만들 거예요!

[![GitHub](https://img.shields.io/badge/GitHub-naver--blog--creator-blue)](.)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-green)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## 🎯 뭘 만들까요?

**AI가 네이버 블로그 글을 자동으로 만들어주는 도구!**

### ✨ 주요 기능
- 📝 내 글쓰기 스타일 자동 분석 (말투, 구조, 패턴)
- 🤖 키워드만 입력하면 AI가 글 자동 생성
- 🎨 이미지까지 자동 생성 (선택사항)
- 📋 복사-붙여넣기만 하면 서식 그대로!
- ⚡ 한 번에 10개, 20개도 생성 가능

---

## 📦 2가지 버전

### 🥇 버전 1: 텍스트 전용 (추천! ⭐)

**처음 하시는 분은 여기서 시작하세요!**

```
📂 사용 파일:
└─ blog-server.js
└─ blog-index.html
└─ GUIDE-1-텍스트버전.md
```

**특징:**
- ✅ 빠른 완성 (1~2시간)
- ✅ 기본 개념 학습 집중
- ✅ HTTP 서버, API 호출, AI 사용법
- ❌ 이미지 생성 없음

**배울 것:**
- Node.js 서버 만들기
- OpenRouter API 사용하기
- 한국어 글 스타일 분석
- AI 프롬프트 작성하기
- 복사 기능 구현하기

---

### 🥈 버전 2: 이미지 포함 (심화)

**버전 1 완성 후 도전하세요!**

```
📂 사용 파일:
└─ blog-server-with-image.js
└─ blog-index-with-image.html
└─ GUIDE-2-이미지버전.md
```

**특징:**
- ✅ 버전 1의 모든 기능
- ✅ Higgsfield AI로 이미지 자동 생성
- ✅ 제출→폴링 비동기 패턴 학습
- ✨ 완전한 블로그 글 완성!

**추가로 배울 것:**
- Higgsfield API 사용
- 비동기 폴링 패턴
- 여러 API 조합하기
- 이미지 처리하기

---

## 🚀 시작하기

### 1️⃣ 준비물
- ✅ Node.js 설치 (v18 이상)
- ✅ 텍스트 에디터 (VSCode 추천, 메모장도 OK!)
- ✅ AI (Claude, ChatGPT 등)

### 2️⃣ API 키 발급

#### OpenRouter (필수 - 글 생성용)
1. https://openrouter.ai/keys 접속
2. 회원가입 → API 키 생성
3. 복사해두기

#### Higgsfield (선택 - 이미지 생성용, 버전 2만)
1. https://open.higgsfield.ai 접속
2. 회원가입 → API 키 생성
3. KEY와 SECRET 복사
4. `KEY:SECRET` 형식으로 합쳐두기

### 3️⃣ API 키 설정

```bash
# .env.example을 복사해서 .env 만들기
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env

# .env 파일 열어서 실제 키 입력
OPENROUTER_API_KEY=sk-or-v1-your-key-here
HIGGSFIELD_API_KEY=your-key:your-secret  # 버전 2만 필요
```

### 4️⃣ 실행

**버전 1 (텍스트):**
```bash
node blog-server.js
```

**버전 2 (이미지):**
```bash
node blog-server-with-image.js
```

브라우저에서 `http://localhost:3000` 접속!

---

## 📖 학습 순서

### 🎓 1단계: 버전 1로 기초 다지기
1. `GUIDE-1-텍스트버전.md` 열기
2. AI와 대화하며 코드 작성
3. 막히면 AI한테 계속 물어보기
4. **완성!** 🎉

### 🎓 2단계: 버전 2로 실력 올리기
1. `GUIDE-2-이미지버전.md` 열기
2. 이미지 생성 기능 추가
3. 폴링 패턴 학습
4. **프로 완성!** 🚀

---

## 💡 바이브 코딩이란?

**AI랑 대화하면서 코딩하는 거예요!**

```
학생: "Node.js로 HTTP 서버 만들어줘"
AI: (코드 작성)
학생: "여기에 API 추가해줘"
AI: (코드 추가)
학생: "에러 나는데 어떻게 고쳐?"
AI: (에러 해결)
```

### 장점:
- ✅ 코딩 몰라도 만들 수 있어요
- ✅ 궁금한 거 바로바로 물어보면 돼요
- ✅ 에러 나도 AI가 고쳐줘요
- ✅ "내가 만들었다!" 성취감!

### 잘 물어보는 법:
```
❌ 나쁜 질문: "코드 짜줘"
✅ 좋은 질문: "fetch()로 POST 요청 보내는 코드 작성해줘"

❌ 나쁜 질문: "에러 나요"
✅ 좋은 질문: "이 에러 메시지가 뭐예요? [에러 붙여넣기]"
```

---

## 📂 프로젝트 구조

```
naver-blog-creator/
├── .env                          # API 키 (절대 공유 금지!)
├── .env.example                  # API 키 템플릿
├── .gitignore                    # Git 업로드 제외 목록
├── README.md                     # 이 파일!
│
├── 📝 버전 1: 텍스트 전용
│   ├── blog-server.js            # 서버 (텍스트만)
│   ├── blog-index.html           # 웹 페이지 (텍스트만)
│   └── GUIDE-1-텍스트버전.md      # 가이드
│
└── 🎨 버전 2: 이미지 포함
    ├── blog-server-with-image.js # 서버 (이미지 포함)
    ├── blog-index-with-image.html# 웹 페이지 (이미지 포함)
    └── GUIDE-2-이미지버전.md      # 가이드
```

---

## ❓ 자주 묻는 질문

**Q. 코딩을 하나도 몰라요**  
→ 괜찮아요! AI한테 다 물어보면서 하면 됩니다!

**Q. 어느 버전부터 해야 하나요?**  
→ 처음이면 무조건 **버전 1**! 완성하고 버전 2로!

**Q. 에러가 나요**  
→ 에러 메시지를 AI한테 보여주세요. 고쳐줄 거예요!

**Q. 이해가 안 가요**  
→ "이 코드 설명해줘" 라고 AI한테 물어보세요!

**Q. 다른 기능 추가하고 싶어요**  
→ 좋아요! AI한테 "이런 기능 추가하고 싶은데 어떻게 해?" 물어보세요!

**Q. 버전 2는 꼭 해야 하나요?**  
→ 아니요! 버전 1만으로도 완전한 블로그 생성기예요!

---

## 🎓 학습 목표

이 프로젝트를 마치면:

- ✅ Node.js로 웹 서버 만들 수 있어요
- ✅ API 호출하는 방법 알게 돼요
- ✅ AI API 사용법 익혀요  
- ✅ 실전 프로젝트 완성해요
- ✅ AI와 함께 코딩하는 방법 터득해요

**가장 중요한 건:**
> "어? 나도 이런 거 만들 수 있네?" 하는 자신감! 💪

---

## 🤝 도움받기

- 💬 강사님한테 물어보기
- 👥 동료들과 함께 해결하기
- 🤖 AI한테 계속 물어보기 (무한으로!)

---

## 📝 라이선스

MIT License - 자유롭게 사용하세요!

---

## 🎉 시작할 준비 됐나요?

### 버전 1부터 시작:
```bash
# 1. GUIDE-1-텍스트버전.md 읽기
# 2. node blog-server.js 실행
# 3. http://localhost:3000 접속
# 4. AI와 함께 완성하기!
```

**화이팅! 🚀**

---

<div align="center">

Made with ❤️ by 바이브 코딩

**코딩 몰라도 만들 수 있어요!**

</div>

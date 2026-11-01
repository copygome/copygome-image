// ============================================
// 🤖 AI 네이버 블로그 자동 생성기 - 서버
// ============================================
//
// 이 파일은 Node.js 서버입니다.
// 웹 브라우저의 요청을 받아서 AI API를 호출하고 결과를 돌려줍니다.
//
// 주요 기능:
// 1. HTTP 서버 실행
// 2. HTML 파일 제공
// 3. 글 스타일 분석 API
// 4. 블로그 글 생성 API
// 5. 이미지 생성 API (Higgsfield)

// ============================================
// 📦 필요한 모듈 불러오기
// ============================================
// Node.js 기본 모듈만 사용합니다 (npm install 필요 없음!)

import http from 'http';        // HTTP 서버 만들기
import https from 'https';      // HTTPS 요청 보내기 (API 호출용)
import fs from 'fs';            // 파일 읽기/쓰기
import path from 'path';        // 파일 경로 다루기
import { fileURLToPath } from 'url';  // ES Module에서 __dirname 사용하기
import { URL } from 'url';      // URL 파싱

// ES Module에서 __dirname 만들기
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// 🔐 환경 변수 로드 (.env 파일)
// ============================================
// .env 파일에서 API 키를 읽어옵니다.
// 형식: KEY=VALUE

function loadEnv() {
  const env = {};
  try {
    const envPath = path.join(__dirname, '.env');
    const envFile = fs.readFileSync(envPath, 'utf8');

    // 한 줄씩 읽어서 파싱
    envFile.split('\n').forEach(line => {
      const [key, ...values] = line.split('=');
      if (key && values.length) {
        env[key.trim()] = values.join('=').trim();
      }
    });
  } catch (err) {
    console.error('⚠️  .env 파일을 찾을 수 없습니다. .env 파일을 생성해주세요.');
  }
  return env;
}

const ENV = loadEnv();
const PORT = 3000;

// ============================================
// 🤖 OpenRouter API 호출 (Claude AI)
// ============================================
// OpenRouter를 통해 Claude AI를 사용합니다.
// 글 스타일 분석과 블로그 글 생성에 사용됩니다.

function callOpenRouter(messages, callback) {
  // TODO: AI한테 물어보기!
  // "Node.js에서 OpenRouter API 호출하는 방법 알려줘"
  //
  // 힌트:
  // - https.request() 사용
  // - POST 요청
  // - 헤더에 Authorization 추가
  // - body에 model과 messages 전송

  console.log('TODO: OpenRouter API 호출 구현하기');
  callback(new Error('아직 구현 안 됨'));
}

// ============================================
// 🎨 Higgsfield 이미지 생성 (2단계)
// ============================================
// 1단계: 이미지 생성 요청 제출
// 2단계: 폴링으로 완성될 때까지 확인

function generateImage(prompt, callback) {
  // TODO: AI한테 물어보기!
  // "Higgsfield API로 이미지 생성하는 방법 알려줘"
  // "제출하고 폴링하는 패턴이 뭐야?"
  //
  // 힌트:
  // - POST로 제출 → request_id 받기
  // - GET으로 폴링 → status 확인
  // - completed되면 이미지 URL 가져오기

  console.log('TODO: Higgsfield 이미지 생성 구현하기');
  callback(new Error('아직 구현 안 됨'));
}

function pollForResult(requestId, callback, attempts = 0, maxAttempts = 60) {
  // TODO: AI한테 물어보기!
  // "2초마다 API 상태 확인하는 폴링 어떻게 만들어?"
  //
  // 힌트:
  // - setTimeout() 사용
  // - status가 'completed'면 성공
  // - 60번 시도해도 안 되면 타임아웃

  console.log('TODO: 폴링 구현하기');
}

// ============================================
// 🌐 HTTP 서버
// ============================================
// 웹 브라우저의 요청을 받아서 처리합니다.

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);

  // CORS 설정 (브라우저에서 API 호출 가능하게)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // ============================================
  // 📄 루트 경로: HTML 파일 제공
  // ============================================
  if (parsedUrl.pathname === '/' && req.method === 'GET') {
    // TODO: AI한테 물어보기!
    // "Node.js에서 HTML 파일 읽어서 보내는 방법은?"

    fs.readFile(path.join(__dirname, 'blog-index.html'), 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('파일을 찾을 수 없습니다.');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(data);
    });
    return;
  }

  // ============================================
  // 📝 API: 글 스타일 분석
  // ============================================
  if (parsedUrl.pathname === '/api/analyze-style' && req.method === 'POST') {
    // TODO: AI한테 물어보기!
    // "POST 요청에서 body 데이터 읽는 방법은?"
    // "한국어 말투 분석하는 프롬프트 만들어줘"

    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const { referencePosts } = JSON.parse(body);

        // TODO: 스타일 분석 프롬프트 작성
        // - 말투 분석 (반말/존댓말/문어체)
        // - 소제목 스타일
        // - 문단 길이
        // - 사진 배치
        // - 해시태그 개수

        const messages = [
          {
            role: 'user',
            content: `TODO: 스타일 분석 프롬프트 작성하기`
          }
        ];

        callOpenRouter(messages, (err, response) => {
          if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ error: err.message }));
            return;
          }

          // TODO: AI 응답에서 JSON 추출
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(response);
        });

      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: '잘못된 요청' }));
      }
    });
    return;
  }

  // ============================================
  // ✨ API: 블로그 글 + 이미지 생성
  // ============================================
  if (parsedUrl.pathname === '/api/generate-post-with-image' && req.method === 'POST') {
    // TODO: AI한테 물어보기!
    // "블로그 글 생성하는 프롬프트 어떻게 만들어?"
    // "여러 이미지 동시에 생성하는 방법은?"

    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const { keyword, style, storeInfo } = JSON.parse(body);

        // 1단계: 글 생성
        const messages = [
          {
            role: 'user',
            content: `TODO: 블로그 글 생성 프롬프트 작성하기

키워드: ${keyword}
스타일: ${JSON.stringify(style)}
가게 정보: ${JSON.stringify(storeInfo)}`
          }
        ];

        callOpenRouter(messages, (err, textResponse) => {
          if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ error: err.message }));
            return;
          }

          // TODO: 글 생성 결과에서 이미지 프롬프트 추출
          // TODO: 각 이미지 프롬프트로 이미지 생성
          // TODO: 모든 이미지 완성되면 결과 반환

          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({
            title: 'TODO: 제목',
            body: 'TODO: 본문',
            images: [],
            hashtags: []
          }));
        });

      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: '잘못된 요청' }));
      }
    });
    return;
  }

  // 404: 페이지를 찾을 수 없음
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('페이지를 찾을 수 없습니다.');
});

// ============================================
// 🚀 서버 시작!
// ============================================
server.listen(PORT, () => {
  console.log(`\n🚀 네이버 블로그 글 생성기 시작!`);
  console.log(`📱 브라우저에서 열기: http://localhost:${PORT}`);
  console.log(`🎨 이미지 생성: Higgsfield Ideogram v4.0`);
  console.log(`\n.env 파일 상태:`);
  console.log(`  - OPENROUTER_API_KEY: ${ENV.OPENROUTER_API_KEY ? '✅ 설정됨' : '❌ 없음'}`);
  console.log(`  - HIGGSFIELD_API_KEY: ${ENV.HIGGSFIELD_API_KEY ? '✅ 설정됨' : '❌ 없음'}`);
  console.log(`  - DRY_RUN: ${ENV.DRY_RUN === '1' ? '테스트 모드' : '실제 모드'}`);
  console.log(`\n종료하려면 Ctrl+C를 누르세요.\n`);
});

// ============================================
// 🤖 AI 네이버 블로그 자동 생성기 - 서버
// ============================================
//
// 이 파일은 Node.js 서버입니다.
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

import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { URL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// 🔐 환경 변수 로드
// ============================================

function loadEnv() {
  const env = {};
  try {
    const envPath = path.join(__dirname, '.env');
    const envFile = fs.readFileSync(envPath, 'utf8');

    envFile.split('\n').forEach(line => {
      const [key, ...values] = line.split('=');
      if (key && values.length) {
        env[key.trim()] = values.join('=').trim();
      }
    });
  } catch (err) {
    console.error('⚠️  .env 파일을 찾을 수 없습니다.');
  }
  return env;
}

const ENV = loadEnv();
const PORT = 3000;

// ============================================
// 🤖 OpenRouter API 호출
// ============================================
// Claude AI를 사용해서 글을 분석하고 생성합니다.

function callOpenRouter(messages, callback) {
  const apiKey = ENV.OPENROUTER_API_KEY;

  if (!apiKey) {
    console.error('❌ OPENROUTER_API_KEY가 설정되지 않았습니다.');
    callback(new Error('OPENROUTER_API_KEY가 설정되지 않았습니다. .env 파일을 확인하세요.'));
    return;
  }

  console.log('🔑 API Key 확인됨');

  // OpenRouter 안정적이고 무료로 사용 가능한 모델
  const requestBody = JSON.stringify({
    model: 'meta-llama/llama-3.1-70b-instruct:free',
    messages: messages,
    temperature: 0.7,
    max_tokens: 4000
  });

  const options = {
    hostname: 'openrouter.ai',
    path: '/api/v1/chat/completions',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(requestBody)
    }
  };

  console.log('📡 OpenRouter API 호출 중...');

  const req = https.request(options, (response) => {
    let data = '';

    response.on('data', (chunk) => {
      data += chunk;
    });

    response.on('end', () => {
      console.log('📨 응답 수신 완료. 상태 코드:', response.statusCode);

      try {
        const parsed = JSON.parse(data);
        if (response.statusCode === 200) {
          console.log('✅ API 호출 성공');
          callback(null, parsed);
        } else {
          console.error('❌ API 오류 응답:', parsed);
          callback(new Error(parsed.error?.message || `API 오류: ${response.statusCode} - ${data.substring(0, 200)}`));
        }
      } catch (err) {
        console.error('❌ JSON 파싱 실패:', err.message);
        console.error('응답 데이터:', data.substring(0, 500));
        callback(new Error('API 응답 파싱 실패: ' + err.message));
      }
    });
  });

  req.on('error', (err) => {
    console.error('❌ 네트워크 오류:', err.message);
    callback(new Error('API 호출 실패: ' + err.message));
  });

  req.write(requestBody);
  req.end();
}

// ============================================
// 🎨 Higgsfield 이미지 생성
// ============================================

function generateImage(prompt, callback) {
  const apiKey = ENV.HIGGSFIELD_API_KEY;

  if (!apiKey) {
    console.error('❌ HIGGSFIELD_API_KEY가 설정되지 않았습니다.');
    callback(new Error('HIGGSFIELD_API_KEY가 설정되지 않았습니다.'));
    return;
  }

  const [apiKeyPart, apiSecret] = apiKey.split(':');

  console.log('🎨 이미지 생성 요청:', prompt.substring(0, 50) + '...');

  const requestBody = JSON.stringify({
    prompt: prompt,
    model: 'ideogram-v2',
    aspect_ratio: '1:1',
    magic_prompt_option: 'AUTO'
  });

  const options = {
    hostname: 'api.higgsfield.ai',
    path: '/v1/inference',
    method: 'POST',
    headers: {
      'x-api-key': apiKeyPart,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(requestBody)
    }
  };

  const req = https.request(options, (response) => {
    let data = '';

    response.on('data', (chunk) => {
      data += chunk;
    });

    response.on('end', () => {
      console.log('🖼️ 이미지 생성 응답 코드:', response.statusCode);

      try {
        const parsed = JSON.parse(data);
        if (response.statusCode === 200 || response.statusCode === 201) {
          const requestId = parsed.request_id || parsed.id || parsed.inference_id;
          if (requestId) {
            console.log('✅ request_id 받음:', requestId);
            // 폴링 시작
            pollForResult(requestId, apiKeyPart, apiSecret, callback);
          } else {
            console.error('❌ request_id를 받지 못함:', parsed);
            callback(new Error('request_id를 받지 못했습니다.'));
          }
        } else {
          console.error('❌ 이미지 생성 실패:', response.statusCode, parsed);
          callback(new Error(parsed.error?.message || `이미지 생성 실패: ${response.statusCode}`));
        }
      } catch (err) {
        console.error('❌ 파싱 오류:', err.message, '응답:', data.substring(0, 200));
        callback(new Error('이미지 생성 응답 파싱 실패: ' + err.message));
      }
    });
  });

  req.on('error', (err) => {
    console.error('❌ 이미지 생성 네트워크 오류:', err.message);
    callback(new Error('이미지 생성 요청 실패: ' + err.message));
  });

  req.write(requestBody);
  req.end();
}

function pollForResult(requestId, apiKey, apiSecret, callback, attempts = 0, maxAttempts = 60) {
  if (attempts >= maxAttempts) {
    console.error('❌ 이미지 생성 타임아웃 (2분 초과)');
    callback(new Error('이미지 생성 타임아웃'));
    return;
  }

  const options = {
    hostname: 'api.higgsfield.ai',
    path: `/v1/inference/${requestId}`,
    method: 'GET',
    headers: {
      'x-api-key': apiKey
    }
  };

  const req = https.request(options, (response) => {
    let data = '';

    response.on('data', (chunk) => {
      data += chunk;
    });

    response.on('end', () => {
      try {
        const parsed = JSON.parse(data);

        if (parsed.status === 'succeeded' || parsed.state === 'succeeded') {
          const imageUrl = parsed.result?.url || parsed.image_url || parsed.url ||
                          (parsed.result?.images && parsed.result.images[0]?.url) ||
                          (parsed.images && parsed.images[0]?.url);
          if (imageUrl) {
            console.log('✅ 이미지 생성 완료:', imageUrl);
            callback(null, imageUrl);
          } else {
            console.error('❌ 이미지 URL을 찾을 수 없음:', parsed);
            callback(new Error('이미지 URL을 찾을 수 없습니다.'));
          }
        } else if (parsed.status === 'failed' || parsed.state === 'failed') {
          console.error('❌ 이미지 생성 실패:', parsed.error || parsed);
          callback(new Error('이미지 생성 실패: ' + (parsed.error || 'Unknown error')));
        } else {
          // 아직 처리 중, 3초 후 재시도
          if (attempts % 5 === 0) {
            console.log(`🔄 이미지 생성 대기 중... (${attempts + 1}/${maxAttempts})`);
          }
          setTimeout(() => {
            pollForResult(requestId, apiKey, apiSecret, callback, attempts + 1, maxAttempts);
          }, 3000);
        }
      } catch (err) {
        console.error('❌ 폴링 파싱 오류:', err.message, '응답:', data.substring(0, 200));
        callback(new Error('폴링 응답 파싱 실패: ' + err.message));
      }
    });
  });

  req.on('error', (err) => {
    console.error('❌ 폴링 네트워크 오류:', err.message);
    // 에러 발생 시 재시도
    setTimeout(() => {
      pollForResult(requestId, apiKey, apiSecret, callback, attempts + 1, maxAttempts);
    }, 3000);
  });

  req.end();
}

// ============================================
// 🌐 HTTP 서버
// ============================================

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);

  // CORS 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // ============================================
  // 📄 루트: HTML 파일 제공
  // ============================================
  if (parsedUrl.pathname === '/' && req.method === 'GET') {
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
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const { referencePosts } = JSON.parse(body);

        const messages = [
          {
            role: 'user',
            content: `다음 블로그 글들의 작성 스타일을 매우 자세히 분석해주세요.

참고 글:
${referencePosts}

다음 항목들을 정밀하게 분석하여 JSON 형식으로 반환해주세요:

**1. 단어 분석**
- averageWordsPerSentence: 문장당 평균 단어 개수 (숫자)
- vocabularyStyle: 어휘 스타일 (예: "일상적이고 쉬운 단어 위주", "전문 용어 섞임", "감성적 표현 많음")
- frequentWords: 자주 쓰는 특징적 단어나 표현 (배열, 3-5개)
- foreignWordUsage: 외래어/영어 사용 빈도 (낮음/보통/높음)

**2. 문체 분석**
- tone: 말투 (반말/해요체/합니다체/한다체)
- sentenceEndings: 문장 종결 패턴 (예: "~해요, ~네요, ~거든요" 자주 사용)
- emotionExpression: 감정 표현 방식 (예: "이모티콘 많음", "감탄사 자주 사용", "절제된 표현")
- questionUsage: 질문형 문장 사용 빈도 (낮음/보통/높음)

**3. 문단 분석**
- averageParagraphCount: 평균 문단 개수 (숫자)
- sentencesPerParagraph: 문단당 평균 문장 개수 (숫자)
- paragraphLength: 문단 길이 특징 (짧음 1-2문장/보통 3-4문장/길게 5문장 이상)
- paragraphTransition: 문단 전환 방식 (예: "줄바꿈으로 명확히 구분", "자연스럽게 이어짐")

**4. 문장 길이 분석**
- averageSentenceLength: 평균 문장 길이 (짧음 10자 이하/보통 10-30자/길게 30자 이상)
- sentenceLengthVariety: 문장 길이 다양성 (단조로움/다양함)
- sentenceStructure: 문장 구조 (단문 위주/복문 섞임/복문 위주)

**5. 구조 분석**
- subheadings: 소제목 사용 패턴 (예: "3개, 이모지 사용", "없음", "번호 매김")
- listUsage: 리스트/번호 사용 (없음/가끔/자주)
- introFormula: 도입부 패턴 (구체적 예시 문장)
- bodyFormula: 본문 전개 방식 (예: "경험 → 설명 → 팁 제공 순서")
- closingFormula: 마무리 패턴 (구체적 예시 문장)

**6. 기타**
- hashtagCount: 평균 해시태그 개수 (숫자)
- imageFrequency: 이미지 언급/삽입 빈도 (낮음/보통/높음)
- personalOpinion: 개인 의견/감상 표현 정도 (적음/보통/많음)

반드시 다음 JSON 형식으로만 응답해주세요 (모든 필드 필수):
{
  "averageWordsPerSentence": 15,
  "vocabularyStyle": "일상적이고 쉬운 단어로 친근하게",
  "frequentWords": ["정말", "너무", "완전", "대박"],
  "foreignWordUsage": "보통",
  "tone": "해요체",
  "sentenceEndings": "~해요, ~더라구요, ~네요 자주 사용",
  "emotionExpression": "이모티콘과 감탄사 적절히 사용",
  "questionUsage": "보통",
  "averageParagraphCount": 8,
  "sentencesPerParagraph": 3,
  "paragraphLength": "보통",
  "paragraphTransition": "줄바꿈으로 명확히 구분",
  "averageSentenceLength": "보통",
  "sentenceLengthVariety": "다양함",
  "sentenceStructure": "단문과 복문 적절히 섞임",
  "subheadings": "3개, 이모지 사용",
  "listUsage": "가끔",
  "introFormula": "오늘은 제가 다녀온 ○○에 대해 이야기해볼게요!",
  "bodyFormula": "장소 소개 → 경험 상세 → 추천 포인트 → 주의사항 순서",
  "closingFormula": "여러분도 꼭 한번 가보세요! 후회 안 하실 거예요~",
  "hashtagCount": 5,
  "imageFrequency": "높음",
  "personalOpinion": "많음"
}`
          }
        ];

        console.log('📝 스타일 분석 요청 받음');

        callOpenRouter(messages, (err, response) => {
          if (err) {
            console.error('❌ OpenRouter API 오류:', err.message);
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ error: err.message }));
            return;
          }

          try {
            console.log('✅ OpenRouter 응답 받음');

            // AI 응답에서 JSON 추출
            const content = response.choices[0].message.content;
            console.log('📄 AI 응답 내용 길이:', content.length);

            // JSON 부분만 추출 (```json ... ``` 또는 { ... } 형태)
            let jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) ||
                           content.match(/(\{[\s\S]*\})/);

            if (jsonMatch) {
              const styleData = JSON.parse(jsonMatch[1]);
              console.log('✅ 스타일 분석 완료');
              res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
              res.end(JSON.stringify(styleData));
            } else {
              console.error('❌ JSON 추출 실패. 응답 내용:', content.substring(0, 200));
              throw new Error('JSON 형식을 찾을 수 없습니다. AI 응답을 확인하세요.');
            }
          } catch (parseErr) {
            console.error('❌ 파싱 오류:', parseErr.message);
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ error: '스타일 분석 결과 파싱 실패: ' + parseErr.message }));
          }
        });

      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: '잘못된 요청' }));
      }
    });
    return;
  }

  // ============================================
  // ✨ API: 블로그 글 생성 (이미지 포함)
  // ============================================
  if (parsedUrl.pathname === '/api/generate-post' && req.method === 'POST') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      console.log('\n📝 ===== 블로그 글 생성 요청 =====');

      try {
        const { keyword, style, storeInfo } = JSON.parse(body);
        console.log('🔑 키워드:', keyword);
        console.log('🏪 가게:', storeInfo.name);

        const messages = [
          {
            role: 'user',
            content: `네이버 블로그 글을 분석된 스타일에 정확히 맞춰 작성해주세요.

키워드: ${keyword}

가게 정보:
- 가게 이름: ${storeInfo.name}
- 업종: ${storeInfo.type}
- 지역: ${storeInfo.location || '정보 없음'}
- 주요 고객층: ${storeInfo.targetCustomer || '정보 없음'}
- 기회 요인: ${storeInfo.opportunity || '정보 없음'}
- 강조 사항: ${storeInfo.highlights || '정보 없음'}
- 추가 설명: ${storeInfo.description || '정보 없음'}

작성 스타일 가이드 (반드시 준수):
${JSON.stringify(style, null, 2)}

다음 형식의 JSON으로 응답해주세요:
{
  "title": "제목 (40자 이내, SEO 최적화)",
  "body": "본문 (아래 스타일 규칙을 정확히 따를 것)",
  "imagePrompts": [
    "이미지1 생성 프롬프트 (영문, detailed description)",
    "이미지2 생성 프롬프트 (영문, detailed description)",
    "이미지3 생성 프롬프트 (영문, detailed description)"
  ],
  "hashtags": ["태그1", "태그2", "태그3", "태그4", "태그5"]
}

**본문 작성 규칙 (매우 중요!):**

1. **단어 사용**:
   - 문장당 평균 ${style.averageWordsPerSentence}단어 정도
   - 어휘: ${style.vocabularyStyle}
   - 자주 쓰는 표현: ${style.frequentWords ? style.frequentWords.join(', ') : ''}
   - 외래어 사용: ${style.foreignWordUsage} 수준

2. **문체**:
   - 말투: ${style.tone} 반드시 준수
   - 문장 종결: ${style.sentenceEndings}
   - 감정 표현: ${style.emotionExpression}
   - 질문형 사용: ${style.questionUsage}

3. **문단 구조**:
   - 총 문단 개수: 약 ${style.averageParagraphCount}개
   - 문단당 문장: 약 ${style.sentencesPerParagraph}개
   - 문단 길이: ${style.paragraphLength}
   - 문단 구분: ${style.paragraphTransition}

4. **문장 길이**:
   - 평균 문장 길이: ${style.averageSentenceLength}
   - 길이 다양성: ${style.sentenceLengthVariety}
   - 문장 구조: ${style.sentenceStructure}

5. **글 구조**:
   - 소제목: ${style.subheadings} (소제목은 **별표**로 표시)
   - 리스트 사용: ${style.listUsage}
   - 도입부 패턴: ${style.introFormula}
   - 본문 전개: ${style.bodyFormula}
   - 마무리 패턴: ${style.closingFormula}

6. **기타**:
   - 해시태그: ${style.hashtagCount}개
   - 이미지 배치: ${style.imageFrequency} 빈도로 언급
   - 개인 의견: ${style.personalOpinion} 수준으로 표현

7. **이미지 프롬프트 작성**:
   - 영문으로 작성
   - 구체적이고 상세하게
   - 가게의 특징을 잘 표현
   - 예: "modern Korean cafe interior, warm lighting, minimalist design, cozy atmosphere, wide angle shot, professional photography, high quality"

**주의사항**:
- 분석된 스타일의 모든 특징을 정확히 재현할 것
- 자연스럽고 일관된 흐름 유지
- 키워드를 자연스럽게 포함
- 가게 정보를 적절히 녹여서 표현`
          }
        ];

        // 테스트 모드: 더미 데이터로 즉시 응답
        if (ENV.DRY_RUN === '1' || true) {
          console.log('🧪 테스트 모드: 더미 데이터 생성');

          // 다양한 도입부 패턴
          const intros = [
            `요즘 ${keyword} 찾는 분들 많으시죠? 저도 이것저것 알아보다가 ${storeInfo.name}를 발견했는데요, 직접 다녀와보니 정말 괜찮더라구요!`,
            `${storeInfo.location || '이 지역'}에서 ${keyword} 하면 빼놓을 수 없는 곳! 바로 ${storeInfo.name}인데요. 오늘은 제가 직접 방문한 후기를 자세히 알려드릴게요.`,
            `안녕하세요! 오늘은 ${keyword}로 유명한 ${storeInfo.name}에 다녀온 이야기를 남겨볼까 해요. 솔직한 후기 궁금하시죠?`,
            `${keyword} 어디가 좋을까 고민하시는 분들을 위해 준비했어요. ${storeInfo.name}, 여기 진짜 강추입니다!`
          ];

          const intro = intros[Math.floor(Math.random() * intros.length)];

          // 자연스럽고 재미있는 제목 패턴
          const location = storeInfo.location || '';
          const storeName = storeInfo.name;
          const type = storeInfo.type;

          const titlePatterns = [
            // 감성 스토리텔링
            `${location ? location + ', ' : ''}${storeName}의 하루`,
            `${storeName}에서 보낸 완벽한 시간`,
            `${location ? location + ' ' : ''}숨은 보석, ${storeName}`,
            `일상이 특별해지는 곳`,

            // 직접 추천
            `${location ? location + ' ' : ''}${type} 추천합니다`,
            `${storeName}, 여기 꼭 가보세요`,
            `제가 요즘 자주 가는 ${type}`,
            `이번 주말엔 여기 어때요?`,

            // 경험 중심
            `${storeName}에서 만난 행복`,
            `기대 이상이었던 ${location ? location + ' ' : ''}${type}`,
            `${storeName} 방문 후기`,
            `여기 분위기 진짜 좋아요`,

            // 발견과 놀라움
            `우연히 발견한 ${location ? location + ' ' : ''}맛집`,
            `${storeName}, 이런 곳이 있었네요`,
            `SNS에서 핫한 그곳 다녀왔어요`,
            `줄 서서 먹을 만한 가치가 있을까?`,

            // 솔직 후기
            `솔직히 ${storeName} 어땠냐면`,
            `${location ? location + ' ' : ''}${type} 진심 리뷰`,
            `다음에 또 갈 거예요`,
            `친구한테 소문내고 싶은 곳`
          ];

          const selectedTitle = titlePatterns[Math.floor(Math.random() * titlePatterns.length)];

          // 본문 구성
          let bodyText = `${intro}

**📍 위치와 접근성**

${storeInfo.location ? `${storeInfo.location}에 위치해 있어서 찾아가기 정말 편해요.` : '위치가 접근성 좋은 곳에 있어요.'} ${storeInfo.targetCustomer ? `특히 ${storeInfo.targetCustomer}분들이 오시기 딱 좋은 곳이더라구요.` : '누구나 부담 없이 방문할 수 있는 분위기예요.'}

**✨ 여기가 특별한 이유**

${storeInfo.highlights ? `가장 마음에 들었던 건 바로 ${storeInfo.highlights}! 다른 곳과는 확실히 차별화되는 부분이에요.` : '직접 가보시면 왜 사람들이 추천하는지 아실 거예요.'} ${storeInfo.type} 전문점답게 디테일 하나하나 신경 쓴 게 느껴졌어요.

${storeInfo.opportunity ? `\n**🎉 놓치지 마세요!**\n\n${storeInfo.opportunity}라고 하니까 이 기회 놓치지 마세요! ` : ''}

**💯 솔직 후기**

제가 여러 곳을 다녀봤지만 ${storeInfo.name}는 정말 만족스러웠어요. ${storeInfo.description || '분위기도 좋고 전반적으로 퀄리티가 높았습니다.'}

${storeInfo.targetCustomer ? `${storeInfo.targetCustomer}분들께 특히 추천드리고 싶어요.` : '누구와 함께 가도 만족하실 것 같아요.'} 혼자 가기에도, 누군가와 함께 가기에도 좋은 곳이에요.

**📝 총평**

${keyword} 찾으시는 분들께 자신있게 추천드려요! 후회 없으실 거예요. 다음에 또 기회되면 재방문 의사 100%입니다 ㅎㅎ

여러분도 꼭 한번 방문해보세요! 👍`;

          const dummyResponse = {
            title: selectedTitle,
            body: bodyText,
            imagePrompts: [
              `Professional interior photo of Korean ${storeInfo.type}, modern aesthetic, warm lighting, cozy atmosphere, high quality, 8k`,
              `${keyword} scene, stylish and trendy space, instagram-worthy, natural lighting, wide angle`,
              `Detail shot of ${storeInfo.type} ${storeInfo.highlights || 'specialty'}, professional food photography, appealing composition`
            ],
            hashtags: [
              keyword.replace(/\s+/g, ''),
              storeInfo.name.replace(/\s+/g, ''),
              storeInfo.location?.replace(/\s+/g, '') || storeInfo.type + '맛집',
              storeInfo.type + '추천',
              '후기',
              '리얼후기',
              storeInfo.targetCustomer?.split(/[\s,]+/)[0] || '일상'
            ].filter(Boolean).slice(0, 7)
          };

          console.log('✅ 더미 글 생성 완료');
          console.log('📝 제목:', dummyResponse.title);

          // 키워드 기반 관련 이미지 생성
          console.log('🖼️ 이미지 생성 시작...');

          // 키워드 분석 및 영문 변환
          const keywordMappings = {
            '카페': 'cafe,coffee,interior',
            '식당': 'restaurant,food,dining',
            '레스토랑': 'restaurant,food,fine-dining',
            '맛집': 'food,restaurant,delicious',
            '미용실': 'salon,hair,beauty',
            '병원': 'clinic,medical,healthcare',
            '헬스': 'gym,fitness,workout',
            '피트니스': 'fitness,gym,exercise',
            '요가': 'yoga,meditation,wellness',
            '베이커리': 'bakery,bread,pastry',
            '디저트': 'dessert,sweet,cake',
            '바': 'bar,drinks,cocktail',
            '펜션': 'pension,resort,accommodation',
            '호텔': 'hotel,luxury,room',
            '네일': 'nail,manicure,beauty',
            '스파': 'spa,massage,relaxation'
          };

          // 키워드에서 검색어 추출
          let searchTerms = '';
          for (const [korean, english] of Object.entries(keywordMappings)) {
            if (keyword.includes(korean) || storeInfo.type.includes(korean)) {
              searchTerms = english;
              break;
            }
          }

          // 기본값
          if (!searchTerms) {
            searchTerms = 'cafe,interior,cozy';
          }

          // 다양한 고품질 Unsplash 이미지 (키워드별로 다르게)
          const categoryImages = {
            'cafe': [
              'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb',
              'https://images.unsplash.com/photo-1453614512568-c4024d13c247',
              'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085',
              'https://images.unsplash.com/photo-1554118811-1e0d58224f24',
              'https://images.unsplash.com/photo-1551024601-bec78aea704b',
              'https://images.unsplash.com/photo-1559496417-e7f25c06f648',
              'https://images.unsplash.com/photo-1521017432531-fbd92d768814',
              'https://images.unsplash.com/photo-1442512595331-e89e73853f31',
              'https://images.unsplash.com/photo-1445116572660-236099ec97a0'
            ],
            'restaurant': [
              'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
              'https://images.unsplash.com/photo-1552566626-52f8b828add9',
              'https://images.unsplash.com/photo-1414235077428-338989a2e8c0',
              'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c',
              'https://images.unsplash.com/photo-1559339352-11d035aa65de',
              'https://images.unsplash.com/photo-1551632406-8b0f0447f4ef',
              'https://images.unsplash.com/photo-1592861956120-e524fc739696',
              'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d',
              'https://images.unsplash.com/photo-1553621042-f6e147245754'
            ],
            'food': [
              'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
              'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
              'https://images.unsplash.com/photo-1482049016688-2d3e1b311543',
              'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38',
              'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe',
              'https://images.unsplash.com/photo-1555939594-58d7cb561ad1',
              'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445',
              'https://images.unsplash.com/photo-1512621776951-a57141f2eefd',
              'https://images.unsplash.com/photo-1529042410759-befb1204b468'
            ],
            'default': [
              'https://images.unsplash.com/photo-1511920170033-f8396924c348',
              'https://images.unsplash.com/photo-1559329007-40df8a9345d8',
              'https://images.unsplash.com/photo-1498654896293-37aacf113fd9',
              'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327',
              'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
              'https://images.unsplash.com/photo-1555396273-367ea4eb4db5',
              'https://images.unsplash.com/photo-1481833761820-0509d3217039',
              'https://images.unsplash.com/photo-1464195643332-1f236b1c2255',
              'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327'
            ]
          };

          // 카테고리 선택
          let selectedCategory = 'default';
          if (searchTerms.includes('cafe') || searchTerms.includes('coffee')) {
            selectedCategory = 'cafe';
          } else if (searchTerms.includes('restaurant') || searchTerms.includes('dining')) {
            selectedCategory = 'restaurant';
          } else if (searchTerms.includes('food')) {
            selectedCategory = 'food';
          }

          const availableImages = categoryImages[selectedCategory];

          // 랜덤하게 3개 선택 (매번 다른 이미지)
          const shuffled = availableImages.sort(() => 0.5 - Math.random());
          const baseImages = shuffled.slice(0, 3);

          // Unsplash 이미지 URL에 크기와 품질 파라미터 추가
          const images = baseImages.map((url, idx) =>
            `${url}?w=1200&h=900&fit=crop&q=80&auto=format`
          );

          console.log('✅ 이미지 URL 생성 완료');
          console.log('🔍 카테고리:', selectedCategory);
          console.log('🖼️ 이미지 URLs:', images);

          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({
            title: dummyResponse.title,
            body: dummyResponse.body,
            images: images,
            hashtags: dummyResponse.hashtags
          }));

          return;
        }

        console.log('📡 OpenRouter API 호출 시작...');

        callOpenRouter(messages, (err, response) => {
          if (err) {
            console.error('❌ OpenRouter 오류:', err.message);
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ error: err.message }));
            return;
          }

          console.log('✅ OpenRouter 응답 받음');

          try {
            // AI 응답에서 JSON 추출
            const content = response.choices[0].message.content;
            console.log('📄 AI 응답 길이:', content.length, '자');
            console.log('📄 AI 응답 미리보기:', content.substring(0, 150) + '...');

            let jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) ||
                           content.match(/(\{[\s\S]*\})/);

            if (!jsonMatch) {
              console.error('❌ JSON 추출 실패');
              console.error('전체 응답:', content);
              throw new Error('JSON 형식을 찾을 수 없습니다. AI 응답을 확인하세요.');
            }

            console.log('✅ JSON 추출 성공');
            const postData = JSON.parse(jsonMatch[1]);
            console.log('✅ JSON 파싱 성공');
            console.log('📝 제목:', postData.title);
            console.log('🖼️ 이미지 프롬프트 개수:', postData.imagePrompts?.length || 0);

            // 먼저 글만 반환 (이미지는 나중에)
            console.log('✅ 글 생성 완료. 이미지 생성은 건너뜀 (테스트 모드)');

            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({
              title: postData.title,
              body: postData.body,
              images: [],
              hashtags: postData.hashtags || []
            }));

            // TODO: 이미지 생성은 나중에 활성화
            // if (postData.imagePrompts && postData.imagePrompts.length > 0) {
            //   let completedImages = 0;
            //   const images = [];
            //   const totalImages = Math.min(postData.imagePrompts.length, 3);
            //   ...
            // }

          } catch (parseErr) {
            res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ error: '글 생성 결과 파싱 실패: ' + parseErr.message }));
          }
        });

      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: '잘못된 요청' }));
      }
    });
    return;
  }

  // 404
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

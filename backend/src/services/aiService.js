const https = require('https');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// ── Mock response (no API key configured) ─────────────────────────────────────
const MOCK_RESPONSE = {
  bugs: [
    {
      line: 6,
      severity: 'warning',
      description: 'Off-by-one error: condition `i <= arr.length` accesses out-of-bounds index',
      fix: 'for (let i = 0; i < arr.length; i++)',
      why: 'Array indices are 0-based; arr[arr.length] is undefined. This causes undefined comparisons in the inner loop.',
    },
    {
      line: 8,
      severity: 'warning',
      description: 'Loose equality `==` instead of strict `===` causes type coercion bugs',
      fix: 'if (arr[i] === arr[j])',
      why: 'Loose equality coerces types before comparing — "1" == 1 is true. Strict equality prevents silent type-mismatch bugs.',
    },
  ],
  improvements: [
    {
      line: 2,
      severity: 'info',
      description: '`var` should be `const` for block-scoped immutable binding',
      fix: 'const duplicates = [];',
      why: '`var` is function-scoped and hoisted, leading to surprising bugs. `const`/`let` give predictable block scope.',
    },
  ],
  optimizations: [
    {
      line: 5,
      severity: 'warning',
      description: 'O(n²) nested loop — can be reduced to O(n) using a Set',
      fix: `function findDuplicates(arr) {
  const seen = new Set();
  const duplicates = new Set();
  for (const item of arr) {
    if (seen.has(item)) duplicates.add(item);
    else seen.add(item);
  }
  return [...duplicates];
}`,
      why: 'Nested loops compare every pair, growing quadratically. A Set lookup is O(1), making the whole function O(n).',
    },
  ],
  security_issues: [],
  score: 4.5,
  improved_code: `function findDuplicates(arr) {
  const seen = new Set();
  const duplicates = new Set();
  for (const item of arr) {
    if (seen.has(item)) duplicates.add(item);
    else seen.add(item);
  }
  return [...duplicates];
}`,
  summary:
    'Demo mode — add GEMINI_API_KEY to backend/.env for real analysis. The code has an off-by-one bug, O(n²) complexity, loose equality, and uses outdated var declarations.',
};

// ── Model fallback chain ─────────────────────────────────────────────────────
// v1beta endpoint — confirmed working model IDs for free API keys
const MODEL_CHAIN = [
  'gemini-2.0-flash',       // Primary: best for code tasks
  'gemini-2.0-flash-lite',  // Fallback: higher free RPM limit
];


const GEMINI_ENDPOINT = 'generativelanguage.googleapis.com';
const GEMINI_API_VERSION = 'v1beta'; // Free-tier keys use v1beta

// ── Direct HTTPS call to Gemini REST API v1 ───────────────────────────────────
function callGeminiAPI(modelName, prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        maxOutputTokens: 8192,
      },
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/${GEMINI_API_VERSION}/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);

          if (res.statusCode !== 200) {
            const errMsg = json?.error?.message || `HTTP ${res.statusCode}`;
            const err = new Error(`[${res.statusCode}] ${errMsg}`);
            err.statusCode = res.statusCode;
            return reject(err);
          }

          const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!text) {
            return reject(new Error('Empty response from Gemini'));
          }

          resolve(text);
        } catch (e) {
          reject(new Error(`Response parse error: ${e.message}`));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(55000, () => {
      req.destroy(new Error('Request timeout after 55s'));
    });

    req.write(body);
    req.end();
  });
}

// ── Prompt engineering ─────────────────────────────────────────────────────────
function buildPrompt(code, language) {
  return `You are a senior software engineer and security expert with 15+ years of experience.

Perform a DEEP, PRECISE code review of the following ${language} code.

Analyze strictly for:
1. Bugs - logical errors, null refs, off-by-one, race conditions, unhandled exceptions
2. Improvements - readability, naming, DRY violations, SOLID principles, code structure
3. Optimizations - algorithmic complexity, memory usage, redundant operations, caching
4. Security Issues - SQL injection, XSS, hardcoded secrets, insecure random, path traversal

For EACH issue provide:
- line: exact line number (integer) or null if general
- severity: "critical" | "warning" | "info"
- description: precise, specific description (NOT generic)
- fix: concrete corrected code snippet or specific action
- why: 1-2 sentence learning explanation of WHY this is a problem

Scoring (0-10):
9-10: Production ready, exemplary
7-8: Good code, minor issues
5-6: Functional but needs improvement
3-4: Several significant issues
0-2: Critical problems, major refactor needed

CODE TO REVIEW (${language}):
\`\`\`${language}
${code}
\`\`\`

CRITICAL: Return ONLY valid JSON with no markdown code fences, no comments, no text outside the JSON object:
{"bugs":[{"line":null,"severity":"critical","description":"...","fix":"...","why":"..."}],"improvements":[{"line":null,"severity":"info","description":"...","fix":"...","why":"..."}],"optimizations":[{"line":null,"severity":"warning","description":"...","fix":"...","why":"..."}],"security_issues":[{"line":null,"severity":"critical","description":"...","fix":"...","why":"..."}],"score":7.5,"improved_code":"...","summary":"..."}`;
}

function parseResponse(text, code) {
  // Strip any accidental markdown fences
  const cleaned = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  const parsed = JSON.parse(cleaned);
  return {
    bugs: Array.isArray(parsed.bugs) ? parsed.bugs : [],
    improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
    optimizations: Array.isArray(parsed.optimizations) ? parsed.optimizations : [],
    security_issues: Array.isArray(parsed.security_issues) ? parsed.security_issues : [],
    score: typeof parsed.score === 'number' ? Math.min(10, Math.max(0, parsed.score)) : 5,
    improved_code: parsed.improved_code || code,
    summary: parsed.summary || 'Review completed.',
  };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function isRetryable(err) {
  const msg = String(err?.message || '');
  const code = err?.statusCode;
  return (
    code === 429 || code === 503 || code === 404 ||
    msg.includes('429') ||
    msg.includes('quota') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('Too Many Requests') ||
    msg.includes('503') ||
    msg.includes('overloaded') ||
    msg.includes('404') ||
    msg.includes('timeout')
  );
}

// ── Main review function ─────────────────────────────────────────────────────
async function reviewCode(code, language) {
  if (!GEMINI_API_KEY) {
    console.warn('[aiService] No GEMINI_API_KEY — returning demo data');
    return MOCK_RESPONSE;
  }

  const prompt = buildPrompt(code, language);
  let lastError = null;

  for (let i = 0; i < MODEL_CHAIN.length; i++) {
    const modelName = MODEL_CHAIN[i];
    try {
      console.log(`[aiService] Trying ${modelName}...`);
      const text = await callGeminiAPI(modelName, prompt);
      const result = parseResponse(text, code);
      console.log(`[aiService] ✅ ${modelName} succeeded`);
      return { ...result, model_used: modelName };
    } catch (err) {
      lastError = err;
      const msg = String(err?.message || '');
      console.warn(`[aiService] ${modelName} failed: ${msg.slice(0, 100)}`);

      if (isRetryable(err)) {
        // Small pause before next model to be kind to rate limits
        if (i < MODEL_CHAIN.length - 1) await sleep(1000);
        continue; // try next model immediately — no retries within same model
      }

      // JSON parse error or truly fatal — do not try other models
      throw new Error(`AI review failed: ${msg}`);
    }
  }

  // All models failed
  const lastMsg = String(lastError?.message || '');
  const isQuota =
    lastMsg.includes('429') ||
    lastMsg.includes('quota') ||
    lastMsg.includes('RESOURCE_EXHAUSTED');

  if (isQuota) {
    throw new Error(
      'Gemini API free tier quota exceeded. The free tier allows 15 requests/min. Wait ~60 seconds and try again.'
    );
  }

  throw new Error(`AI review failed: ${lastMsg || 'All models unavailable'}`);
}

module.exports = { reviewCode };

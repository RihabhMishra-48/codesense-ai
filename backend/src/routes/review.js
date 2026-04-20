const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { reviewCode } = require('../services/aiService');
const { runESLint } = require('../services/eslintService');
const { analyzeAST } = require('../services/astService');
const db = require('../db/database');

const JS_LANGUAGES = ['javascript', 'typescript', 'js', 'ts'];

router.post('/', async (req, res) => {
  const { code, language = 'javascript', userId } = req.body;
  const demoMode = req.query.demo === 'true';

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'code is required and must be a string' });
  }

  if (code.length > 50000) {
    return res.status(413).json({ error: 'Code too large (max 50,000 characters)' });
  }

  const lang = language.toLowerCase().trim();
  const isJS = JS_LANGUAGES.includes(lang);

  try {
    // Demo mode — skip AI, use ESLint + AST + mock score only
    if (demoMode) {
      const eslintIssues = isJS ? runESLint(code) : [];
      const astIssues = isJS ? analyzeAST(code) : [];
      const allIssues = [...eslintIssues, ...astIssues];

      const result = {
        bugs: allIssues.filter((i) => i.severity === 'critical'),
        improvements: allIssues.filter((i) => i.severity === 'warning' || i.severity === 'info'),
        optimizations: [],
        security_issues: [],
        score: Math.max(2, 8 - allIssues.filter((i) => i.severity === 'critical').length * 1.5 - allIssues.filter((i) => i.severity === 'warning').length * 0.5),
        improved_code: code,
        summary: `Static analysis (ESLint + AST) found ${allIssues.length} issue(s). Enable AI review for full Gemini-powered deep analysis.`,
        language: lang,
        timestamp: new Date().toISOString(),
        reviewId: uuidv4(),
        demo: true,
      };

      return res.json({ success: true, data: result });
    }

    // Full AI + static analysis
    const [aiResult, eslintIssues, astIssues] = await Promise.all([
      reviewCode(code, lang),
      isJS ? Promise.resolve(runESLint(code)) : Promise.resolve([]),
      isJS ? Promise.resolve(analyzeAST(code)) : Promise.resolve([]),
    ]);

    // Merge ESLint + AST issues into bugs/improvements
    const staticBugs = [...eslintIssues, ...astIssues].filter((i) =>
      ['critical', 'error'].includes(i.severity)
    );
    const staticImprovements = [...eslintIssues, ...astIssues].filter(
      (i) => i.severity === 'warning' || i.severity === 'info'
    );

    const result = {
      ...aiResult,
      bugs: [...aiResult.bugs, ...staticBugs],
      improvements: [...aiResult.improvements, ...staticImprovements],
      language: lang,
      timestamp: new Date().toISOString(),
      reviewId: uuidv4(),
    };

    // Persist if user is authenticated
    if (userId) {
      try {
        const reviewId = uuidv4();
        db.prepare(
          'INSERT INTO reviews (id, user_id, language, code, result, score) VALUES (?, ?, ?, ?, ?, ?)'
        ).run(reviewId, userId, lang, code, JSON.stringify(result), result.score);

        // Update user stats
        db.prepare(
          `UPDATE users SET 
            total_reviews = total_reviews + 1, 
            avg_score = (avg_score * total_reviews + ?) / (total_reviews + 1)
          WHERE id = ?`
        ).run(result.score, userId);
      } catch (dbErr) {
        console.warn('[review route] DB save failed:', dbErr.message);
      }
    }

    res.json({ success: true, data: result });
  } catch (err) {
    console.error('[review route] Error:', err.message);
    res.status(500).json({ error: err.message || 'Review failed. Please try again.' });
  }
});

module.exports = router;

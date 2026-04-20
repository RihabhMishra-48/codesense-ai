const { Linter } = require('eslint');

const linter = new Linter();

// ESLint rules config
const ESLINT_CONFIG = {
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    globals: {
      console: 'readonly',
      process: 'readonly',
      require: 'readonly',
      module: 'readonly',
      exports: 'readonly',
      __dirname: 'readonly',
      __filename: 'readonly',
      setTimeout: 'readonly',
      setInterval: 'readonly',
      clearTimeout: 'readonly',
      clearInterval: 'readonly',
      Promise: 'readonly',
      Map: 'readonly',
      Set: 'readonly',
      JSON: 'readonly',
      Math: 'readonly',
      window: 'readonly',
      document: 'readonly',
      fetch: 'readonly',
    },
  },
  rules: {
    'no-unused-vars': 'warn',
    'no-undef': 'error',
    'no-eval': 'error',
    'no-implied-eval': 'error',
    eqeqeq: 'warn',
    'no-var': 'warn',
    'prefer-const': 'warn',
    'no-console': 'off',
    'no-debugger': 'error',
    'no-alert': 'warn',
    'no-with': 'error',
    'no-new-func': 'error',
    'no-proto': 'error',
    'no-iterator': 'error',
    'no-empty': 'warn',
    'no-duplicate-case': 'error',
    'no-unreachable': 'error',
    'no-constant-condition': 'warn',
    'no-self-compare': 'error',
    'no-throw-literal': 'warn',
  },
};

const SEVERITY_MAP = { 0: null, 1: 'warning', 2: 'critical' };

function runESLint(code) {
  try {
    const messages = linter.verify(code, ESLINT_CONFIG, { filename: 'code.js' });
    return messages
      .filter((m) => m.severity > 0)
      .map((m) => ({
        line: m.line || null,
        severity: SEVERITY_MAP[m.severity] || 'warning',
        description: `[ESLint] ${m.message} (rule: ${m.ruleId})`,
        fix: m.fix ? code.slice(m.fix.range[0], m.fix.range[1]) : 'See rule documentation',
        why: getESLintRuleExplanation(m.ruleId),
        source: 'eslint',
      }));
  } catch (err) {
    console.warn('[eslintService] Parse error:', err.message);
    return [];
  }
}

function getESLintRuleExplanation(ruleId) {
  const explanations = {
    'no-unused-vars': 'Unused variables bloat memory and indicate dead code paths.',
    'no-undef': 'Using undefined variables causes ReferenceError at runtime.',
    'no-eval': 'eval() executes arbitrary code, creating severe security vulnerabilities.',
    'no-implied-eval': 'setTimeout with strings behaves like eval — major security risk.',
    eqeqeq: 'Loose equality (==) causes unexpected type coercions; use === for predictability.',
    'no-var': 'var has function scope and hoisting issues; prefer let/const for block scope.',
    'prefer-const': 'const prevents accidental reassignment and signals immutable intent.',
    'no-debugger': 'debugger statements must be removed before production deployment.',
    'no-unreachable': 'Unreachable code is dead code that confuses readers and tools.',
    'no-duplicate-case': 'Duplicate case labels in switch make one case always shadowed.',
    'no-self-compare': 'Comparing a value to itself is always true/false — likely a bug.',
    'no-empty': 'Empty blocks may indicate forgotten implementation or error swallowing.',
    'no-new-func': 'new Function() is similar to eval() — avoidable security risk.',
    'no-with': 'with statement creates unpredictable scope resolution and is banned in strict mode.',
    'no-throw-literal': 'Only Error objects should be thrown; literals skip stack trace info.',
  };
  return explanations[ruleId] || `Violates ESLint rule: ${ruleId}. See eslint.org/rules/${ruleId}.`;
}

module.exports = { runESLint };

const acorn = require('acorn');

function analyzeAST(code) {
  const issues = [];

  try {
    const ast = acorn.parse(code, {
      ecmaVersion: 2022,
      sourceType: 'module',
      locations: true,
      ranges: true,
      tolerant: true,
    });

    walkNode(ast, issues, { depth: 0, inLoop: false, functionDepth: 0 });
  } catch (err) {
    // Not parseable JS — skip
  }

  return issues;
}

function walkNode(node, issues, ctx) {
  if (!node || typeof node !== 'object') return;

  const newCtx = { ...ctx };

  switch (node.type) {
    case 'FunctionDeclaration':
    case 'FunctionExpression':
    case 'ArrowFunctionExpression':
      newCtx.functionDepth = ctx.functionDepth + 1;
      if (newCtx.functionDepth > 4) {
        issues.push({
          line: node.loc?.start?.line || null,
          severity: 'warning',
          description: '[AST] Deeply nested function (depth > 4) — consider extracting logic',
          fix: 'Extract inner functions into separate named functions',
          why: 'Deep nesting increases cognitive complexity and makes code harder to test and understand.',
          source: 'ast',
        });
      }
      break;

    case 'IfStatement':
      newCtx.depth = ctx.depth + 1;
      if (newCtx.depth > 4) {
        issues.push({
          line: node.loc?.start?.line || null,
          severity: 'warning',
          description: '[AST] Deeply nested conditionals (depth > 4) — consider early returns or guard clauses',
          fix: 'Use early return pattern or extract conditions into helper functions',
          why: 'Deep nesting creates hard-to-follow control flow and high cyclomatic complexity.',
          source: 'ast',
        });
      }
      break;

    case 'ForStatement':
    case 'WhileStatement':
    case 'DoWhileStatement':
      if (ctx.inLoop) {
        issues.push({
          line: node.loc?.start?.line || null,
          severity: 'warning',
          description: '[AST] Nested loop detected — O(n²) or worse complexity risk',
          fix: 'Consider using hash maps or other data structures to reduce iteration complexity',
          why: 'Nested loops multiply execution time, creating quadratic or worse performance for large inputs.',
          source: 'ast',
        });
      }
      newCtx.inLoop = true;
      break;

    case 'CatchClause':
      if (!node.body || (node.body.body && node.body.body.length === 0)) {
        issues.push({
          line: node.loc?.start?.line || null,
          severity: 'warning',
          description: '[AST] Empty catch block swallows errors silently',
          fix: 'Add at minimum: console.error(err) or re-throw the error',
          why: 'Silent error swallowing hides runtime failures, making debugging extremely difficult.',
          source: 'ast',
        });
      }
      break;

    case 'CallExpression':
      if (
        node.callee?.type === 'MemberExpression' &&
        node.callee?.property?.name === 'innerHTML' &&
        node.callee?.object?.type !== 'Literal'
      ) {
        issues.push({
          line: node.loc?.start?.line || null,
          severity: 'critical',
          description: '[AST] Potential XSS: dynamic innerHTML assignment detected',
          fix: 'Use textContent instead of innerHTML, or sanitize input with DOMPurify',
          why: 'Setting innerHTML with user-controlled data allows script injection (XSS) attacks.',
          source: 'ast',
        });
      }
      break;
  }

  for (const key of Object.keys(node)) {
    if (key === 'type' || typeof node[key] !== 'object') continue;
    const child = node[key];
    if (Array.isArray(child)) {
      child.forEach((c) => walkNode(c, issues, newCtx));
    } else {
      walkNode(child, issues, newCtx);
    }
  }
}

module.exports = { analyzeAST };

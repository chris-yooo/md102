import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..', 'md102');

const js = fs.readFileSync(join(root, 'src', 'App.jsx'), 'utf8');
const css = fs.readFileSync(join(root, 'src', 'index.css'), 'utf8');
const html = fs.readFileSync(join(root, 'index.html'), 'utf8');
const pkg = JSON.parse(fs.readFileSync(join(root, 'package.json'), 'utf8'));

const checks = [
  ['Total questions constant (TOTAL_QUESTIONS)', 'TOTAL_QUESTIONS = QUESTION_BANK.length', 1, js],
  ['Scoring: correctCount', 'correctCount', 1, js],
  ['Scoring: scaledScore', 'scaledScore', 1, js],
  ['Scoring: 1000-point scale', '* 1000', 1, js],
  ['Passing threshold 700', '>= 700', 1, js],
  ['Timer: 100 minutes', '100 * 60', 1, js],
  ['Timer: formatTime function', 'function formatTime', 1, js],
  ['Timer: 60s warning threshold', '< 600', 1, js],
  ['3 phases: intro/exam/review', 'phase === \'intro\'', 1, js],
  ['Exam phase render', 'phase === \'exam\'', 1, js],
  ['Review phase render', 'phase === \'review\'', 1, js],
  ['Explanation toggle state', 'showExplanation', 1, js],
  ['Answer state per question', 'answers[currentQ.id]', 1, js],
  ['Correct badge UI', 'Correct', 1, js],
  ['Incorrect badge UI', 'Incorrect', 1, js],
  ['Pass score badge CSS class', 'review-score-badge.pass', 1, css],
  ['Fail score badge CSS class', 'review-score-badge.fail', 1, css],
  ['Pass color var(--correct)', 'var(--correct)', 1, css],
  ['Wrong color var(--wrong)', 'var(--wrong)', 1, css],
  ['Domain strip header', '.domain-strip', 1, css],
  ['Progress fill bar', '.progress-fill', 1, css],
  ['Mini score bar (domain viz)', '.mini-bar-fill', 1, css],
  ['Responsive breakpoint', '@media (max-width: 640px)', 1, css],
  ['Google Fonts Inter', 'fonts.googleapis.com/css2?family=Inter', 1, html],
  ['React 18 createRoot', 'createRoot', 1, js],
  ['React StrictMode', 'StrictMode', 1, js],
  ['Question bank defined', 'QUESTION_BANK = [', 1, js],
  ['Domain 1 questions present', 'Prepare Infrastructure', 8, js],
  ['Domain 2 questions present', 'Manage & Maintain Devices', 7, js],
  ['Domain 3 questions present', 'Protect Devices', 7, js],
  ['Domain 4 questions present', 'Manage & Secure Apps', 7, js],
  ['Domain 5 questions present', 'Optimize Operations', 7, js],
];

let pass = 0, fail = 0;
const results = [];

for (const [label, needle, expected, source] of checks) {
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escaped, 'g');
  const actual = (source.match(regex) || []).length;
  const ok = actual >= expected;
  results.push({ label, actual, expected, ok });
  if (ok) pass++; else fail++;
  console.log((ok ? '✓' : '✗') + ' ' + label + ': found ' + actual + (ok ? '' : ' (expected >= ' + expected + ')'));
}

// Count question IDs explicitly
const qIds = js.match(/id: 'D\d-\d+'/g);
console.log('\n--- Question bank ---');
console.log('Total question IDs found:', qIds ? qIds.length : 0, '(expected 28)');

const domainCounts = {};
for (const line of js.split('\n')) {
  const domMatch = line.match(/domain: '([^']+)'/);
  if (domMatch) {
    domainCounts[domMatch[1]] = (domainCounts[domMatch[1]] || 0) + 1;
  }
}
console.log('Per-domain question counts:');
for (const [d, c] of Object.entries(domainCounts)) {
  console.log('  ' + d + ': ' + c);
}

console.log('\n--- Package ---');
console.log('React:', pkg.dependencies.react);
console.log('React DOM:', pkg.dependencies['react-dom']);
console.log('Vite:', pkg.devDependencies.vite);

console.log('\n--- Build artifacts ---');
const distFiles = fs.readdirSync(join(root, 'dist'));
console.log('dist/ contents:', distFiles.join(', '));
const distHTML = fs.readFileSync(join(root, 'dist', 'index.html'), 'utf8');
console.log('dist/index.html size:', distHTML.length, 'bytes');

console.log('\n--- Result ---');
console.log(pass + ' passed, ' + fail + ' failed of ' + (pass + fail) + ' checks');
console.log(qIds && qIds.length === 28 && fail === 0 ? '✅ ALL CHECKS PASSED — ready' : '❌ SOME CHECKS FAILED');

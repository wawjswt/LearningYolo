const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const lessons = vm.runInNewContext(fs.readFileSync('dist/data.js', 'utf8') + '\nlessons');
assert.equal(lessons.length, 12);
assert.equal(new Set(lessons.map(l => l.id)).size, 12);
for (const group of ['dl', 'cv', 'yolo']) assert.equal(lessons.filter(l => l.group === group).length, 4);
for (const lesson of lessons) {
  assert.equal(lesson.sections.length, 3);
  assert.ok(lesson.code.trim());
  assert.ok(lesson.quiz.answer >= 0 && lesson.quiz.answer < lesson.quiz.options.length);
}
const manifest = JSON.parse(fs.readFileSync('.openai/hosting.json', 'utf8'));
assert.equal(manifest.static.directory, 'dist');
for (const file of ['index.html', 'style.css', 'app.js', 'data.js']) assert.ok(fs.statSync(`dist/${file}`).size > 0);
console.log('Verified 12 lessons, 3 learning tracks, quiz answers, assets and hosting manifest.');

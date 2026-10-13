const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const listeners = [];
const content = { innerHTML: '' };
const crumb = { textContent: '' };
const search = { addEventListener() {} };
const sidebar = { classList: { remove() {} } };
const elements = { '#content': content, '#crumb': crumb, '#search': search, '.sidebar': sidebar };
const location = { hash: '#courses', pathname: '/', search: '' };
const document = {
  title: '',
  querySelector(selector) { return elements[selector] || null; },
  querySelectorAll() { return []; },
  getElementById(id) { return elements[`#${id}`] || null; },
  addEventListener(type, listener, options) { listeners.push({ type, listener, capture: options === true || options?.capture === true }); },
};
const window = { addEventListener() {}, scrollTo() {} };
const context = vm.createContext({
  document,
  window,
  location,
  history: { pushState(_state, _title, url) { location.hash = url.slice(url.indexOf('#')); } },
  localStorage: { getItem() { return null; }, setItem() {} },
  navigator: { clipboard: { writeText: async () => {} } },
  setTimeout,
  clearTimeout,
  console,
});

for (const file of ['data.js', 'textbook-v2.js', 'textbook-app.js', 'textbook-ui-v2.js']) {
  vm.runInContext(fs.readFileSync(`dist/${file}`, 'utf8'), context, { filename: file });
}

const lessons = vm.runInContext('lessons', context);
assert.equal(lessons.length, 24);
assert.equal(new Set(lessons.map(lesson => lesson.id)).size, 24);
for (const group of ['dl', 'cv', 'yolo']) assert.equal(lessons.filter(lesson => lesson.group === group).length, 8);
for (const lesson of lessons) {
  assert.ok(lesson.sections.length >= 3, `${lesson.id} should have detailed sections`);
  assert.ok(lesson.code.trim(), `${lesson.id} should include a code example`);
  assert.ok(lesson.quiz.answer >= 0 && lesson.quiz.answer < lesson.quiz.options.length, `${lesson.id} should have a valid quiz answer`);
}
const manifest = JSON.parse(fs.readFileSync('.openai/hosting.json', 'utf8'));
assert.equal(manifest.static.directory, 'dist');
for (const file of ['index.html', 'style.css', 'app.js', 'data.js', 'textbook-app.js', 'textbook-ui-v2.js', 'textbook-v2.js', 'textbook-v2.css']) {
  assert.ok(fs.statSync(`dist/${file}`).size > 0, `${file} should be present`);
}

function clickCourseFilter(group) {
  const destination = group === 'all' ? '#courses' : `#courses/${group}`;
  const anchor = { getAttribute(name) { return name === 'href' ? destination : null; } };
  const handler = listeners.find(item => item.type === 'click' && item.capture);
  assert.ok(handler, 'course filters should use the shared in-page navigation handler');
  handler.listener({
    target: { closest(selector) { return selector === 'a[href^="#"]' ? anchor : null; } },
    preventDefault() {},
  });
}

for (const group of ['dl', 'cv', 'yolo']) {
  assert.match(content.innerHTML, new RegExp(`href="#courses/${group}"`), `${group} filter should be a navigable link`);
  clickCourseFilter(group);
  assert.equal(location.hash, `#courses/${group}`);
  assert.match(content.innerHTML, /共 8 章/);
}

clickCourseFilter('all');
assert.equal(location.hash, '#courses');
assert.match(content.innerHTML, /共 24 章/);
console.log('Verified 24 textbook chapters and working course-category navigation.');

const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const listeners = [];
const content = { innerHTML: '' };
const crumb = { textContent: '' };
const search = { addEventListener() {} };
const sidebar = { classList: { remove() {} } };
const progressRoot = { attributes: {}, setAttribute(name, value) { this.attributes[name] = value; } };
const progressFill = { style: {} };
const windowListeners = [];
const elements = { '#content': content, '#crumb': crumb, '#search': search, '.sidebar': sidebar, '#reading-progress': progressRoot, '#reading-progress-fill': progressFill };
const location = { hash: '#courses', pathname: '/', search: '' };
const sectionPositions = { 'section-1': 90, 'section-2': 450, 'chapter-review': 1000, 'chapter-notes': 1500 };
const sections = Object.entries(sectionPositions).map(([id, position]) => ({
  id,
  getBoundingClientRect() { return { top: position - window.scrollY }; },
}));
function tocLink(id) {
  const attributes = { href: `#${id}` };
  const classes = new Set();
  return {
    attributes,
    classes,
    getAttribute(name) { return attributes[name] || null; },
    setAttribute(name, value) { attributes[name] = value; },
    removeAttribute(name) { delete attributes[name]; },
    classList: { toggle(name, enabled) { if (enabled) classes.add(name); else classes.delete(name); } },
  };
}
const tocLinks = Object.keys(sectionPositions).map(tocLink);
const document = {
  title: '',
  querySelector(selector) { return elements[selector] || null; },
  querySelectorAll(selector) {
    if (selector === '.text-section[id^="section-"], #chapter-review, #chapter-notes') return sections;
    if (selector === '.chapter-toc a') return tocLinks;
    return [];
  },
  documentElement: { scrollHeight: 2400 },
  getElementById(id) { return elements[`#${id}`] || null; },
  addEventListener(type, listener, options) { listeners.push({ type, listener, capture: options === true || options?.capture === true }); },
};
const window = {
  innerHeight: 800,
  scrollY: 0,
  addEventListener(type, listener) { windowListeners.push({ type, listener }); },
  removeEventListener(type, listener) {
    const index = windowListeners.findIndex(item => item.type === type && item.listener === listener);
    if (index >= 0) windowListeners.splice(index, 1);
  },
  matchMedia() { return { matches: false }; },
  scrollTo() {},
};
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

for (const file of ['data.js', 'textbook-figures.js', 'textbook-v2.js', 'textbook-app.js', 'textbook-ui-v3.js']) {
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
  const page = context.window.lesson(lesson.id);
  assert.match(page, new RegExp(`<figure class="chapter-concept-figure" data-visual="${lesson.visual}"`), `${lesson.id} should have a chapter-specific concept figure`);
  assert.match(page, /<figure class="chapter-concept-figure"[^>]*tabindex="0"/, `${lesson.id} figure should be keyboard scrollable on narrow screens`);
  assert.match(page, /<svg[^>]+aria-labelledby="[^"]+"[\s\S]*?<title id="[^"]+">[\s\S]*?<desc id="[^"]+">/, `${lesson.id} figure should explain its visual to assistive technology`);
  assert.match(page, /<section class="text-section" id="section-\d+">[\s\S]*?<figure class="chapter-concept-figure"/, `${lesson.id} figure should sit beside its related explanation`);
}
const readingPage = context.window.lesson('iou');
assert.match(readingPage, /class="reading-progress"[^>]*role="progressbar"/, 'lesson pages should expose an accessible reading progress bar');
assert.match(readingPage, /id="reading-progress-fill"/, 'lesson pages should contain a progress indicator');
const textbookCss = fs.readFileSync('dist/textbook-v3.css', 'utf8');
assert.match(textbookCss, /@keyframes textbook-enter/, 'page sections should use the restrained entrance animation');
assert.match(textbookCss, /prefers-reduced-motion:\s*reduce/, 'motion should respect the reduced-motion preference');
assert.match(textbookCss, /\.chapter-toc a\.is-current/, 'the current reading section should be highlighted in the table of contents');
const manifest = JSON.parse(fs.readFileSync('.openai/hosting.json', 'utf8'));
assert.equal(manifest.static.directory, 'dist');
const html = fs.readFileSync('dist/index.html', 'utf8');
assert.match(html, /href="textbook-v3\.css"/);
assert.match(html, /src="textbook-ui-v3\.js"/);
assert.match(html, /src="textbook-figures\.js"/);
for (const file of ['index.html', 'style.css', 'app.js', 'data.js', 'textbook-app.js', 'textbook-figures.js', 'textbook-ui-v3.js', 'textbook-v2.js', 'textbook-v3.css']) {
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
location.hash = '#lesson/iou';
context.window.render();
assert.equal(progressRoot.attributes['aria-valuenow'], '0', 'reading progress should initialize at the top of a lesson');
assert.ok(tocLinks[0].classes.has('is-current'), 'the first section should be active at the top of a lesson');
window.scrollY = 650;
windowListeners.find(item => item.type === 'scroll').listener();
assert.equal(progressRoot.attributes['aria-valuenow'], '41', 'reading progress should follow page scrolling');
assert.ok(tocLinks[1].classes.has('is-current'), 'the active table-of-contents item should follow the visible section');
assert.equal(tocLinks[1].attributes['aria-current'], 'location', 'the current section should be announced to assistive technology');
console.log('Verified 24 textbook chapters, course navigation, and accessible reading progress.');

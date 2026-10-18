// Run without browser dependencies: node _scripts/check_theme.js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../assets/theme.js'), 'utf8');

function element(properties = {}) {
  return {
    handlers: {}, ...properties,
    addEventListener(type, handler) { this.handlers[type] = handler; },
    fire(type, event = {}) { this.handlers[type](event); },
  };
}

function setup(saved = null, blockedStorage = false) {
  const root = { dataset: {} };
  const label = {};
  const summary = { focused: false, focus() { this.focused = true; } };
  const options = ['system', 'light', 'dark'].map((value, index) => element({
    value, parentElement: { textContent: [' 시스템 ', ' 밝게 ', ' 어둡게 '][index] },
  }));
  const picker = element({
    hidden: true, open: false,
    querySelector: selector => ({ summary, '[data-theme-label]': label })[selector],
    querySelectorAll: () => options,
    contains: target => [...options, summary].includes(target),
  });
  const document = element({ documentElement: root, querySelector: () => picker });
  const storage = { value: saved };
  vm.runInNewContext(source, {
    document,
    localStorage: {
      getItem(key) {
        assert.equal(key, 'resume-theme');
        if (blockedStorage) throw new Error('Storage blocked');
        return storage.value;
      },
      setItem(key, value) {
        assert.equal(key, 'resume-theme');
        if (blockedStorage) throw new Error('Storage blocked');
        storage.value = value;
      },
    },
  });
  const initial = root.dataset.theme;
  document.fire('DOMContentLoaded');
  assert.equal(picker.hidden, false);
  assert.deepEqual(options.map(option => option.checked), options.map(option => option.value === initial));
  return { root, label, options, picker, summary, document, storage, initial };
}

assert.equal(setup().initial, 'system');
assert.equal(setup('invalid').initial, 'system');
for (const value of ['system', 'light', 'dark']) assert.equal(setup(value).initial, value);

const page = setup();
for (const [index, value] of ['system', 'light', 'dark'].entries()) {
  page.options[index].fire('change');
  assert.equal(page.root.dataset.theme, value);
  assert.equal(page.storage.value, value);
  assert.equal(setup(page.storage.value).initial, value, 'Selection survives reload');
  assert.deepEqual(page.options.map(option => option.checked), [0, 1, 2].map(i => i === index));
  assert.equal(page.label.textContent, ['시스템', '밝게', '어둡게'][index]);
}

const blocked = setup('dark', true);
assert.equal(blocked.initial, 'system');
blocked.options[2].fire('change');
assert.equal(blocked.root.dataset.theme, 'dark', 'Blocked storage must not prevent selection');

page.picker.open = true;
page.document.fire('click', { target: page.options[0] });
assert.equal(page.picker.open, true);
page.document.fire('click', { target: {} });
assert.equal(page.picker.open, false);
page.picker.open = true;
page.picker.fire('keydown', { key: 'Escape' });
assert.equal(page.picker.open, false);
assert.equal(page.summary.focused, true);
console.log('THEME OK: system default, saved selection, invalid/blocked storage, labels, dismissal and keyboard focus');

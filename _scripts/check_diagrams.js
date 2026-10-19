// Run the browser script with a controlled clock and DOM events: node _scripts/check_diagrams.js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../assets/diagrams.js'), 'utf8');

function element(properties = {}) {
  return {
    hidden: false, focusVisible: false, attributes: {}, handlers: {},
    matches(selector) { return selector === ':focus-visible' && this.focusVisible; },
    ...properties,
    setAttribute(key, value) { this.attributes[key] = value; },
    addEventListener(type, handler) { this.handlers[type] = handler; },
    fire(type, event = {}) { this.handlers[type](event); },
  };
}

function setup(reducedMotion = false) {
  const slides = [element(), element({ hidden: true })];
  const buttons = [element(), element()];
  const rotation = element({ dataset: { play: '자동 전환', pause: '일시정지' } });
  const controls = element({ hidden: true });
  const carousel = element({
    querySelectorAll: selector => ({ '.graph-slide': slides, '[data-diagram]': buttons })[selector],
    querySelector: selector => ({ '.graph-rotation': rotation, '.graph-controls': controls })[selector],
    contains: target => [...buttons, rotation].includes(target),
  });
  const document = element({ querySelector: () => carousel });
  const motion = element({ matches: reducedMotion });
  let now = 0;
  let id = 0;
  const timers = new Map();
  vm.runInNewContext(source, {
    document, window: { matchMedia: () => motion },
    setInterval(callback, delay) {
      timers.set(++id, { callback, delay, next: now + delay });
      return id;
    },
    clearInterval: timer => timers.delete(timer),
  });
  const advance = milliseconds => {
    const end = now + milliseconds;
    for (const timer of timers.values()) {
      while (timer.next <= end) {
        now = timer.next;
        timer.next += timer.delay;
        timer.callback();
      }
    }
    now = end;
    assert.ok(timers.size <= 1, 'Only one rotation timer may run');
  };
  const expectSlide = index => {
    assert.deepEqual(slides.map(slide => slide.hidden), [index !== 0, index !== 1]);
    assert.deepEqual(buttons.map(button => button.attributes['aria-pressed']), [String(index === 0), String(index === 1)]);
  };
  assert.equal(controls.hidden, false);
  return { buttons, rotation, carousel, document, motion, advance, expectSlide };
}

const page = setup();
page.expectSlide(0);
page.advance(4999);
page.expectSlide(0);
page.advance(1);
page.expectSlide(1);
page.advance(5000);
page.expectSlide(0);

page.advance(4000);
page.buttons[1].fire('click');
page.advance(4999);
page.expectSlide(1);
page.advance(1);
page.expectSlide(0);
page.carousel.fire('mouseenter');
page.advance(10000);
page.expectSlide(0);
page.carousel.fire('mouseleave');
page.advance(5000);
page.expectSlide(1);

page.buttons[0].focusVisible = true;
page.carousel.fire('focusin', { relatedTarget: null, target: page.buttons[0] });
assert.equal(page.rotation.textContent, '자동 전환');
page.buttons[0].fire('click');
page.advance(10000);
page.expectSlide(0);
page.rotation.fire('click');
assert.equal(page.rotation.textContent, '일시정지');
page.advance(5000);
page.expectSlide(1);
page.rotation.fire('click');
page.advance(10000);
page.expectSlide(1);

page.rotation.fire('click');
page.document.hidden = true;
page.document.fire('visibilitychange');
page.advance(10000);
page.expectSlide(1);
page.document.hidden = false;
page.document.fire('visibilitychange');
page.advance(5000);
page.expectSlide(0);

const reduced = setup(true);
reduced.advance(10000);
reduced.expectSlide(0);
reduced.buttons[1].fire('click');
reduced.expectSlide(1);
reduced.rotation.fire('click');
reduced.advance(5000);
reduced.expectSlide(0);
reduced.motion.fire('change');
reduced.advance(10000);
reduced.expectSlide(0);

const manual = setup();
manual.carousel.fire('mouseenter');
manual.carousel.fire('focusin', { relatedTarget: null, target: manual.rotation });
manual.rotation.fire('click');
assert.equal(manual.rotation.textContent, '자동 전환', 'A pointer click must pause on the first attempt');
manual.carousel.fire('mouseleave');
manual.motion.matches = true;
manual.motion.fire('change');
manual.motion.matches = false;
manual.motion.fire('change');
manual.advance(5000);
manual.expectSlide(0);
assert.equal(manual.rotation.textContent, '자동 전환', 'System motion changes must preserve a user pause');
manual.rotation.fire('click');
manual.advance(5000);
manual.expectSlide(1);
console.log('DIAGRAMS OK: five-second cycling, selection, pause/play, hover, focus, hidden tabs and reduced motion without overriding a user pause');

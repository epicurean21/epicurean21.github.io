(() => {
  const carousel = document.querySelector('.graph');
  const slides = [...carousel.querySelectorAll('.graph-slide')];
  const buttons = [...carousel.querySelectorAll('[data-diagram]')];
  const rotation = carousel.querySelector('.graph-rotation');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let paused = motion.matches;
  let hovered = false;
  let timer;

  function show(index) {
    current = index;
    slides.forEach((slide, i) => { slide.hidden = i !== index; });
    buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
  }

  function updateRotation() {
    clearInterval(timer);
    rotation.textContent = paused ? rotation.dataset.play : rotation.dataset.pause;
    if (!paused && !hovered && !document.hidden) {
      timer = setInterval(() => show((current + 1) % slides.length), 5000);
    }
  }

  buttons.forEach((button, index) => button.addEventListener('click', () => {
    show(index);
    updateRotation();
  }));
  rotation.addEventListener('click', () => {
    paused = !paused;
    updateRotation();
  });
  carousel.addEventListener('mouseenter', () => {
    hovered = true;
    updateRotation();
  });
  carousel.addEventListener('mouseleave', () => {
    hovered = false;
    updateRotation();
  });
  carousel.addEventListener('focusin', event => {
    if (!carousel.contains(event.relatedTarget) && event.target.matches(':focus-visible')) {
      paused = true;
      updateRotation();
    }
  });
  document.addEventListener('visibilitychange', updateRotation);
  motion.addEventListener('change', () => {
    if (motion.matches) paused = true;
    updateRotation();
  });

  carousel.querySelector('.graph-controls').hidden = false;
  show(0);
  updateRotation();
})();

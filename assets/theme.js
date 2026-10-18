(() => {
  const root = document.documentElement;
  let theme = 'system';
  try {
    const saved = localStorage.getItem('resume-theme');
    if (['system', 'light', 'dark'].includes(saved)) theme = saved;
  } catch { /* Storage may be unavailable; keep the system default. */ }
  root.dataset.theme = theme;

  document.addEventListener('DOMContentLoaded', () => {
    const picker = document.querySelector('.theme-picker');
    const summary = picker.querySelector('summary');
    const label = picker.querySelector('[data-theme-label]');
    const options = [...picker.querySelectorAll('input[name="theme"]')];

    function select(value) {
      root.dataset.theme = value;
      options.forEach(option => {
        option.checked = option.value === value;
        if (option.checked) label.textContent = option.parentElement.textContent.trim();
      });
    }

    select(theme);
    picker.hidden = false;
    options.forEach(option => option.addEventListener('change', () => {
      select(option.value);
      try { localStorage.setItem('resume-theme', option.value); }
      catch { /* The selection still applies for this page. */ }
    }));
    document.addEventListener('click', event => {
      if (!picker.contains(event.target)) picker.open = false;
    });
    picker.addEventListener('keydown', event => {
      if (event.key === 'Escape' && picker.open) {
        picker.open = false;
        summary.focus();
      }
    });
  });
})();

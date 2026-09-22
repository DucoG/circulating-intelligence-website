(() => {
  const figure = document.querySelector('#fragment-view');
  const controls = figure.querySelector('.figure-controls');
  const toggle = figure.querySelector('.motion-toggle');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const caption = document.querySelector('#figure-caption');
  let paused = reduced.matches;
  controls.hidden = false;
  figure.classList.add('is-animated');
  function updateMotion() {
    figure.classList.toggle('is-paused', paused);
    document.documentElement.dataset.reducedMotion = String(paused);
    toggle.textContent = paused ? 'Play motion' : 'Pause motion';
    toggle.setAttribute('aria-pressed', String(paused));
  }
  updateMotion();
  toggle.addEventListener('click', () => { paused = !paused; updateMotion(); });
  reduced.addEventListener('change', event => { paused = event.matches; updateMotion(); });
  const fragments = [...figure.querySelectorAll('.fragment')];
  figure.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => {
    const patterns = button.dataset.view === 'patterns';
    figure.dataset.view = button.dataset.view;
    figure.querySelectorAll('[data-view]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    fragments.forEach((fragment, index) => {
      const column = index % 4;
      const row = Math.floor(index / 4);
      const targetX = 36 + column * 113 + Math.sin(row * .22) * 9;
      fragment.style.setProperty('--target', patterns ? `${targetX - Number(fragment.getAttribute('x'))}px` : '0px');
    });
    caption.innerHTML = patterns ? 'Shared patterns.<br>A foundation to build on.' : 'Individual fragments.<br>A deeper biological story.';
  }));
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      entry.target.classList.toggle('in-view', entry.isIntersecting);
    }), {threshold: .35});
    document.querySelectorAll('.step').forEach(step => observer.observe(step));
    const heroObserver = new IntersectionObserver(([entry]) => {
      figure.classList.toggle('is-animated', entry.isIntersecting && !document.hidden);
    });
    heroObserver.observe(figure);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) figure.classList.remove('is-animated');
      else { heroObserver.unobserve(figure); heroObserver.observe(figure); }
    });
  }
})();

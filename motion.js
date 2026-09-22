(() => {
  const figure = document.querySelector('#fragment-view');
  const controls = figure.querySelector('.figure-controls');
  const toggle = figure.querySelector('.motion-toggle');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const caption = document.querySelector('#figure-caption');
  const fragments = [...figure.querySelectorAll('.fragment')];
  const applications = [...document.querySelectorAll('.application')];
  const dock = document.createElement('button');
  dock.type = 'button'; dock.className = 'motion-dock'; dock.hidden = true;
  document.body.append(dock);
  let paused = reduced.matches, visible = true, mode = 'assemble', animations = [], timer;
  let activeApplication = -1;
  controls.hidden = false;
  function sync() {
    document.documentElement.dataset.reducedMotion = String(paused);
    figure.classList.toggle('is-paused', paused || !visible || document.hidden);
    [toggle, dock].forEach(button => {
      button.textContent = paused ? 'Play motion' : 'Pause motion';
      button.setAttribute('aria-pressed', String(paused));
    });
    animations.forEach(animation => paused || !visible || document.hidden ? animation.pause() : animation.play());
  }
  [toggle, dock].forEach(button => button.addEventListener('click', () => { paused = !paused; sync(); }));
  reduced.addEventListener('change', e => { paused = e.matches; sync(); });
  function build(nextMode) {
    mode = nextMode;
    animations.forEach(animation => animation.cancel());
    animations = [];
    figure.dataset.view = mode;
    figure.querySelectorAll('[data-view]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.view === mode)));
    caption.innerHTML = mode === 'assemble' ? 'Many fragments.<br>One shared foundation.' : 'One foundation.<br>Many clinical possibilities.';
    fragments.forEach((fragment, i) => {
      const x = +fragment.getAttribute('x'), y = +fragment.getAttribute('y'), w = +fragment.getAttribute('width');
      const group = Math.floor(i / 39), k = i % 39;
      const packed = {x:110 + (group % 2 ? 30 : 0) + (k % 13) * 15, y:180 + group * 54 + Math.floor(k / 13) * 8, scale:12 / w};
      const branch = Math.floor(i / 26), q = i % 26;
      const spread = {x:32 + (branch % 2) * 258 + (q % 13) * 12, y:115 + Math.floor(branch / 2) * 160 + Math.floor(q / 13) * 13, scale:9 / w};
      const scatter = {x:25 + ((i * 73) % 390), y:60 + ((i * 47) % 455), scale:Math.min(1,55/w)};
      const transform = p => `translate(${p.x - x * p.scale}px, ${p.y - y}px) scale(${p.scale}, 1)`;
      const start = mode === 'assemble' ? scatter : packed;
      const end = mode === 'assemble' ? packed : spread;
      const frames = [
        {transform:transform(start),opacity:.7,offset:0},
        {transform:transform(start),opacity:.7,offset:.12},
        {transform:transform(end),opacity:1,offset:.42},
        {transform:transform(end),opacity:1,offset:.7},
        {transform:transform(start),opacity:.7,offset:1}
      ];
      if (fragment.animate) {
        const animation = fragment.animate(frames,{duration:8500,delay:(i%13)*35,iterations:Infinity,easing:'cubic-bezier(.65,0,.25,1)',fill:'both'});
        animations.push(animation);
        if (paused) { animation.pause(); animation.currentTime = 4400; }
      }
    });
    sync();
  }
  figure.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click',()=>build(b.dataset.view)));
  build(mode);
  // A second motion idea: the shared foundation activates different applications.
  timer = setInterval(() => {
    if (paused || document.hidden || !document.querySelector('.application-map').classList.contains('in-view')) return;
    applications.forEach(a => a.classList.remove('is-active'));
    activeApplication = (activeApplication + 1) % applications.length;
    applications[activeApplication].classList.add('is-active');
  }, 1500);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => entry.target.classList.toggle('in-view',entry.isIntersecting)),{threshold:.15});
    document.querySelectorAll('.step,.application-map').forEach(el=>observer.observe(el));
    new IntersectionObserver(([entry]) => { visible=entry.isIntersecting; dock.hidden=visible; sync(); }).observe(figure);
  }
  document.addEventListener('visibilitychange',sync);
})();

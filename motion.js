(() => {
  const figure = document.querySelector('#fragment-view');
  const svg = figure.querySelector('.fragments');
  const toggle = figure.querySelector('.motion-toggle');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const applications = [...document.querySelectorAll('.application')];
  const dock = document.createElement('button');
  dock.type = 'button'; dock.className = 'motion-dock'; dock.hidden = true;
  document.body.append(dock);
  figure.querySelector('.figure-controls').hidden = false;
  let paused = reduced.matches, visible = true, frame = 0, last = 0, time = 0;
  let activeApplication = -1;
  const pointer = {x:0,y:0,active:false};
  const particles = [...svg.querySelectorAll('.fragment')].map((el,i) => ({
    el, x:+el.getAttribute('x'), y:+el.getAttribute('y'), width:+el.getAttribute('width'),
    phase:i*2.39996, speed:12+(i%9)*2.2, baseX:(i*137.51)%640-70,
    baseY:70+(i*71.17)%445, dx:0,dy:0
  }));
  function draw(dt) {
    const follow=1-Math.exp(-dt*7);
    for(const p of particles) {
      const x=((p.baseX+time*p.speed+90)%680)-90;
      const y=p.baseY+Math.sin(time*.55+p.phase)*25+Math.cos(time*.23+x*.013+p.phase)*18;
      let pushX=0,pushY=0;
      if(pointer.active) {
        const rx=x+p.width/2-pointer.x, ry=y-pointer.y;
        const distance=Math.hypot(rx,ry), influence=Math.max(0,1-distance/150);
        if(influence>0) {
          const angle=Math.atan2(ry,rx);
          // Repulsion plus a tangential current makes a soft wake around the pointer.
          pushX=(Math.cos(angle)*95-Math.sin(angle)*40)*influence*influence;
          pushY=(Math.sin(angle)*95+Math.cos(angle)*40)*influence*influence;
        }
      }
      p.dx+=(pushX-p.dx)*follow; p.dy+=(pushY-p.dy)*follow;
      const angle=Math.sin(time*.42+p.phase)*13+p.dy*.24;
      p.el.style.transform=`translate(${x-p.x+p.dx}px,${y-p.y+p.dy}px) rotate(${angle}deg)`;
      p.el.style.transformOrigin=`${p.x+p.width/2}px ${p.y+2.5}px`;
      const fade=Math.min(1,Math.max(0,(x+70)/55),Math.max(0,(565-x)/55));
      p.el.style.opacity=String(fade*(.6+.35*(.5+.5*Math.sin(time*.7+p.phase))));
    }
  }
  function tick(now) {
    frame=0;
    if(paused || !visible || document.hidden) {last=0;return;}
    const dt=last?Math.min((now-last)/1000,.05):0;
    last=now; time+=dt; draw(dt);
    frame=requestAnimationFrame(tick);
  }
  function sync() {
    document.documentElement.dataset.reducedMotion=String(paused);
    [toggle,dock].forEach(b=>{b.textContent=paused?'Play motion':'Pause motion';b.setAttribute('aria-pressed',String(paused));});
    if(frame) cancelAnimationFrame(frame);
    frame=0;last=0;
    if(!paused && visible && !document.hidden) frame=requestAnimationFrame(tick);
  }
  [toggle,dock].forEach(b=>b.addEventListener('click',()=>{paused=!paused;sync();}));
  reduced.addEventListener('change',e=>{paused=e.matches;sync();});
  svg.addEventListener('pointermove',e=>{
    const matrix=svg.getScreenCTM();
    if(!matrix) return;
    const point=new DOMPoint(e.clientX,e.clientY).matrixTransform(matrix.inverse());
    pointer.x=point.x;pointer.y=point.y;pointer.active=true;
  },{passive:true});
  for(const event of ['pointerleave','pointercancel']) svg.addEventListener(event,()=>{pointer.active=false;});
  svg.addEventListener('pointerup',e=>{if(e.pointerType!=='mouse')pointer.active=false;});
  draw(0);sync();
  setInterval(()=>{
    if(paused || document.hidden || !document.querySelector('.application-map').classList.contains('in-view'))return;
    applications.forEach(a=>a.classList.remove('is-active'));
    activeApplication=(activeApplication+1)%applications.length;
    applications[activeApplication].classList.add('is-active');
  },1500);
  if('IntersectionObserver' in window) {
    const observer=new IntersectionObserver(entries=>entries.forEach(e=>e.target.classList.toggle('in-view',e.isIntersecting)),{threshold:.15});
    document.querySelectorAll('.step,.application-map').forEach(el=>observer.observe(el));
    new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;dock.hidden=visible;sync();}).observe(figure);
  }
  document.addEventListener('visibilitychange',sync);
})();

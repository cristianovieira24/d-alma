'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const motionMedia=matchMedia('(prefers-reduced-motion: reduce)');
let userReduced=null,motionContext=null;
const header=$('.header'),nav=$('#main-nav'),menu=$('.menu');
const main=document.querySelector('main'),footer=document.querySelector('footer'),backdrop=$('.nav-backdrop');
function setMenu(open,restoreFocus=false){
 menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');nav.classList.toggle('open',open);document.body.classList.toggle('menu-open',open);main.inert=footer.inert=open;backdrop.hidden=!open;
 if(restoreFocus)menu.focus({preventScroll:true});
}
function closeMenu(restoreFocus=false){setMenu(false,restoreFocus)}
menu.addEventListener('click',()=>setMenu(menu.getAttribute('aria-expanded')!=='true'));
backdrop.addEventListener('click',()=>closeMenu(true));
$$('a',nav).forEach(a=>a.addEventListener('click',()=>closeMenu()));
addEventListener('keydown',e=>{
 if(menu.getAttribute('aria-expanded')!=='true')return;
 if(e.key==='Escape'){closeMenu(true);return;}
 if(e.key==='Tab'){const items=$$('a,button',header).filter(el=>el.getClientRects().length),first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}
});
matchMedia('(max-width:760px)').addEventListener('change',e=>{if(!e.matches)closeMenu()});
addEventListener('pageshow',()=>closeMenu());
let scrollPending=false;function syncScroll(){const total=document.documentElement.scrollHeight-innerHeight;$('.reading-progress').style.transform=`scaleX(${total>0?Math.min(1,scrollY/total):0})`;header.classList.toggle('scrolled',scrollY>15);scrollPending=false}addEventListener('scroll',()=>{if(!scrollPending){requestAnimationFrame(syncScroll);scrollPending=true}},{passive:true});syncScroll();
const dialog=$('#prototype-dialog');$('[data-open-info]').addEventListener('click',()=>dialog.showModal());$('.dialog-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});
// All copy and images are visible without the motion libraries.
const chapters=$$('.chapter');
function setChapter(index,animate=true){const images=$$('.story-photo');if(!images.length)return;$('#story-current').textContent=String(index+1).padStart(2,'0');if(window.gsap&&animate){gsap.to(images,{opacity:0,duration:.55,overwrite:true});gsap.to(images[index],{opacity:1,duration:.6,overwrite:true});}else images.forEach((im,i)=>im.style.opacity=i===index?'1':'0')}
const chapterMobile=matchMedia('(max-width:760px)');chapterMobile.addEventListener('change',()=>{if(chapterMobile.matches)setChapter(0,false)});
function setupMotion(){
 if(motionContext){motionContext.revert();motionContext=null;}
 const reduced=userReduced===null?motionMedia.matches:userReduced;document.body.classList.toggle('motion-off',reduced);$('#motion-toggle').textContent=reduced?'Ativar animações':'Reduzir animações';$('#motion-toggle').setAttribute('aria-pressed',String(reduced));window.dalmaReducedMotion=reduced;dispatchEvent(new CustomEvent('dalma-motion',{detail:{reduced}}));
 if(!window.gsap||!window.ScrollTrigger||reduced){setChapter(0,false);return;}
 gsap.registerPlugin(ScrollTrigger);
 motionContext=gsap.context(()=>{
  const mm=gsap.matchMedia();
  gsap.from('.hero-copy > *',{y:30,opacity:.2,stagger:.1,duration:1,ease:'power3.out',clearProps:'transform,opacity'});
  if($('.hero-dog'))gsap.from('.hero-dog',{y:55,rotation:4,duration:1.35,ease:'power3.out',clearProps:'transform'});
  if($('.hero-blob'))gsap.from('.hero-blob',{scale:.85,duration:1.5,ease:'power3.out',clearProps:'transform'});
  $$('.section-heading,.story-intro,.bond-copy,.local-layout,.closing h2,.page-intro,.service-body>div,.service-faq>div,.about-hero>div,.value-grid article').forEach(el=>gsap.from(el,{y:38,duration:.95,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 90%',once:true},clearProps:'transform'}));
  $$('.service-card').forEach((el,i)=>gsap.from(el,{y:45,rotation:(i-1)*2,duration:1,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 92%',once:true},clearProps:'transform'}));
  mm.add('(min-width:761px)',()=>{
   if(chapters.length){
    chapters.forEach((chapter,i)=>ScrollTrigger.create({trigger:chapter,start:'top 55%',end:'bottom 55%',onEnter:()=>setChapter(i),onEnterBack:()=>setChapter(i)}));
    gsap.to('.story-track i',{scaleX:1,ease:'none',scrollTrigger:{trigger:'.story-chapters',start:'top center',end:'bottom center',scrub:.5}});
    gsap.fromTo('.story-frame',{rotation:-5},{rotation:4,ease:'none',scrollTrigger:{trigger:'.story-body',start:'top bottom',end:'bottom top',scrub:1}});
    gsap.fromTo('.story-sticker',{y:20,rotation:7},{y:-25,rotation:-4,ease:'none',scrollTrigger:{trigger:'.story-body',start:'top bottom',end:'bottom top',scrub:1.4}});
   }
   if($('.hero-stage'))gsap.to('.hero-stage',{y:45,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1}});
   $$('.bond-photo').forEach(el=>gsap.fromTo(el,{rotation:6,y:30},{rotation:-3,y:-20,ease:'none',scrollTrigger:{trigger:el,start:'top bottom',end:'bottom top',scrub:1.2}}));
  });
  mm.add('(hover:hover) and (pointer:fine)',()=>{
   const listeners=[];
   $$('[data-parallax]').forEach(stage=>{
    const layers=$$('[data-depth]',stage).map(el=>({el,d:Number(el.dataset.depth),x:gsap.quickTo(el,'x',{duration:.8,ease:'power3.out'}),y:gsap.quickTo(el,'y',{duration:.8,ease:'power3.out'})}));
    const move=e=>{const r=stage.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;layers.forEach(l=>{l.x(x*l.d);l.y(y*l.d)})};
    const leave=()=>layers.forEach(l=>{l.x(0);l.y(0)});stage.addEventListener('pointermove',move);stage.addEventListener('pointerleave',leave);listeners.push(()=>{stage.removeEventListener('pointermove',move);stage.removeEventListener('pointerleave',leave);gsap.set(layers.map(l=>l.el),{clearProps:'transform'})});
   });
   $$('.card-image').forEach(el=>{const rx=gsap.quickTo(el,'rotationX',{duration:.65,ease:'power3.out'}),ry=gsap.quickTo(el,'rotationY',{duration:.65,ease:'power3.out'});gsap.set(el,{transformPerspective:900});const move=e=>{const r=el.getBoundingClientRect();rx(-((e.clientY-r.top)/r.height-.5)*6);ry(((e.clientX-r.left)/r.width-.5)*6)};const leave=()=>{rx(0);ry(0)};el.addEventListener('pointermove',move);el.addEventListener('pointerleave',leave);listeners.push(()=>{el.removeEventListener('pointermove',move);el.removeEventListener('pointerleave',leave);gsap.set(el,{clearProps:'transform'})})});
   return()=>listeners.forEach(fn=>fn());
  });
 });
 ScrollTrigger.refresh();
}
$('#motion-toggle').addEventListener('click',()=>{userReduced=!(userReduced===null?motionMedia.matches:userReduced);setupMotion()});motionMedia.addEventListener('change',setupMotion);setupMotion();
addEventListener('load',()=>{if(window.ScrollTrigger)ScrollTrigger.refresh()},{once:true});if(document.fonts)document.fonts.ready.then(()=>{if(window.ScrollTrigger)ScrollTrigger.refresh()});
const choiceData={passeios:{title:'Passeios',copy:'Se a dificuldade está nas saídas do seu cão, comece por conhecer o serviço de passeios e combinar horários e frequência.'},visitas:{title:'Visitas ao domicílio',copy:'Se o seu animal fica em casa, conheça as visitas ao domicílio. Combine as tarefas, a frequência e a forma de acesso com a D’alma.'},'pet-sitting':{title:'Pet sitting',copy:'Se precisa de outro tipo de acompanhamento, descreva a sua situação à D’alma e confirme o apoio possível para o seu companheiro.'}};
$$('[data-choice]').forEach(button=>button.addEventListener('click',()=>{const key=button.dataset.choice,d=choiceData[key];$$('[data-choice]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));$('#choice-title').textContent=d.title;$('#choice-copy').textContent=d.copy;$('#choice-link').href='./'+key+'.html';if(!window.dalmaReducedMotion&&window.gsap)gsap.fromTo('.choice-result',{y:8,opacity:.5},{y:0,opacity:1,duration:.35,clearProps:'transform,opacity'})}));
const form=$('#request-form');
function buildMessage(data){const date=d=>d?d.split('-').reverse().join('/'):'';return ['Olá, D’alma! Gostaria de consultar disponibilidade.',`\nServiço: ${data.service}`,`Tutor: ${data.tutor}`,`Animal: ${data.pet} (${data.type}${data.age?', '+data.age:''})`,`Localidade: ${data.locality}`,`Datas: ${date(data.start)} a ${date(data.end)}`,data.schedule?`Horário / frequência: ${data.schedule}`:'',data.notes?`\nInformações a conversar: ${data.notes}`:'','\nPodem confirmar disponibilidade e condições? Obrigado/a!'].filter(Boolean).join('\n')}
if(form){
 const steps=$$('fieldset',form);let step=0;
 function showStep(i,focus=true){step=i;steps.forEach((s,j)=>{s.hidden=i!==j;s.disabled=i!==j});$('#back').hidden=i===0;$('#next').hidden=i===2;$('#send').hidden=i!==2;$('#step-label').textContent=['01 — O cuidado','02 — O seu companheiro','03 — Onde e quando'][i];$('#step-counter').textContent=`${i+1} / 3`;$$('.form-lines i').forEach((el,j)=>el.classList.toggle('active',j<=i));$('#form-error').textContent='';$('#send-status').hidden=true;if(focus){$('input,select',steps[i])?.focus({preventScroll:true});if(form.getBoundingClientRect().top<90)form.scrollIntoView({behavior:window.dalmaReducedMotion?'instant':'smooth',block:'start'})}}
 function validate(){for(const el of $$('input,select,textarea',steps[step])){if(!el.checkValidity()){el.reportValidity();return false}if(el.required&&el.type!=='radio'&&!el.value.trim()){el.setCustomValidity('Preencha este campo.');el.reportValidity();el.addEventListener('input',()=>el.setCustomValidity(''),{once:true});return false}}return true}
 const selected=new URLSearchParams(location.search).get('servico');const serviceName={'passeios':'Passeios','visitas':'Visitas ao domicílio','pet-sitting':'Pet sitting'}[selected];if(serviceName)$$('input[name=service]',form).forEach(r=>r.checked=r.value===serviceName);
 showStep(0,false);$('#next').addEventListener('click',()=>{if(validate())showStep(step+1)});$('#back').addEventListener('click',()=>showStep(step-1));
 const start=form.elements.start,end=form.elements.end;const today=new Date();today.setMinutes(today.getMinutes()-today.getTimezoneOffset());start.min=end.min=today.toISOString().slice(0,10);start.addEventListener('change',()=>{end.min=start.value||start.min;if(!end.value||end.value<start.value)end.value=start.value});
 form.addEventListener('submit',e=>{e.preventDefault();if(step<2){if(validate())showStep(step+1);return}if(!validate())return;if(end.value<start.value){$('#form-error').textContent='A data de fim deve ser igual ou posterior à data de início.';end.focus();return}steps.forEach(s=>s.disabled=false);const data=Object.fromEntries(new FormData(form));steps.forEach((s,i)=>s.disabled=i!==step);const href='https://wa.me/351928030715?text='+encodeURIComponent(buildMessage(data));$('#wa-fallback').href=href;$('#send-status').hidden=false;window.open(href,'_blank','noopener,noreferrer')});
}

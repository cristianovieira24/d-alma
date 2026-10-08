// A small, optional tennis-ball scene. The rest of the website never depends on WebGL.
const host=document.getElementById('ball-stage');
async function initTennis(){
 if(!host||!matchMedia('(min-width:761px) and (pointer:fine)').matches||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 try{
  const THREE=await import('./vendor/three.module.js');
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor(0,0);host.appendChild(renderer.domElement);
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,1,.1,30);camera.position.z=6.5;
  scene.add(new THREE.HemisphereLight(0xfff6dd,0x5c6336,2.4));const light=new THREE.DirectionalLight(0xfff5df,3);light.position.set(-3,4,5);scene.add(light);
  const ball=new THREE.Group();scene.add(ball);
  const surface=document.createElement('canvas');surface.width=512;surface.height=256;const ctx=surface.getContext('2d');ctx.fillStyle='#b9c669';ctx.fillRect(0,0,512,256);let seed=17;for(let i=0;i<14000;i++){seed=(seed*16807)%2147483647;const x=seed%512;seed=(seed*16807)%2147483647;const y=seed%256;ctx.fillStyle=i%2?'#d1d986':'#a3b453';ctx.fillRect(x,y,1,1)}const texture=new THREE.CanvasTexture(surface);texture.colorSpace=THREE.SRGBColorSpace;
  ball.add(new THREE.Mesh(new THREE.SphereGeometry(1,48,32),new THREE.MeshStandardMaterial({map:texture,roughness:1})));
  const points=[];for(let i=0;i<=200;i++){const t=i/200*Math.PI*2,z=.63*Math.sin(t*2),r=Math.sqrt(1-z*z);points.push(new THREE.Vector3(r*Math.cos(t)*1.003,z*1.003,r*Math.sin(t)*1.003))}const curve=new THREE.CatmullRomCurve3(points,true);ball.add(new THREE.Mesh(new THREE.TubeGeometry(curve,200,.022,5,true),new THREE.MeshStandardMaterial({color:0xf6f0da,roughness:1})));
  ball.rotation.set(.3,.2,.45);let px=0,py=0,active=false,frame=0,reduced=!!window.dalmaReducedMotion;const hero=document.querySelector('.hero');
  const resize=()=>{const r=host.getBoundingClientRect();renderer.setSize(r.width,r.height);camera.aspect=r.width/r.height;camera.updateProjectionMatrix()};new ResizeObserver(resize).observe(host);resize();
  hero.addEventListener('pointermove',e=>{const r=hero.getBoundingClientRect();px=(e.clientX-r.left)/r.width-.5;py=(e.clientY-r.top)/r.height-.5});hero.addEventListener('pointerleave',()=>{px=py=0});
  function render(time){frame=0;if(!active||reduced||document.hidden)return;ball.rotation.y+=(.4+px-ball.rotation.y)*.035;ball.rotation.x+=(.3+py*.6-ball.rotation.x)*.035;ball.position.y=Math.sin(time*.0009)*.09;renderer.render(scene,camera);frame=requestAnimationFrame(render)}
  function sync(){cancelAnimationFrame(frame);frame=0;if(active&&!reduced&&!document.hidden)frame=requestAnimationFrame(render);else renderer.render(scene,camera)}
  new IntersectionObserver(entries=>{active=entries[0].isIntersecting;sync()}).observe(hero);document.addEventListener('visibilitychange',sync);addEventListener('dalma-motion',e=>{reduced=e.detail.reduced;sync()});renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();active=false;cancelAnimationFrame(frame);host.classList.remove('ready')});host.classList.add('ready');renderer.render(scene,camera);
 }catch(e){/* The CSS tennis ball remains visible on devices without WebGL. */}
}

initTennis();

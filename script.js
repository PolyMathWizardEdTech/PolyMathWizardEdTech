(function(){
  const $ = (s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  if(window.gsap){gsap.registerPlugin(ScrollTrigger); $$('.reveal').forEach(el=>{gsap.to(el,{opacity:1,y:0,duration:.9,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 87%'}})})}

  // Hero 3D particle field
  if(window.THREE){
    const canvas=$('#hero-canvas'), scene=new THREE.Scene(), camera=new THREE.PerspectiveCamera(45,innerWidth/innerHeight,.1,100), renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});
    renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.setSize(innerWidth,innerHeight); camera.position.z=15;
    const geo=new THREE.BufferGeometry(), count=950, pos=new Float32Array(count*3);
    for(let i=0;i<count;i++){const i3=i*3, radius=4+Math.random()*9, a=Math.random()*Math.PI*2, y=(Math.random()-.5)*8; pos[i3]=Math.cos(a)*radius; pos[i3+1]=y; pos[i3+2]=Math.sin(a)*radius-2;}
    geo.setAttribute('position',new THREE.BufferAttribute(pos,3)); const mat=new THREE.PointsMaterial({color:0xffffff,size:.035,transparent:true,opacity:.65}); const pts=new THREE.Points(geo,mat); scene.add(pts);
    const group=new THREE.Group();scene.add(group);
    const torus=new THREE.Mesh(new THREE.TorusGeometry(4.5,.025,10,160),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.24})); torus.rotation.x=.8; group.add(torus);
    const sphere=new THREE.Mesh(new THREE.IcosahedronGeometry(2.2,2),new THREE.MeshBasicMaterial({wireframe:true,color:0xffffff,transparent:true,opacity:.08})); group.add(sphere);
    let mx=0,my=0; addEventListener('mousemove',e=>{mx=(e.clientX/innerWidth-.5);my=(e.clientY/innerHeight-.5)});
    function tick(t){pts.rotation.y=t*.00005;pts.rotation.x=t*.00002;group.rotation.y+=(mx*.25-group.rotation.y)*.02;group.rotation.x+=(-my*.2-group.rotation.x)*.02;const hp=window.__heroP||0;camera.position.z=15-hp*5;group.rotation.z=hp*.5;mat.opacity=.65*(1-hp*.45);if(hp<.995)renderer.render(scene,camera);requestAnimationFrame(tick)}requestAnimationFrame(tick);
    addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
  }

  // Section 02 — Textbook / Interactive toggle
  const pedagogyCard=$('#pedagogy-card'), pedagogyToggle=$('#pedagogy-toggle');
  if(pedagogyCard&&pedagogyToggle){
    const setMode=m=>{pedagogyCard.dataset.mode=m;pedagogyToggle.setAttribute('aria-checked',m==='simulation'?'true':'false')};
    pedagogyToggle.addEventListener('click',()=>setMode(pedagogyCard.dataset.mode==='simulation'?'textbook':'simulation'));
    pedagogyToggle.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();pedagogyToggle.click()}});
  }

  // Section 02 — live gravity drop simulation
  const gCanvas=$('#gravity-canvas'), gSlider=$('#gravity-slider'), gValue=$('#gravity-value'), dropBtn=$('#drop-btn');
  if(gCanvas){
    const gctx=gCanvas.getContext('2d'), dpr=Math.min(devicePixelRatio,2);
    let gw,gh,groundY,startY,appleY=0,appleR,velocity=0,falling=false,lastT=null,gravity=parseFloat((gSlider&&gSlider.value)||9.8);
    function gResize(){gw=(gCanvas.clientWidth||gCanvas.parentElement.clientWidth)*dpr;gh=(gCanvas.clientHeight||gCanvas.parentElement.clientHeight)*dpr;gCanvas.width=gw;gCanvas.height=gh;appleR=Math.max(12,gw*0.028);groundY=gh*0.86;startY=gh*0.14;if(!falling)appleY=startY}
    gResize();
    addEventListener('load',gResize);
    if(pedagogyCard){const gObserver=new MutationObserver(gResize);gObserver.observe(pedagogyCard,{attributes:true,attributeFilter:['data-mode']})}
    function drawApple(y){const x=gw/2;gctx.save();gctx.translate(x,y);gctx.beginPath();gctx.arc(0,0,appleR,0,Math.PI*2);gctx.fillStyle='#f8f8f5';gctx.fill();gctx.strokeStyle='#f8f8f5';gctx.lineWidth=Math.max(1,appleR*0.12);gctx.beginPath();gctx.moveTo(0,-appleR*0.95);gctx.lineTo(0,-appleR*1.5);gctx.stroke();gctx.beginPath();gctx.ellipse(appleR*0.35,-appleR*1.25,appleR*0.32,appleR*0.16,-0.5,0,Math.PI*2);gctx.fill();gctx.restore()}
    function gRender(t){if(lastT==null)lastT=t;let dt=(t-lastT)/1000;if(dt>0.033)dt=0.033;lastT=t;
      gctx.clearRect(0,0,gw,gh);gctx.fillStyle='#050505';gctx.fillRect(0,0,gw,gh);
      gctx.strokeStyle='rgba(255,255,255,.05)';gctx.lineWidth=1;for(let x=0;x<gw;x+=40*dpr){gctx.beginPath();gctx.moveTo(x,0);gctx.lineTo(x,gh);gctx.stroke()}
      gctx.strokeStyle='rgba(255,255,255,.18)';gctx.setLineDash([2*dpr,6*dpr]);gctx.lineWidth=1*dpr;gctx.beginPath();gctx.moveTo(gw/2,startY);gctx.lineTo(gw/2,groundY);gctx.stroke();gctx.setLineDash([]);
      gctx.strokeStyle='rgba(255,255,255,.4)';gctx.lineWidth=1*dpr;gctx.beginPath();gctx.moveTo(gw*0.12,groundY);gctx.lineTo(gw*0.88,groundY);gctx.stroke();
      if(falling){const dropPx=groundY-startY,pxPerMeter=dropPx/5,accel=gravity*pxPerMeter;velocity+=accel*dt;appleY+=velocity*dt;
        if(appleY+appleR>=groundY){appleY=groundY-appleR;velocity*=-0.38;if(Math.abs(velocity)<40*dpr){velocity=0;falling=false}}}
      drawApple(appleY);
      gctx.fillStyle='rgba(255,255,255,.55)';gctx.font=`${10*dpr}px 'Space Grotesk',sans-serif`;gctx.fillText(`g = ${gravity.toFixed(1)} m/s²`,gw*0.12,groundY+22*dpr);
      requestAnimationFrame(gRender)}
    requestAnimationFrame(gRender); addEventListener('resize',gResize);
    gSlider&&gSlider.addEventListener('input',()=>{gravity=parseFloat(gSlider.value);gValue&&(gValue.textContent=gravity.toFixed(1))});
    dropBtn&&dropBtn.addEventListener('click',()=>{appleY=startY;velocity=0;falling=true});
  }


  // Section 03 — Miniaturised adaptive learning engine
  // Same mechanics as the full system: Bayesian Knowledge Tracing, difficulty ladder,
  // zone-of-proximal-development question scoring, prerequisite locking, interleaving.
  (function adaptiveMini(){
    const root=$('#adaptive-mini'); if(!root) return;
    const CFG={PREREQ:0.75,MAX_D:3,MIN_D:1,STEP_UP:2,INTERLEAVE:3,ZPD:0.75,DELAY:2200,BKT:{learn:0.20,slip:0.08,guess:0.10},W:{diff:4.0,zpd:2.5,weak:1.5,novel:0.5}};
    const CONCEPTS={
      'algebra':{name:'Algebra Basics',prereqs:[]},
      'linear':{name:'Linear Equations',prereqs:['algebra']},
      'quadratic':{name:'Quadratics',prereqs:['algebra']},
      'lines':{name:'Lines & Angles',prereqs:[]},
      'triangles':{name:'Triangles',prereqs:['lines']}
    };
    const Q=(id,c,d,t,ok,bad,why)=>({id,concept:c,difficulty:d,text:t,correct:ok,distractors:bad,explanation:why});
    const QS=[
      Q(1,'algebra',1,'Simplify: 3x + 5x − 2x','6x',['5x','4x','10x'],'3 + 5 − 2 = 6'),
      Q(2,'algebra',1,'Expand: 2(3x + 4)','6x + 8',['6x + 4','3x + 8','6x + 2'],'Multiply each term by 2'),
      Q(3,'algebra',1,'Evaluate: 2³ + 3²','17',['15','36','13'],'8 + 9 = 17'),
      Q(4,'algebra',2,'Simplify: (2x² + 3x) + (4x² − x)','6x² + 2x',['6x² + 4x','8x² + 2x','6x⁴ + 2x'],'2x²+4x² = 6x², 3x−x = 2x'),
      Q(5,'algebra',2,'Factorise: x² + 7x + 12','(x+3)(x+4)',['(x+2)(x+6)','(x+1)(x+12)','(x+3)(x+5)'],'3×4 = 12 and 3+4 = 7'),
      Q(6,'algebra',3,'Simplify: (x + 3)² − (x − 3)²','12x',['6x','9x','0'],'(x²+6x+9) − (x²−6x+9) = 12x'),
      Q(7,'linear',1,'Solve: 2x + 5 = 13','4',['3','5','9'],'2x = 8, so x = 4'),
      Q(8,'linear',1,'Solve: 3x − 7 = 11','6',['4','5','18'],'3x = 18, so x = 6'),
      Q(9,'linear',2,'Solve: 5(x − 2) = 3x + 4','7',['5','6','9'],'5x−10 = 3x+4, so 2x = 14'),
      Q(10,'linear',2,'Solve: x/3 + x/4 = 7','12',['10','14','21'],'Multiply by 12: 7x = 84'),
      Q(11,'linear',3,'Solve: 2/(x−1) = 3/(x+2)','7',['5','8','−7'],'Cross-multiply: 2x+4 = 3x−3'),
      Q(12,'quadratic',1,'Solve: x² = 9','x = ±3',['x = 3 only','x = ±9','x = 4.5'],'Include the ± root'),
      Q(13,'quadratic',2,'Solve: x² − 5x + 6 = 0','x = 2 or 3',['x = 1 or 6','x = −2 or −3','x = 2 or −3'],'(x−2)(x−3) = 0'),
      Q(14,'quadratic',3,'Discriminant of x² − 6x + 9','0',['36','−36','72'],'b² − 4ac = 36 − 36'),
      Q(15,'lines',1,'Supplementary angles sum to?','180°',['90°','270°','360°'],'Definition of supplementary'),
      Q(16,'lines',1,'Complementary angles sum to?','90°',['180°','45°','360°'],'Definition of complementary'),
      Q(17,'lines',2,'Triangle angles 45° and 60°. Third angle?','75°',['85°','65°','95°'],'180 − 105 = 75'),
      Q(18,'lines',3,'Co-interior angles, one is 110°. The other?','70°',['110°','90°','55°'],'Co-interior angles sum to 180°'),
      Q(19,'triangles',1,'Sides 3, 4, 5. Right-angled?','Yes',['No','Cannot tell','Only if isosceles'],'3² + 4² = 5²'),
      Q(20,'triangles',2,'Hypotenuse if legs are 6 and 8','10',['12','14','48'],'c² = 36 + 64 = 100'),
      Q(21,'triangles',3,'Similar triangles 3,4,5 and 6,8,x. Find x.','10',['9','12','7'],'Scale factor is 2')
    ];
    const S={used:new Set(),cur:null,cStreak:0,answered:0,correct:0,streak:0,picked:null,timer:null,resets:0};
    const M={};Object.keys(CONCEPTS).forEach(k=>M[k]={mastery:0,diff:1,cs:0,is:0});
    const prereqsMet=k=>CONCEPTS[k].prereqs.every(p=>M[p].mastery>=CFG.PREREQ);
    const bkt=(m,ok)=>{const{learn,slip,guess}=CFG.BKT;let p;
      if(ok){const pc=(1-slip)*m+guess*(1-m);p=((1-slip)*m)/pc;p+=(1-p)*learn;return Math.min(1,p)}
      const pi=slip*m+(1-guess)*(1-m);p=(slip*m)/pi;p+=(1-p)*learn*0.3;return Math.max(0,p)};
    const REQ={1:.15,2:.45,3:.75};
    const predicted=(q,m)=>1/(1+Math.exp(-8*(m-REQ[q.difficulty])));
    const stepDiff=(k,ok)=>{const s=M[k];
      if(ok){s.cs++;s.is=0;if(s.cs>=CFG.STEP_UP&&s.diff<CFG.MAX_D){s.diff++;s.cs=0}}
      else{s.is++;s.cs=0;if(s.diff>CFG.MIN_D)s.diff--;if(s.is>=2&&s.diff>CFG.MIN_D)s.diff--}};
    const scoreQ=q=>{const s=M[q.concept],dd=Math.abs(q.difficulty-s.diff),ds=dd===0?1:dd===1?.3:0,
      zs=Math.max(0,1-Math.abs(predicted(q,s.mastery)-CFG.ZPD)*2);
      return CFG.W.diff*ds+CFG.W.zpd*zs+CFG.W.weak*(1-s.mastery)+CFG.W.novel};
    const pickConcept=pool=>{
      const cs=[...new Set(pool.map(q=>q.concept))],weakest=a=>a.reduce((x,y)=>M[x].mastery<=M[y].mastery?x:y);
      if(S.cStreak>=CFG.INTERLEAVE){const o=cs.filter(c=>c!==S.cur);if(o.length)return weakest(o)}
      const gate=[];Object.keys(CONCEPTS).filter(k=>!prereqsMet(k)).forEach(k=>CONCEPTS[k].prereqs.forEach(p=>{if(cs.includes(p)&&M[p].mastery<CFG.PREREQ)gate.push(p)}));
      if(gate.length)return weakest(gate);
      return weakest(cs)};
    const nextQ=()=>{
      let pool=QS.filter(q=>!S.used.has(q.id)&&prereqsMet(q.concept));
      if(!pool.length){S.used.clear();S.resets++;pool=QS.filter(q=>prereqsMet(q.concept))}
      const tc=pickConcept(pool);let cp=pool.filter(q=>q.concept===tc);if(!cp.length)cp=pool;
      let best=cp[0],bs=-Infinity;cp.forEach(q=>{const sc=scoreQ(q);if(sc>bs){bs=sc;best=q}});
      if(tc===S.cur)S.cStreak++;else{S.cur=tc;S.cStreak=1}
      S.used.add(best.id);return best};
    const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};

    const el={ans:$('#am-answered'),acc:$('#am-accuracy'),str:$('#am-streak'),mas:$('#am-mastery'),con:$('#am-concepts'),meta:$('#am-meta'),q:$('#am-question'),opts:$('#am-options'),fb:$('#am-feedback')};
    function renderConcepts(){
      el.con.innerHTML='';
      Object.keys(CONCEPTS).forEach(k=>{
        const s=M[k],pct=Math.round(s.mastery*100),locked=!prereqsMet(k);
        const row=document.createElement('div');row.className='am-row'+(locked?' locked':'')+(S.cur===k?' active':'');
        row.innerHTML=`<span class="am-name">${CONCEPTS[k].name}${locked?'<em class="am-lock" aria-label="locked"></em>':''}</span><div class="am-track"><div class="am-fill" style="width:${pct}%"></div></div><span class="am-pct">${pct}%</span><div class="am-dots">${[1,2,3].map(d=>`<i class="am-dot ${d<=s.diff?'on':''}"></i>`).join('')}</div>`;
        el.con.appendChild(row)})}
    function renderStats(){
      el.ans.textContent=S.answered;
      el.acc.textContent=S.answered?Math.round(S.correct/S.answered*100)+'%':'—';
      el.str.textContent=S.streak;
      const keys=Object.keys(CONCEPTS);
      el.mas.textContent=Math.round(keys.reduce((a,k)=>a+M[k].mastery,0)/keys.length*100)+'%'}
    function renderQ(q){
      el.meta.innerHTML=`<span class="am-tag solid">${CONCEPTS[q.concept].name}</span><span class="am-tag">Difficulty ${q.difficulty}</span><span class="am-tag ghost">target ${M[q.concept].diff}</span>`;
      el.q.textContent=q.text;el.opts.innerHTML='';
      shuffle([q.correct,...q.distractors]).forEach((o,i)=>{
        const b=document.createElement('button');b.type='button';b.className='am-option';b.dataset.v=o;
        b.innerHTML=`<span class="l">${'ABCD'[i]}</span><span>${o}</span>`;
        b.addEventListener('click',()=>answer(b,o,q));el.opts.appendChild(b)});
      el.fb.className='am-feedback';el.fb.innerHTML='';S.picked=null;renderConcepts()}
    function answer(btn,chosen,q){
      if(S.picked!==null)return;S.picked=chosen;
      const ok=chosen===q.correct,s=M[q.concept],oldM=s.mastery,oldD=s.diff;
      S.answered++;if(ok){S.correct++;S.streak++}else S.streak=0;
      s.mastery=bkt(s.mastery,ok);stepDiff(q.concept,ok);
      $$('.am-option',el.opts).forEach(o=>{o.classList.add('locked');
        if(o.dataset.v===q.correct)o.classList.add('correct');else if(o===btn)o.classList.add('wrong');else o.classList.add('faded')});
      const prog=s.diff>oldD?`▲ Difficulty up to ${s.diff}`:s.diff<oldD?`▼ Difficulty down to ${s.diff}`:`● Difficulty held at ${s.diff}`;
      el.fb.style.setProperty('--am-delay',CFG.DELAY+'ms');
      el.fb.className='am-feedback '+(ok?'correct':'incorrect');
      el.fb.innerHTML=`<div class="t">${ok?'✓ Correct':'✗ Correct answer: '+q.correct}</div><div>${q.explanation}</div><div class="p">Mastery ${Math.round(oldM*100)}% → ${Math.round(s.mastery*100)}% · ${prog}</div><div class="am-auto"></div>`;
      renderConcepts();renderStats();
      clearTimeout(S.timer);S.timer=setTimeout(()=>{renderQ(S.q=nextQ())},CFG.DELAY)}
    S.q=nextQ();renderQ(S.q);renderStats();
  })();

  // ═══ Section 04 — Wizard simulations ════════════════════════════════════════
  // Engines below (triangle, FBD, gas, enzyme) are the same code that was unit-tested.
  const SIM={};
  (function wizardSims(){
    const stage=$('#sim-panel'); if(!stage) return;
    const canvas=$('#sim-canvas'), ctx=canvas.getContext('2d'), view=canvas.parentElement;
    const el={kicker:$('#sim-kicker'),title:$('#sim-title'),text:$('#sim-text'),readout:$('#sim-readout'),controls:$('#sim-controls'),tip:$('#sim-tip'),fig:$('#sim-fig')};
    const dpr=()=>Math.min(window.devicePixelRatio||1,2);
    let W=0,H=0,raf=0,active=null,cleanups=[];
    const INK='#f8f8f5';
    const on=(t,e,f,o)=>{t.addEventListener(e,f,o);cleanups.push(()=>t.removeEventListener(e,f,o))};
    function resize(){const d=dpr(),r=view.getBoundingClientRect();W=Math.max(10,r.width);H=Math.max(10,r.height);canvas.width=W*d;canvas.height=H*d;ctx.setTransform(d,0,0,d,0,0);active&&active.onResize&&active.onResize()}
    const mk=(html)=>{const d=document.createElement('div');d.innerHTML=html.trim();return d.firstChild};
    function slider(id,label,min,max,step,val,unit,fmt){
      const n=mk(`<div class="ctl"><label for="${id}">${label}<b><span id="${id}-v"></span> ${unit||''}</b></label><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${val}"></div>`);
      const inp=n.querySelector('input'),out=n.querySelector('span');const f=fmt||(v=>(+v).toFixed(step<1?1:0));
      out.textContent=f(val);inp.addEventListener('input',()=>out.textContent=f(inp.value));return {node:n,inp,get v(){return parseFloat(inp.value)},set v(x){inp.value=x;out.textContent=f(x)}};
    }
    const btn=(label,cls)=>{const b=document.createElement('button');b.type='button';b.className='sim-btn '+(cls||'');b.textContent=label;return b};
    const line=(x1,y1,x2,y2,w=1,c=INK,dash)=>{ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.lineWidth=w;ctx.strokeStyle=c;ctx.setLineDash(dash||[]);ctx.stroke();ctx.setLineDash([])};
    const txt=(s,x,y,size=10,c=INK,align='left',ls=1.5,w='500')=>{ctx.font=`${w} ${size}px 'Space Grotesk',sans-serif`;ctx.fillStyle=c;ctx.textAlign=align;ctx.textBaseline='middle';if('letterSpacing' in ctx)ctx.letterSpacing=ls+'px';ctx.fillText(s,x,y);if('letterSpacing' in ctx)ctx.letterSpacing='0px'};
    function arrow(x1,y1,x2,y2,w=2,c=INK,head=9){const a=Math.atan2(y2-y1,x2-x1);line(x1,y1,x2,y2,w,c);ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x2-head*Math.cos(a-.42),y2-head*Math.sin(a-.42));ctx.lineTo(x2-head*Math.cos(a+.42),y2-head*Math.sin(a+.42));ctx.closePath();ctx.fillStyle=c;ctx.fill()}
    const pointerPos=e=>{const r=canvas.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top}};

    // ─────────────────────────── MATHEMATICS ───────────────────────────
    function analyseTriangle(A,B,C){
      const d=(P,Q)=>Math.hypot(P.x-Q.x,P.y-Q.y);
      const a=d(B,C),b=d(A,C),c=d(A,B);
      const ang=(x,y,z)=>{const v=Math.max(-1,Math.min(1,(y*y+z*z-x*x)/(2*y*z)));return Math.acos(v)*180/Math.PI};
      const angles=[ang(a,b,c),ang(b,a,c),ang(c,a,b)];
      const cross=(B.x-A.x)*(C.y-A.y)-(B.y-A.y)*(C.x-A.x),area=Math.abs(cross)/2,perim=a+b+c;
      const degenerate=area<1e-6*Math.max(1,perim*perim)||Math.min(...angles)<.5;
      const eq=(x,y)=>Math.abs(x-y)<=.03*Math.max(x,y);
      const nEq=(eq(a,b)?1:0)+(eq(b,c)?1:0)+(eq(a,c)?1:0);
      const bySide=nEq>=3?'Equilateral':nEq>=1?'Isosceles':'Scalene';
      const maxAng=Math.max(...angles);
      const byAngle=Math.abs(maxAng-90)<=1.5?'Right':maxAng>90?'Obtuse':'Acute';
      return {a,b,c,angles,area,perim,bySide,byAngle,degenerate,rightAt:byAngle==='Right'?angles.indexOf(maxAng):-1,
        name:degenerate?'Degenerate':`${bySide} ${byAngle}`.replace('Equilateral Acute','Equilateral')};
    }
    SIM.math={
      kicker:'MATHEMATICS',title:'Triangle Explorer',fig:'FIG. 03 / DYNAMIC GEOMETRY',
      text:'Drag any corner. The sides and angles update live, and the triangle names itself by its sides and by its angles.',
      tip:'DRAG THE CORNERS · OR USE A PRESET',
      mount(){
        this.P=[{x:.3,y:.72},{x:.72,y:.72},{x:.44,y:.24}]; this.drag=-1; this.hover=-1; this.tgt=null;
        const L=['A','B','C'];
        el.readout.innerHTML=`<div class="rd-name"><small>THIS TRIANGLE IS</small><strong id="m-name">—</strong></div>
          <div class="rd-grid" id="m-angles"></div><div class="rd-grid" id="m-sides"></div><div class="rd-wide" id="m-note"></div>`;
        const presets=[['Equilateral',[[.34,.72],[.66,.72],[.5,.72-.32*Math.sqrt(3)/2*1.0]]],['Right',[[.32,.72],[.7,.72],[.32,.3]]],['Isosceles',[[.3,.72],[.7,.72],[.5,.26]]],['Obtuse',[[.22,.7],[.78,.7],[.36,.5]]],['Scalene',[[.28,.74],[.76,.66],[.5,.24]]]];
        const row=mk('<div class="ctl-row"></div>');
        presets.forEach(([n,pts])=>{const b=btn(n);b.addEventListener('click',()=>{this.tgt=pts.map(p=>({x:p[0],y:p[1]}))});row.appendChild(b)});
        const lab=mk('<div class="ctl"><label>SNAP TO A SHAPE</label></div>');lab.appendChild(row);el.controls.appendChild(lab);
        const px=e=>{const p=pointerPos(e);return {x:p.x/W,y:p.y/H}};
        const hit=p=>{let best=-1,bd=26/Math.min(W,H);this.P.forEach((q,i)=>{const d=Math.hypot((q.x-p.x)*W,(q.y-p.y)*H)/Math.min(W,H);if(d<bd){bd=d;best=i}});return best};
        on(canvas,'pointerdown',e=>{const i=hit(px(e));if(i>=0){this.drag=i;this.tgt=null;canvas.setPointerCapture(e.pointerId);canvas.style.cursor='grabbing'}});
        on(canvas,'pointermove',e=>{const p=px(e);if(this.drag>=0){this.P[this.drag]={x:Math.min(.96,Math.max(.04,p.x)),y:Math.min(.94,Math.max(.06,p.y))}}else{this.hover=hit(p);canvas.style.cursor=this.hover>=0?'grab':'default'}});
        on(canvas,'pointerup',()=>{this.drag=-1;canvas.style.cursor='default'});
        on(canvas,'pointercancel',()=>{this.drag=-1});
        this.L=L;
      },
      frame(){
        if(this.tgt){let done=true;this.P=this.P.map((p,i)=>{const t=this.tgt[i],nx=p.x+(t.x-p.x)*.14,ny=p.y+(t.y-p.y)*.14;if(Math.abs(t.x-nx)>.002||Math.abs(t.y-ny)>.002)done=false;return {x:nx,y:ny}});if(done){this.P=this.tgt;this.tgt=null}}
        const S=Math.min(W,H),P=this.P.map(p=>({x:p.x*W,y:p.y*H})),[A,B,C]=P;
        const T=analyseTriangle(A,B,C),u=T.perim>0?T.perim/12:1; // display units: perimeter = 12 "cm"
        const cen={x:(A.x+B.x+C.x)/3,y:(A.y+B.y+C.y)/3};
        // fill
        ctx.beginPath();ctx.moveTo(A.x,A.y);ctx.lineTo(B.x,B.y);ctx.lineTo(C.x,C.y);ctx.closePath();ctx.fillStyle='rgba(248,248,245,.05)';ctx.fill();
        ctx.lineWidth=2;ctx.strokeStyle=INK;ctx.stroke();
        // angle arcs
        const V=[A,B,C];
        if(!T.degenerate)V.forEach((v,i)=>{
          const n1=V[(i+1)%3],n2=V[(i+2)%3],a1=Math.atan2(n1.y-v.y,n1.x-v.x),a2=Math.atan2(n2.y-v.y,n2.x-v.x);
          let d=a2-a1;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;
          const isRight=T.rightAt===i,r=Math.min(34,S*.075);
          if(isRight){const u1={x:Math.cos(a1),y:Math.sin(a1)},u2={x:Math.cos(a2),y:Math.sin(a2)},s=r*.62;ctx.beginPath();ctx.moveTo(v.x+u1.x*s,v.y+u1.y*s);ctx.lineTo(v.x+(u1.x+u2.x)*s,v.y+(u1.y+u2.y)*s);ctx.lineTo(v.x+u2.x*s,v.y+u2.y*s);ctx.lineWidth=1.6;ctx.strokeStyle=INK;ctx.stroke()}
          else{ctx.beginPath();ctx.arc(v.x,v.y,r,a1,a1+d,d<0);ctx.lineWidth=1.4;ctx.strokeStyle=INK;ctx.stroke()}
          const mid=a1+d/2,lr=r+20;txt(T.angles[i].toFixed(0)+'°',v.x+Math.cos(mid)*lr,v.y+Math.sin(mid)*lr,11,INK,'center',.5,'600');
        });
        // side labels + equal-side ticks
        const sides=[[B,C,T.a,'a'],[A,C,T.b,'b'],[A,B,T.c,'c']];
        const eq=(x,y)=>Math.abs(x-y)<=.03*Math.max(x,y);
        sides.forEach(([p,q,len,nm],i)=>{
          const mx=(p.x+q.x)/2,my=(p.y+q.y)/2;let nx=-(q.y-p.y),ny=q.x-p.x;const nl=Math.hypot(nx,ny)||1;nx/=nl;ny/=nl;
          if((mx+nx-cen.x)*nx+(my+ny-cen.y)*ny<0){nx=-nx;ny=-ny}
          if(!T.degenerate)txt(`${(len/u).toFixed(1)}`,mx+nx*20,my+ny*20,11,'rgba(248,248,245,.75)','center',.5,'500');
          // tick marks for sides equal to another side
          const ties=sides.filter((s,j)=>j!==i&&eq(s[2],len)).length;
          if(ties>0&&!T.degenerate){const ang=Math.atan2(q.y-p.y,q.x-p.x);const k=(T.bySide==='Equilateral')?3:2;for(let t=0;t<k;t++){const off=(t-(k-1)/2)*6;const cx=mx+Math.cos(ang)*off,cy=my+Math.sin(ang)*off;line(cx-nx*6,cy-ny*6,cx+nx*6,cy+ny*6,1.6)}}
        });
        // vertices
        V.forEach((v,i)=>{const act=this.drag===i,hov=this.hover===i;ctx.beginPath();ctx.arc(v.x,v.y,act?11:hov?10:8,0,Math.PI*2);ctx.fillStyle=INK;ctx.fill();if(hov||act){ctx.beginPath();ctx.arc(v.x,v.y,17,0,Math.PI*2);ctx.lineWidth=1;ctx.strokeStyle='rgba(248,248,245,.5)';ctx.stroke()}
          const dx=v.x-cen.x,dy=v.y-cen.y,dl=Math.hypot(dx,dy)||1;txt(this.L[i],v.x+dx/dl*26,v.y+dy/dl*26,10,'rgba(248,248,245,.5)','center',2,'600')});
        // readout
        $('#m-name').textContent=T.name;
        $('#m-angles').innerHTML=T.angles.map((a,i)=>`<div class="rd-cell ${T.rightAt===i||(T.byAngle==='Obtuse'&&a===Math.max(...T.angles))?'hot':''}"><small>ANGLE ${this.L[i]}</small><b>${T.degenerate?'—':a.toFixed(1)+'°'}</b></div>`).join('');
        $('#m-sides').innerHTML=[T.a,T.b,T.c].map((s,i)=>`<div class="rd-cell"><small>SIDE ${'abc'[i]}</small><b>${T.degenerate?'—':(s/u).toFixed(2)}</b></div>`).join('');
        let note='';
        if(T.degenerate)note='The three points lie on a line, so they do not form a triangle.';
        else{const sum=T.angles.reduce((a,b)=>a+b,0);const big=T.angles.indexOf(Math.max(...T.angles));
          note=`${T.bySide==='Equilateral'?'All three sides are equal.':T.bySide==='Isosceles'?'Two sides are equal, so two angles are equal.':'All three sides differ, so all three angles differ.'} `+
          (T.byAngle==='Right'?`Angle ${this.L[T.rightAt]} is exactly 90°.`:T.byAngle==='Obtuse'?`Angle ${this.L[big]} is greater than 90°.`:'Every angle is below 90°.')+` Angles sum to ${sum.toFixed(0)}°.`}
        $('#m-note').textContent=note;
      }
    };

    // ─────────────────────────── PHYSICS ───────────────────────────
    const G=9.81;
    function fbd({m,theta,Fapp,mu,moving,v}){
      const th=theta*Math.PI/180,Wt=m*G,Wpar=Wt*Math.sin(th),Wperp=Wt*Math.cos(th),N=Wperp,muS=mu,muK=.8*mu;
      const drive=Fapp-Wpar,fsMax=muS*N;let f,state;
      if(!moving&&Math.abs(drive)<=fsMax){f=-drive;state='static'}
      else{const dir=moving?(Math.sign(v)||Math.sign(drive)):Math.sign(drive);f=-dir*muK*N;state='kinetic'}
      const net=drive+f,a=state==='static'?0:net/m;
      return {W:Wt,Wpar,Wperp,N,f,fsMax,drive,net,a,state};
    }
    SIM.physics={
      kicker:'PHYSICS',title:'Free Body Diagram',fig:'FIG. 03 / FORCES',
      text:'Every force on the block is drawn as an arrow whose length is its size. Push, tilt and change the friction, then watch the net force decide the motion.',
      tip:'ARROW LENGTH = FORCE · DRAG THE BLOCK TO RESET',
      mount(){
        this.s=0;this.v=0;this.moving=false;this.trail=[];
        el.readout.innerHTML=`<div class="rd-name"><small>BLOCK IS</small><strong id="p-state">—</strong></div>
          <div class="rd-grid" id="p-a"></div><div class="rd-grid" id="p-b"></div><div class="rd-wide" id="p-note"></div>`;
        this.c={F:slider('c-f','APPLIED FORCE',-150,150,1,25,'N',v=>(v>0?'+':'')+Math.round(v)),m:slider('c-m','MASS',1,30,1,10,'kg'),th:slider('c-th','INCLINE',0,45,1,0,'°'),mu:slider('c-mu','FRICTION μ',0,1,.05,.4,'',v=>(+v).toFixed(2))};
        Object.values(this.c).forEach(s=>el.controls.appendChild(s.node));
        const r=btn('Reset block');r.addEventListener('click',()=>{this.s=0;this.v=0;this.moving=false});el.controls.appendChild(r);
        this.c.F.inp.addEventListener('input',()=>{if(!this.moving)this.moving=false});
        this.last=performance.now();
      },
      frame(now){
        const dt=Math.min(.033,(now-this.last)/1000);this.last=now;
        const P={m:this.c.m.v,theta:this.c.th.v,Fapp:this.c.F.v,mu:this.c.mu.v,moving:this.moving,v:this.v};
        let R=fbd(P);
        // integrate
        if(R.state==='kinetic'){
          const vNew=this.v+R.a*dt;
          // friction cannot reverse the motion by itself: if it would flip the sign, the block stops
          if(this.moving&&Math.sign(vNew)!==Math.sign(this.v)&&this.v!==0){this.v=0;this.moving=false}
          else{this.v=vNew;this.moving=true}
        }else{this.v=0;this.moving=false}
        this.s+=this.v*dt;
        const trackLen=6;                                     // metres of visible track
        if(this.s>trackLen/2){this.s=trackLen/2;this.v=0;this.moving=false}
        if(this.s<-trackLen/2){this.s=-trackLen/2;this.v=0;this.moving=false}
        R=fbd({...P,moving:this.moving,v:this.v});
        // ---- geometry ----
        const th=P.theta*Math.PI/180,S=Math.min(W,H);
        const th0=P.theta*Math.PI/180,mx=64,my=70;
        const len=Math.max(200,Math.min((W-mx*2)/Math.max(.2,Math.cos(th0)),(H*.62-my)*2/Math.max(.05,Math.sin(th0)),880)),half=len/2;
        const pivot={x:W*.5,y:Math.min(H*.70,H-my-half*Math.sin(th0)-30)};
        const ux=Math.cos(th),uy=-Math.sin(th);                // up-slope unit vector (screen coords, y down)
        const nx=Math.sin(th),ny=-Math.cos(th);                // outward normal (points away from surface)
        const p0={x:pivot.x-ux*half,y:pivot.y-uy*half},p1={x:pivot.x+ux*half,y:pivot.y+uy*half};
        line(p0.x,p0.y,p1.x,p1.y,2,INK);
        const hn=Math.floor(len/20);
        for(let i=0;i<=hn;i++){const t=i/hn,x=p0.x+(p1.x-p0.x)*t,y=p0.y+(p1.y-p0.y)*t;line(x,y,x-nx*11-ux*6,y-ny*11-uy*6,1,'rgba(248,248,245,.32)')}   // hatch sits BELOW the surface
        if(th>0){ctx.beginPath();ctx.moveTo(p0.x,p0.y);ctx.lineTo(p1.x,p0.y);ctx.lineTo(p1.x,p1.y);ctx.setLineDash([3,6]);ctx.strokeStyle='rgba(248,248,245,.28)';ctx.lineWidth=1;ctx.stroke();ctx.setLineDash([]);
          ctx.beginPath();ctx.arc(p0.x,p0.y,50,-th,0);ctx.strokeStyle='rgba(248,248,245,.75)';ctx.lineWidth=1.2;ctx.stroke();txt(P.theta.toFixed(0)+'°',p0.x+74,p0.y-14,11,INK,'center',.5,'600')}
        // block: its bottom edge lies exactly on the surface line
        const bs=Math.max(56,Math.min(76,S*.10+P.m*.5)),tPos=(this.s/trackLen)*len*.8;
        const foot={x:pivot.x+ux*tPos,y:pivot.y+uy*tPos};          // point on the surface under the block
        const bc={x:foot.x+nx*(bs/2-1),y:foot.y+ny*(bs/2-1)};              // block centre, half a block-height above the surface
        ctx.save();ctx.translate(bc.x,bc.y);ctx.rotate(-th);ctx.beginPath();ctx.rect(-bs/2,-bs/2,bs,bs);ctx.fillStyle='#0b0b0b';ctx.fill();ctx.lineWidth=2;ctx.strokeStyle=INK;ctx.stroke();ctx.restore();
        // ---- force arrows: all tails at the centre of mass; length ∝ force (capped) ----
        const fmax=Math.max(R.W,Math.abs(P.Fapp),R.N,Math.abs(R.f),1),k=Math.min(2.2,(S*.19)/fmax);
        // Each label sits just past its arrow tip, then is pushed apart from labels already placed
        // (steep slopes make N and friction point almost the same way, so their labels would collide).
        const placed=[];
        const drawF=(dx,dy,mag,label)=>{if(mag<.5)return;const Lm=Math.hypot(dx,dy)||1,ex=dx/Lm,ey=dy/Lm,alen=Math.max(bs*.5+16,bs*.5+mag*k);
          const tail={x:bc.x+ex*bs*.5*.9,y:bc.y+ey*bs*.5*.9},tip={x:bc.x+ex*alen,y:bc.y+ey*alen};
          arrow(tail.x,tail.y,tip.x,tip.y,2.4,INK,10);
          let lx=tip.x+ex*22,ly=tip.y+ey*16;
          ctx.font="600 10px 'Space Grotesk',sans-serif";const tw=ctx.measureText(label).width+14,th2=16;
          for(let tries=0;tries<12;tries++){                       // nudge sideways until the label box is clear of earlier ones
            const hit=placed.find(p=>Math.abs(p.x-lx)<(p.w+tw)/2&&Math.abs(p.y-ly)<(p.h+th2)/2);
            if(!hit)break;
            const px=-ey,py=ex,side=((lx-hit.x)*px+(ly-hit.y)*py)>=0?1:-1;   // move perpendicular to the arrow, away from the collision
            lx+=px*side*14;ly+=py*side*14+(tries%2?8:-8)}
          lx=Math.min(W-tw/2-8,Math.max(tw/2+8,lx));ly=Math.min(H-18,Math.max(20,ly));
          placed.push({x:lx,y:ly,w:tw,h:th2});
          txt(label,lx,ly,10,INK,'center',.5,'600')};
        drawF(0,1,R.W,`W ${R.W.toFixed(0)} N`);
        drawF(nx,ny,R.N,`N ${R.N.toFixed(0)} N`);
        if(Math.abs(P.Fapp)>=.5)drawF(ux*Math.sign(P.Fapp),uy*Math.sign(P.Fapp),Math.abs(P.Fapp),`F ${Math.abs(P.Fapp).toFixed(0)} N`);
        if(Math.abs(R.f)>=.5)drawF(ux*Math.sign(R.f),uy*Math.sign(R.f),Math.abs(R.f),`f ${Math.abs(R.f).toFixed(0)} N`);
        txt(P.m.toFixed(0)+' kg',bc.x,bc.y-8,11,INK,'center',1,'600');
        ctx.beginPath();ctx.arc(bc.x,bc.y+15,3,0,Math.PI*2);ctx.fillStyle=INK;ctx.fill();
        // net force badge on canvas
        const net=R.state==='static'?0:R.net;
        txt('NET FORCE ALONG SLOPE',W-28,30,9,'rgba(248,248,245,.55)','right',1.6);
        txt((net>=0?'+':'')+net.toFixed(1)+' N',W-28,58,26,INK,'right',-.5,'600');
        if(this.moving)txt('v = '+this.v.toFixed(2)+' m/s',W-28,86,11,'rgba(248,248,245,.7)','right',.5);
        // ---- readout ----
        const isMoving=Math.abs(this.v)>.02,balanced=Math.abs(net)<.3;
        // two facts decide the label: is it moving, and do the forces balance?
        const label=!isMoving?(balanced?(R.state==='static'&&Math.abs(R.f)>.5?'Held by friction':'In equilibrium'):'Starting to move')
                             :(balanced?'Coasting: net force is zero':(this.v>=0?'Sliding up the slope':'Sliding down the slope'));
        $('#p-state').textContent=label;
        $('#p-a').innerHTML=`<div class="rd-cell"><small>WEIGHT</small><b>${R.W.toFixed(1)} N</b></div><div class="rd-cell"><small>NORMAL</small><b>${R.N.toFixed(1)} N</b></div><div class="rd-cell"><small>FRICTION</small><b>${R.f>=0?'+':''}${R.f.toFixed(1)} N</b></div>`;
        $('#p-b').innerHTML=`<div class="rd-cell"><small>NET FORCE</small><b>${net>=0?'+':''}${net.toFixed(1)} N</b></div><div class="rd-cell"><small>ACCEL.</small><b>${R.a.toFixed(2)} m/s²</b></div><div class="rd-cell"><small>MAX STATIC f</small><b>${R.fsMax.toFixed(1)} N</b></div>`;
        $('#p-note').textContent=R.state==='static'?(Math.abs(R.drive)<.05?'The applied force exactly balances the slope component of weight, so the net force is zero.':`Friction supplies ${Math.abs(R.f).toFixed(1)} N to cancel the push. It can give up to ${R.fsMax.toFixed(1)} N, so the block does not move.`):(Math.abs(net)<.3?'The forces cancel, so the velocity stays constant. Newton\'s first law: no net force, no change in motion.':`The forces no longer balance (static limit ${R.fsMax.toFixed(1)} N), so the block accelerates. Kinetic friction is smaller than static.`);
      }
    };

    // ─────────────────────────── CHEMISTRY ───────────────────────────
    function makeGas({n,T,L}){
      const H=100,sd=Math.sqrt(T),gauss=()=>{let u=0,v=0;while(u===0)u=Math.random();v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)};
      const p=[];for(let i=0;i<n;i++)p.push({x:2+Math.random()*(L-4),y:2+Math.random()*(H-4),vx:gauss()*sd,vy:gauss()*sd});
      const gas={p,L,H,T,impulse:0,time:0,
        thermostat(){const ke=this.p.reduce((a,q)=>a+.5*(q.vx*q.vx+q.vy*q.vy),0)/this.p.length;if(ke>0){const k=Math.sqrt(this.T/ke);this.p.forEach(q=>{q.vx*=k;q.vy*=k})}},
        setTemp(nt){this.T=nt;this.thermostat()},
        setCount(n2,T2,L2){while(this.p.length<n2){const sd2=Math.sqrt(T2),g=()=>{let u=0,v=0;while(u===0)u=Math.random();v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)};this.p.push({x:2+Math.random()*(L2-4),y:2+Math.random()*(this.H-4),vx:g()*sd2,vy:g()*sd2})}while(this.p.length>n2)this.p.pop();this.T=T2;this.thermostat()},
        step(dt){this.time+=dt;for(const q of this.p){q.x+=q.vx*dt;q.y+=q.vy*dt;
          if(q.x<0){q.x=-q.x;q.vx=-q.vx;this.impulse+=2*Math.abs(q.vx)}else if(q.x>this.L){q.x=2*this.L-q.x;q.vx=-q.vx;this.impulse+=2*Math.abs(q.vx)}
          if(q.y<0){q.y=-q.y;q.vy=-q.vy;this.impulse+=2*Math.abs(q.vy)}else if(q.y>this.H){q.y=2*this.H-q.y;q.vy=-q.vy;this.impulse+=2*Math.abs(q.vy)}}},
        resetMeter(){this.impulse=0;this.time=0},
        pressure(){return this.time>0?this.impulse/(this.time*2*(this.L+this.H)):0},
        setVolume(nl){this.L=nl;for(const q of this.p){if(q.x>nl)q.x=Math.max(0,nl-((q.x-nl)%nl||1))}}};
      gas.thermostat();return gas;
    }
    SIM.chemistry={
      kicker:'CHEMISTRY',title:'Gas in a Container',fig:'FIG. 03 / STATES OF MATTER',
      text:'Every particle is simulated. Pressure is not a formula here: it is measured from the particles hitting the walls. Heat it, squeeze it, add more.',
      tip:'PRESSURE IS COUNTED FROM COLLISIONS',
      mount(){
        this.hist=[];this.acc=0;this.win=[];this.shownP=0;this.shownKE=0;
        el.readout.innerHTML=`<div class="rd-name"><small>YOU ARE OBSERVING</small><strong id="g-law">—</strong></div>
          <div class="rd-grid" id="g-a"></div><div class="rd-grid" id="g-b"></div><div class="rd-wide" id="g-note"></div>`;
        this.c={T:slider('c-t','TEMPERATURE',10,150,1,50,'K',v=>Math.round(v)),V:slider('c-v','VOLUME',30,100,1,100,'%',v=>Math.round(v)),N:slider('c-n','PARTICLES',20,200,1,80,'',v=>Math.round(v))};
        Object.values(this.c).forEach(s=>el.controls.appendChild(s.node));
        const rb=btn('Set current state as start');rb.addEventListener('click',()=>{this.p0=0;this.ref=null;this.changed=null;this.gas.resetMeter();this.win=[];this.fullWin=0});el.controls.appendChild(rb);
        this.gas=makeGas({n:this.c.N.v,T:this.c.T.v,L:this.c.V.v});
        this.prev={T:this.c.T.v,V:this.c.V.v,N:this.c.N.v};this.changed=null;
        this.c.T.inp.addEventListener('input',()=>{this.gas.setTemp(this.c.T.v);this.reset('T')});
        this.c.V.inp.addEventListener('input',()=>{this.gas.setVolume(this.c.V.v);this.gas.thermostat();this.reset('V')});
        this.c.N.inp.addEventListener('input',()=>{this.gas.setCount(this.c.N.v,this.c.T.v,this.c.V.v);this.reset('N')});
        this.last=performance.now();
      },
      reset(k){this.gas.resetMeter();this.win=[];this.changed=k;this.pRef=0},
      frame(now){
        const dt=Math.min(.033,(now-this.last)/1000);this.last=now;const g=this.gas;
        for(let i=0;i<4;i++)g.step(dt*1.6);
        this.win.push({t:g.time,imp:g.impulse});while(this.win.length>1&&g.time-this.win[0].t>6)this.win.shift();
        const w0=this.win[0],dT=g.time-w0.t,P=dT>.3?(g.impulse-w0.imp)/(dT*2*(g.L+g.H)):this.shownP;
        this.shownP+=(P-this.shownP)*.06;
        this.settling=dT<5.4;                       // the window is trimmed to ~6 s, so 'full' has to mean nearly 6 s, not more than 6 s
                               // time-based only: the 6 s window is either full or it is not (no flicker)
        if(!this.settling){                       // window is full: P is a clean 6 s average
          this.fullWin=(this.fullWin||0)+1;
          if(!this.p0&&!this.changed&&this.fullWin>30){this.p0=P;this.ref={T:g.T,V:g.L,N:g.p.length}}   // baseline = raw 6 s mean at the untouched sliders
        }else this.fullWin=0;
        // drawing: box occupies a rectangle, aspect from real L,H
        const padX=44,padY=54,boxW0=W-padX*2,boxH=H-padY*2,boxW=boxW0*(g.L/100);
        const bx=padX,by=padY;
        ctx.fillStyle='rgba(248,248,245,.03)';ctx.fillRect(bx,by,boxW,boxH);
        ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.strokeRect(bx,by,boxW,boxH);
        // movable piston (right wall)
        ctx.fillStyle=INK;ctx.fillRect(bx+boxW,by,10,boxH);
        for(let i=0;i<8;i++)line(bx+boxW+10,by+(i+.5)*boxH/8,bx+boxW+26,by+(i+.5)*boxH/8,1,'rgba(248,248,245,.4)');
        // particles coloured by speed: fast = solid bright, slow = hollow
        const vmax=Math.sqrt(g.T)*2.2;
        for(const q of g.p){const sp=Math.hypot(q.vx,q.vy),f=Math.min(1,sp/vmax),x=bx+(q.x/g.L)*boxW,y=by+(q.y/g.H)*boxH,r=3.2+f*1.6;
          ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);
          if(f>.5){ctx.fillStyle=`rgba(248,248,245,${.55+f*.45})`;ctx.fill()}else{ctx.lineWidth=1.3;ctx.strokeStyle=`rgba(248,248,245,${.5+f})`;ctx.stroke()}}
        // pressure gauge: laid out from the canvas width so nothing is clipped on phones
        const narrow=W<520,gx=bx,gy=18,numW=44;
        txt('MEASURED PRESSURE',gx,gy,9,'rgba(248,248,245,.55)','left',1.6);
        if(this.shownP>(this.pRef||0)*.9||!this.pRef)this.pRef=Math.max(this.shownP*1.6,20);
        ctx.font="500 9px 'Space Grotesk',sans-serif";if('letterSpacing' in ctx)ctx.letterSpacing='1.6px';const lblW=ctx.measureText('MEASURED PRESSURE').width;if('letterSpacing' in ctx)ctx.letterSpacing='0px';const barX=gx+lblW+14;
        const gw=Math.max(50,Math.min(132,W-barX-numW-24));ctx.strokeStyle='rgba(248,248,245,.3)';ctx.lineWidth=1;ctx.strokeRect(barX,gy-4,gw,8);ctx.fillStyle=INK;ctx.fillRect(barX,gy-4,gw*Math.min(1,this.shownP/this.pRef),8);
        txt(this.shownP.toFixed(1),barX+gw+10,gy,13,INK,'left',0,'600');
        // ---- readout ----
        const Vv=g.L/100,n=g.p.length,ke=g.p.reduce((a,q)=>a+.5*(q.vx*q.vx+q.vy*q.vy),0)/n,PV=this.shownP*(g.L*g.H),NT=n*g.T;
        const law={T:'Gay-Lussac: pressure rises with temperature',V:"Boyle's law: squeezing raises pressure",N:"Avogadro: more particles, more collisions"}[this.changed]||'Particles in motion';
        $('#g-law').textContent=law;
        $('#g-a').innerHTML=`<div class="rd-cell"><small>PRESSURE</small><b>${this.shownP.toFixed(1)}</b></div><div class="rd-cell"><small>TEMPERATURE</small><b>${g.T.toFixed(0)} K</b></div><div class="rd-cell"><small>VOLUME</small><b>${(Vv*100).toFixed(0)}%</b></div>`;
        $('#g-b').innerHTML=`<div class="rd-cell"><small>PARTICLES</small><b>${n}</b></div><div class="rd-cell"><small>AVG. KINETIC E</small><b>${ke.toFixed(0)}</b></div><div class="rd-cell"><small>PRESSURE × START</small><b>${!this.settling&&this.p0?('×'+(this.shownP/this.p0).toFixed(1)):'…'}</b></div>`;
        $('#g-note').textContent=(this.ref?`Pressure should scale as n·T ÷ V. From the start, that predicts ×${((n*g.T/g.L)/(this.ref.N*this.ref.T/this.ref.V)).toFixed(1)}. The reading is counted from real collisions, so it wobbles a little around that.`:'Average kinetic energy tracks temperature. Pressure is counted from real collisions with the wall.');
      }
    };

    // ─────────────────────────── BIOLOGY ───────────────────────────
    // Mass-action kinetics. Km = (koff+kcat)/kon = 30, Ki = kIoff/kIon = 20. Rates are per molecule per second.
    const EK={kon:.04,koff:.2,kcat:1,kIon:.01,kIoff:.2},EKM=(EK.koff+EK.kcat)/EK.kon,EKI=EK.kIoff/EK.kIon;
    // Steady-state rate with substrate depletion: free substrate = total - enzyme-substrate complex (solved by iteration).
    function mm({S,E,I=0}){let Sf=S,ES=0;const a=1+I/EKI;for(let i=0;i<200;i++){ES=E*Sf/(EKM*a+Sf);Sf=Math.max(0,S-ES)}return {v:EK.kcat*ES,Vmax:EK.kcat*E}}
    SIM.biology={
      kicker:'BIOLOGY',title:'Enzyme at Work',fig:'FIG. 03 / LIFE SYSTEMS',
      text:'Enzymes are the machines of the cell. Add substrate and the reaction speeds up, until every enzyme is busy. Then add an inhibitor and watch it compete for the same site.',
      tip:'FILLED DOT = SUBSTRATE · TRIANGLE = INHIBITOR · NOTCHED CIRCLE = ENZYME',
      mount(){
        this.nE=14;this.enz=[];this.subs=[];this.inh=[];this.prods=[];this.fly=[];this.pcount=0;this.hist=[];this.t=0;this.rateShown=0;this.win=[];
        el.readout.innerHTML=`<div class="rd-name"><small>REACTION RATE</small><strong id="b-rate">—</strong></div>
          <div class="rd-grid" id="b-a"></div><div class="rd-wide" id="b-note"></div>`;
        this.c={S:slider('c-s','SUBSTRATE',0,120,1,40,'',v=>Math.round(v)),I:slider('c-i','INHIBITOR',0,80,1,0,'',v=>Math.round(v))};
        Object.values(this.c).forEach(s=>el.controls.appendChild(s.node));
        this.rand=(a,b)=>a+Math.random()*(b-a);this.last=performance.now();this.built=false;
        this.onResize=()=>{this.built=false};
      },
      build(){
        const narrow=W<520,m=narrow?26:44;this.enz=[];const cols=7,rows=2;
        for(let i=0;i<this.nE;i++){const c=i%cols,r=Math.floor(i/cols);this.enz.push({x:m+(W-m*2)*(c+.5)/cols,y:H*(narrow?.20:.30)+r*H*(narrow?.17:.22),st:'free',t:0,who:null})}
        this.built=true;
      },
      spawn(kind){const side=Math.random()<.5;return {x:this.rand(20,W-20),y:this.rand(H*.12,H*.92),vx:this.rand(-1,1)*38,vy:this.rand(-1,1)*38,kind,life:0}},
      frame(now){
        if(!this.built)this.build();
        const dt=Math.min(.033,(now-this.last)/1000);this.last=now;this.t+=dt;
        const targetS=Math.round(this.c.S.v),targetI=Math.round(this.c.I.v);
        const count=k=>this[k].length;
        // keep free populations at target (bound ones are held by enzymes)
        const nBoundS=this.enz.filter(e=>e.st==='S').length,nBoundI=this.enz.filter(e=>e.st==='I').length;
        while(this.subs.length+nBoundS<targetS)this.subs.push(this.spawn('S'));
        while(this.subs.length+nBoundS>targetS&&this.subs.length)this.subs.pop();
        while(this.inh.length+nBoundI<targetI)this.inh.push(this.spawn('I'));
        while(this.inh.length+nBoundI>targetI&&this.inh.length)this.inh.pop();
        const move=q=>{q.x+=q.vx*dt;q.y+=q.vy*dt;q.vx+=(Math.random()-.5)*60*dt;q.vy+=(Math.random()-.5)*60*dt;const sp=Math.hypot(q.vx,q.vy);if(sp>60){q.vx*=60/sp;q.vy*=60/sp}
          if(q.x<8){q.x=8;q.vx=Math.abs(q.vx)}if(q.x>W-8){q.x=W-8;q.vx=-Math.abs(q.vx)}if(q.y<8){q.y=8;q.vy=Math.abs(q.vy)}if(q.y>H-8){q.y=H-8;q.vy=-Math.abs(q.vy)}};
        this.subs.forEach(move);this.inh.forEach(move);
        // enzyme logic: binding is decided by concentration (mass action); the winning particle is then drawn flying in.
        const R=17;
        const boundS=this.enz.filter(x=>x.st==='S').length,boundI=this.enz.filter(x=>x.st==='I').length;
        const fS=Math.max(0,targetS-boundS),fI=Math.max(0,targetI-boundI);
        for(const e of this.enz){
          if(e.st==='free'){
            const a=EK.kon*fS*dt,b=EK.kIon*fI*dt,pAny=1-Math.exp(-(a+b));
            if(Math.random()<pAny){
              const kind=Math.random()<a/(a+b)?'S':'I',arr=kind==='S'?this.subs:this.inh;
              let bi=-1,bd=1e9;for(let i=0;i<arr.length;i++){const d=Math.hypot(arr[i].x-e.x,arr[i].y-e.y);if(d<bd){bd=d;bi=i}}
              if(bi>=0){const q=arr.splice(bi,1)[0];this.fly.push({x:q.x,y:q.y,kind,to:e,life:0})}
              e.st=kind;e.t=0;                          // occupied immediately: the animation must not change the kinetics
            }
          }else if(e.st==='S'){
            e.t+=dt;const r=Math.random(),pc=1-Math.exp(-EK.kcat*dt),pu=1-Math.exp(-(EK.kcat+EK.koff)*dt);
            if(r<pc){this.pcount++;this.win.push(this.t);this.prods.push({x:e.x,y:e.y,vx:this.rand(-1,1)*60,vy:this.rand(-1,-.3)*70,life:0});e.st='free';e.t=0}
            else if(r<pu){e.st='free';e.t=0}
          }else if(e.st==='I'){
            e.t+=dt;if(Math.random()<1-Math.exp(-EK.kIoff*dt)){e.st='free';e.t=0}
          }
        }
        this.fly=this.fly.filter(f=>{f.life+=dt;const k=Math.min(1,f.life/.22);f.x+=(f.to.x-f.x)*(.25+k*.5);f.y+=(f.to.y-f.y)*(.25+k*.5);return k<1});   // visual only

        // products: fly off and fade (substrate is replenished by the target-holding logic above)
        this.prods.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.life+=dt});this.prods=this.prods.filter(p=>p.life<1.1);
        while(this.win.length&&this.t-this.win[0]>6)this.win.shift();
        const span=Math.min(6,this.t),rate=span>1?this.win.length/span:0;this.rateShown+=(rate-this.rateShown)*.08;
        // ── draw particles ──
        for(const q of this.subs){ctx.beginPath();ctx.arc(q.x,q.y,4.2,0,Math.PI*2);ctx.fillStyle=INK;ctx.fill()}
        for(const q of this.inh){ctx.beginPath();const s=5.5;ctx.moveTo(q.x,q.y-s);ctx.lineTo(q.x+s,q.y+s*.8);ctx.lineTo(q.x-s,q.y+s*.8);ctx.closePath();ctx.lineWidth=1.4;ctx.strokeStyle=INK;ctx.stroke()}
        for(const f of this.fly){ctx.beginPath();if(f.kind==='S'){ctx.arc(f.x,f.y,4.2,0,Math.PI*2);ctx.fillStyle=INK;ctx.fill()}else{const s=5.5;ctx.moveTo(f.x,f.y-s);ctx.lineTo(f.x+s,f.y+s*.8);ctx.lineTo(f.x-s,f.y+s*.8);ctx.closePath();ctx.lineWidth=1.4;ctx.strokeStyle=INK;ctx.stroke()}}
        for(const p of this.prods){const a=1-p.life/1.1;ctx.beginPath();ctx.arc(p.x,p.y,3.4,0,Math.PI*2);ctx.strokeStyle=`rgba(248,248,245,${a})`;ctx.lineWidth=1.3;ctx.stroke();txt('+',p.x+8,p.y-8,10,`rgba(248,248,245,${a})`,'center',0,'600')}
        // ── draw enzymes: a circle with an active-site notch ──
        for(const e of this.enz){
          ctx.save();ctx.translate(e.x,e.y);
          ctx.beginPath();ctx.arc(0,0,R,.42,Math.PI*2-.42);ctx.lineTo(R*.45,-R*.2);ctx.arc(R*.55,0,R*.36,-Math.PI/2*1.05,Math.PI/2*1.05,true);ctx.closePath();
          ctx.fillStyle=e.st==='free'?'#0b0b0b':e.st==='S'?INK:'#0b0b0b';ctx.fill();ctx.lineWidth=2;ctx.strokeStyle=INK;ctx.stroke();
          if(e.st==='S'){ctx.beginPath();ctx.arc(R*.55,0,4.4,0,Math.PI*2);ctx.fillStyle='#050505';ctx.fill();const pr=Math.min(1,e.t/1.0);ctx.beginPath();ctx.arc(-2,0,R*.62,-Math.PI/2,-Math.PI/2+pr*Math.PI*2);ctx.lineWidth=2;ctx.strokeStyle='#050505';ctx.stroke()}
          if(e.st==='I'){const s=6;ctx.beginPath();ctx.moveTo(R*.5,-s);ctx.lineTo(R*.5+s,s*.8);ctx.lineTo(R*.5-s,s*.8);ctx.closePath();ctx.fillStyle=INK;ctx.fill();ctx.beginPath();ctx.moveTo(-9,-9);ctx.lineTo(9,9);ctx.moveTo(9,-9);ctx.lineTo(-9,9);ctx.lineWidth=1.4;ctx.strokeStyle='rgba(248,248,245,.55)';ctx.stroke()}
          ctx.restore();
        }
        // ── mini rate curve (theory) with live marker ──
        const small=W<520,cw=small?Math.min(120,W*.34):Math.min(210,W*.3),ch=small?64:92,cx0=W-cw-(small?24:28),cy0=H-ch-(small?44:34);
        ctx.fillStyle='#050505';ctx.fillRect(cx0-16,cy0-34,cw+32,ch+58);ctx.strokeStyle='rgba(248,248,245,.22)';ctx.lineWidth=1;ctx.strokeRect(cx0-16,cy0-34,cw+32,ch+58);
        txt(small?'RATE':'RATE vs SUBSTRATE',cx0,cy0-16,9,'rgba(248,248,245,.55)','left',1.6);
        ctx.strokeStyle='rgba(248,248,245,.3)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(cx0,cy0);ctx.lineTo(cx0,cy0+ch);ctx.lineTo(cx0+cw,cy0+ch);ctx.stroke();
        const Emax=this.nE,curve=(I)=>{ctx.beginPath();for(let i=0;i<=60;i++){const S=120*i/60,y=mm({S,E:Emax,I}).v/Emax;const px=cx0+cw*i/60,py=cy0+ch-ch*.94*y;i?ctx.lineTo(px,py):ctx.moveTo(px,py)}};
        curve(0);ctx.strokeStyle='rgba(248,248,245,.4)';ctx.setLineDash([3,4]);ctx.lineWidth=1.2;ctx.stroke();ctx.setLineDash([]);
        if(targetI>0){curve(targetI);ctx.strokeStyle=INK;ctx.lineWidth=1.8;ctx.stroke()}
        const yTheory=mm({S:targetS,E:Emax,I:targetI}).v/Emax;
        const mkx=cx0+cw*targetS/120,mky=cy0+ch-ch*.94*yTheory;ctx.beginPath();ctx.arc(mkx,mky,9,0,Math.PI*2);ctx.strokeStyle='rgba(248,248,245,.5)';ctx.lineWidth=1;ctx.stroke();ctx.beginPath();ctx.arc(mkx,mky,4.5,0,Math.PI*2);ctx.fillStyle=INK;ctx.fill();
        txt('substrate →',cx0+cw,cy0+ch+13,8,'rgba(248,248,245,.5)','right',.8);
        // readout
        const busy=this.enz.filter(e=>e.st==='S').length,blocked=this.enz.filter(e=>e.st==='I').length,free=this.nE-busy-blocked;
        $('#b-rate').textContent=this.rateShown.toFixed(1)+' products / s';
        $('#b-a').innerHTML=`<div class="rd-cell"><small>WORKING</small><b>${busy}</b></div><div class="rd-cell"><small>BLOCKED</small><b>${blocked}</b></div><div class="rd-cell"><small>WAITING</small><b>${free}</b></div>`;
        $('#b-note').textContent=targetI>0?'The inhibitor sits in the active site and competes with the substrate. Raise the substrate and it wins the site back, so the curve reaches the same top speed.':(targetS<25?'Few substrate molecules, so most enzymes are waiting. The rate is limited by collisions.':targetS>80?'Almost every enzyme is busy. More substrate barely helps: the rate has saturated.':'The rate is climbing as more enzymes find substrate.');
      }
    };

    // ─────────────────────────── framework ───────────────────────────
    function loop(now){if(!active)return;ctx.clearRect(0,0,W,H);active.frame(now);raf=requestAnimationFrame(loop)}
    function stop(){cancelAnimationFrame(raf);raf=0;cleanups.forEach(f=>f());cleanups=[];active=null}
    let started=false;                                   // any explicit show() counts: never let the observer overwrite a user's choice
    function show(world){
      const S=SIM[world];if(!S)return;started=true;stop();
      el.controls.innerHTML='';el.readout.innerHTML='';canvas.style.cursor='default';
      stage.dataset.world=world;el.kicker.textContent=S.kicker;el.title.textContent=S.title;el.text.textContent=S.text;el.tip.textContent=S.tip;el.fig.textContent=S.fig;
      $$('.wizard-card').forEach(c=>c.setAttribute('aria-selected',c.dataset.world===world?'true':'false'));
      active=S;resize();S.mount();
      if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches&&world!=='math'){/* still animate: simulation is the content, not decoration */}
      raf=requestAnimationFrame(loop);
    }
    $$('.wizard-card').forEach(c=>{c.addEventListener('click',()=>show(c.dataset.world))});
    // roving arrow-key navigation across the tablist
    const tabs=$$('.wizard-card');tabs.forEach((t,i)=>t.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();const n=tabs[(i+(e.key==='ArrowRight'?1:tabs.length-1))%tabs.length];n.focus();n.click()}}));
    addEventListener('resize',resize);
    // only run while the section is on screen
    const io='IntersectionObserver' in window?new IntersectionObserver(es=>es.forEach(en=>{
      if(en.isIntersecting){if(!started){started=true;show('math')}else if(!raf&&active){raf=requestAnimationFrame(loop)}}
      else{cancelAnimationFrame(raf);raf=0}
    }),{threshold:.08}):null;
    if(io)io.observe(stage);else show('math');
  })();

  // Section 06 — Discipline network: hover, focus or tap a node to see its name
  // and light up the connections that touch it. Click/tap locks it (for touch).
  (function(){
    const mark=$('#mn-mark'); if(!mark)return;
    const hits=$$('.mn-hit',mark),nodes=$$('.mn-node',mark),edges=$$('.edge',mark);
    let hover=null,lock=null;
    function paint(){
      const s=lock||hover;
      hits.forEach(b=>b.classList.toggle('is-active',b.dataset.subject===s));
      nodes.forEach(n=>n.classList.toggle('is-active',n.dataset.subject===s));
      edges.forEach(e=>e.classList.toggle('is-active',!!s&&e.classList.contains('e-'+s)));
    }
    hits.forEach(b=>{
      const s=b.dataset.subject;
      b.addEventListener('mouseenter',()=>{hover=s;paint()});
      b.addEventListener('mouseleave',()=>{hover=null;paint()});
      b.addEventListener('focus',()=>{hover=s;paint()});
      b.addEventListener('blur',()=>{hover=null;paint()});
      b.addEventListener('click',()=>{lock=lock===s?null:s;paint()});
    });
  })();

  // Section 05 — Notebook: two spreads, one turning leaf. --flip runs 0 → 1.
  (function(){
    const book=$('#nb-book'),stage=$('#nb-stage'),prev=$('#nb-prev'),next=$('#nb-next'),idx=$('#nb-idx');
    if(!book||!stage)return;
    const pages=$$('[data-page]',book),reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
    let f=0,raf=0,target=0;   // target = the spread the book is heading to (0 or 1)
    const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
    function paint(v){
      f=v;book.style.setProperty('--flip',v.toFixed(4));book.style.setProperty('--shade',Math.sin(Math.PI*v).toFixed(4));
      const second=v>=.5;
      pages.forEach(p=>p.classList.toggle('is-on',second?+p.dataset.page>=3:+p.dataset.page<=2));
      book.dataset.spread=second?'2':'1';idx.textContent=second?'02':'01';
      prev.disabled=!second;next.disabled=second;
    }
    function tween(to){
      cancelAnimationFrame(raf);target=to;
      if(reduce){paint(to);return}
      const from=f,t0=performance.now(),d=1100;
      const step=t=>{const k=Math.min(1,(t-t0)/d);paint(from+(to-from)*ease(k));if(k<1)raf=requestAnimationFrame(step)};
      raf=requestAnimationFrame(step);
    }
    // Page turning is independent of page scrolling: only buttons, arrow keys, taps and swipes turn the leaf.
    const turn=dir=>{if((dir>0&&target===1)||(dir<0&&target===0))return;tween(dir>0?1:0)};
    prev.addEventListener('click',()=>turn(-1));next.addEventListener('click',()=>turn(1));
    stage.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();turn(1)}else if(e.key==='ArrowLeft'){e.preventDefault();turn(-1)}});
    // click a page to turn: right / lower half goes forward, left / upper half goes back
    let swiped=false;
    book.addEventListener('click',e=>{
      if(swiped){swiped=false;return}
      if(String(getSelection()).length)return;
      const r=book.getBoundingClientRect(),stacked=innerWidth<=720;
      const forward=stacked?(e.clientY-r.top)>r.height/2:(e.clientX-r.left)>r.width/2;
      turn(forward?1:-1);
    });
    // swipe sideways on touch / pen to turn; vertical movement is left to the browser so the page still scrolls
    let sx=0,sy=0,sid=null;
    book.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse')return;sx=e.clientX;sy=e.clientY;sid=e.pointerId;swiped=false});
    book.addEventListener('pointerup',e=>{
      if(sid!==e.pointerId)return;sid=null;
      const dx=e.clientX-sx,dy=e.clientY-sy;
      if(Math.abs(dx)>48&&Math.abs(dx)>Math.abs(dy)*1.4){swiped=true;turn(dx<0?1:-1)}
    });
    book.addEventListener('pointercancel',()=>{sid=null});
    paint(0);
  })();

  // Contact form via mailto
  const form=$('#contact-form'); form&&form.addEventListener('submit',e=>{e.preventDefault();const data=new FormData(form);const subject=encodeURIComponent(data.get('subject'));const body=encodeURIComponent(`Name: ${data.get('name')}\nEmail: ${data.get('email')}\nOrganization: ${data.get('organization')||''}\n\nMessage:\n${data.get('message')}`);window.location.href=`mailto:polymathwizardhyd@gmail.com?subject=${subject}&body=${body}`});

  // Mobile menu
  const menu=$('.menu-btn'), nav=$('.nav-links'); menu&&menu.addEventListener('click',()=>{nav.classList.toggle('mobile-open')});
  $$('.nav-links a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('mobile-open')));
})();

(()=>{
const ROOT=document.documentElement;
function addShell(){
  if(document.getElementById('wa2VisualLayer'))return;
  const layer=document.createElement('div');layer.id='wa2VisualLayer';layer.setAttribute('aria-hidden','true');
  layer.innerHTML='<div class="wa2SnowField"></div><div class="wa2Glow wa2GlowA"></div><div class="wa2Glow wa2GlowB"></div>';
  document.body.prepend(layer);
}
function addHomeMasthead(){
  const home=document.getElementById('page-home');if(!home||home.querySelector('.wa2Masthead'))return;
  const eyebrow=home.querySelector('.eyebrow');
  const mast=document.createElement('div');mast.className='wa2Masthead';
  mast.innerHTML='<div class="wa2MastTop"><span>WHITE ALBUM 2</span><i></i><span>WINTER STUDY EDITION</span></div><div class="wa2MastBottom"><b>雪夜里的第一个算法问题。</b><small>HOT100 / LEARNING RECORD</small></div>';
  eyebrow?.insertAdjacentElement('beforebegin',mast);
}
function addHeroArtwork(){
  const hero=document.querySelector('#page-home .hero');if(!hero)return;
  hero.classList.add('wa2Hero');
  const old=hero.querySelector('.deckArt');if(old)old.classList.add('wa2OriginalArt');
  if(hero.querySelector('.wa2AlbumArt'))return;
  const art=document.createElement('div');art.className='wa2AlbumArt';art.setAttribute('aria-hidden','true');
  art.innerHTML=`<div class="wa2AlbumSky"><span class="wa2Moon"></span><span class="wa2Star s1"></span><span class="wa2Star s2"></span><span class="wa2Star s3"></span><span class="wa2Horizon"></span><span class="wa2SnowBank bank1"></span><span class="wa2SnowBank bank2"></span></div><div class="wa2AlbumMeta"><small>WINTER CODING SESSION</small><b>HOT 100</b><em>01 / BEGIN</em></div><div class="wa2Piano"><span></span><span></span><span class="black"></span><span></span><span class="black"></span><span></span><span></span><span class="black"></span><span></span></div><div class="wa2AlbumEdge">WHITE ALBUM 2</div>`;
  hero.appendChild(art);
  const main=hero.querySelector('.heroMain');
  if(main&&!main.querySelector('.wa2HeroNote')){
    const note=document.createElement('div');note.className='wa2HeroNote';note.innerHTML='<span>WINTER NOTE 01</span><i></i><small>从理解开始，再把它写出来。</small>';main.insertBefore(note,main.firstChild);
  }
}
function decorateSections(){
  document.querySelectorAll('#page-home .sectionHead,#page-problems .sectionHead,#page-knowledge .sectionHead,#page-review .sectionHead').forEach(h=>h.classList.add('wa2SectionHead'));
  document.querySelectorAll('.summaryGrid .summary').forEach((el,i)=>{el.classList.add('wa2Metric');el.dataset.wa2No=String(i+1).padStart(2,'0')});
}
function decorateStudy(){
  const card=document.getElementById('studyCard');if(card)card.classList.add('wa2StudyCard');
  const deck=document.getElementById('page-deck');if(deck&&!deck.querySelector('.wa2DeckLabel')){
    const head=deck.querySelector('.deckHead');const x=document.createElement('div');x.className='wa2DeckLabel';x.innerHTML='<span>WINTER STUDY RECORD</span><i></i><small>STEP BY STEP</small>';head?.insertAdjacentElement('afterend',x);
  }
}
function decorateLists(){
  document.querySelectorAll('.problemRow').forEach((row,i)=>{row.classList.add('wa2TrackRow');row.style.setProperty('--wa2-track',`"${String(i+1).padStart(2,'0')}"`)});
  document.querySelectorAll('.knowledge').forEach((card,i)=>{card.classList.add('wa2KnowledgeCard');card.style.setProperty('--wa2-k',`"NOTE ${String(i+1).padStart(2,'0')}"`)});
}
function refresh(){
  addShell();addHomeMasthead();addHeroArtwork();decorateSections();decorateStudy();decorateLists();
  document.body.classList.toggle('wa2Mode',ROOT.dataset.theme==='wa2');
}
const observer=new MutationObserver(()=>{if(ROOT.dataset.theme==='wa2')requestAnimationFrame(refresh)});
observer.observe(document.body,{subtree:true,childList:true});
window.addEventListener('hot100themechange',e=>{document.body.classList.toggle('wa2Mode',e.detail?.theme==='wa2');if(e.detail?.theme==='wa2')refresh()});
refresh();

const css=document.createElement('style');css.id='wa2DesignStyles';css.textContent=`
#wa2VisualLayer,.wa2Masthead,.wa2AlbumArt,.wa2HeroNote,.wa2DeckLabel{display:none}
html[data-theme="wa2"] #wa2VisualLayer{display:block;position:fixed;inset:0;pointer-events:none;z-index:-1;overflow:hidden}
html[data-theme="wa2"] .wa2SnowField{position:absolute;inset:-12% -8%;opacity:.48;background-image:radial-gradient(circle,rgba(255,255,255,.95) 0 1px,transparent 1.5px),radial-gradient(circle,rgba(220,237,249,.95) 0 1.2px,transparent 1.8px),radial-gradient(circle,rgba(255,255,255,.78) 0 .8px,transparent 1.3px);background-size:74px 74px,117px 117px,159px 159px;background-position:12px 18px,46px 71px,98px 21px;animation:wa2SnowDrift 24s linear infinite}
html[data-theme="wa2"] .wa2Glow{position:absolute;border-radius:999px;filter:blur(90px);opacity:.3}.wa2GlowA{width:420px;height:420px;right:-150px;top:5%;background:#91b9d8}.wa2GlowB{width:340px;height:340px;left:7%;bottom:-120px;background:#d7e8f5}
@keyframes wa2SnowDrift{to{transform:translate3d(-18px,64px,0)}}
@media(prefers-reduced-motion:reduce){html[data-theme="wa2"] .wa2SnowField{animation:none}}

html[data-theme="wa2"] .wa2Masthead{display:block;margin:4px 0 20px;padding:16px 18px 14px;border-left:2px solid #6f9abc;background:linear-gradient(90deg,rgba(255,255,255,.74),rgba(255,255,255,.26) 72%,transparent);position:relative;overflow:hidden}
html[data-theme="wa2"] .wa2Masthead:after{content:'❄';position:absolute;right:18px;top:50%;transform:translateY(-50%);font-size:38px;color:rgba(94,141,184,.13)}
.wa2MastTop{display:flex;align-items:center;gap:9px;font-size:9px;letter-spacing:.18em;color:#6e8498}.wa2MastTop i{height:1px;width:46px;background:#9bb8d0}.wa2MastBottom{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;margin-top:8px}.wa2MastBottom b{font-size:16px;font-weight:650;color:#28435f}.wa2MastBottom small{font-size:9px;letter-spacing:.12em;color:#8aa0b5}
html[data-theme="wa2"] #page-home>.eyebrow{color:#6e8da8;letter-spacing:.04em}
html[data-theme="wa2"] #page-home>.title{font-weight:760;letter-spacing:-.035em;color:#162a40;text-shadow:0 1px rgba(255,255,255,.7)}

html[data-theme="wa2"] .wa2Hero{position:relative;display:grid!important;grid-template-columns:minmax(0,1.25fr) minmax(245px,.75fr);gap:28px;overflow:hidden;padding:30px!important;background:linear-gradient(135deg,rgba(255,255,255,.97),rgba(232,243,251,.91))!important}
html[data-theme="wa2"] .wa2Hero:before{content:'';position:absolute;left:0;top:0;bottom:0;width:4px;background:linear-gradient(180deg,#b7d2e5,#5d8eb7 52%,#b7d2e5)}
html[data-theme="wa2"] .wa2Hero .heroMain{position:relative;z-index:2;align-self:center}
html[data-theme="wa2"] .wa2OriginalArt{display:none!important}
html[data-theme="wa2"] .wa2AlbumArt{display:block;min-height:300px;border-radius:18px;background:#102234;box-shadow:0 22px 44px rgba(28,62,92,.2);position:relative;overflow:hidden;border:1px solid rgba(159,194,219,.55);transform:rotate(1.2deg)}
.wa2AlbumSky{position:absolute;inset:0;background:linear-gradient(180deg,#102237 0%,#274662 46%,#8fb0c8 70%,#e6f0f6 71%,#f8fbfd 100%)}
.wa2AlbumSky:after{content:'';position:absolute;left:0;right:0;bottom:28%;height:22%;background:linear-gradient(165deg,transparent 0 42%,rgba(255,255,255,.92) 43% 63%,transparent 64%),linear-gradient(195deg,transparent 0 45%,rgba(222,237,246,.9) 46% 71%,transparent 72%);opacity:.8}
.wa2Moon{position:absolute;width:52px;height:52px;border-radius:50%;right:30px;top:28px;background:radial-gradient(circle at 35% 35%,#fff,#ecf4fa 68%,#c5d9e8);box-shadow:0 0 30px rgba(224,242,255,.55)}
.wa2Star{position:absolute;width:2px;height:2px;border-radius:50%;background:#fff;box-shadow:0 0 7px #fff}.wa2Star.s1{left:18%;top:18%}.wa2Star.s2{left:39%;top:28%}.wa2Star.s3{right:28%;top:15%}
.wa2Horizon{position:absolute;left:0;right:0;bottom:28%;height:1px;background:rgba(255,255,255,.5)}
.wa2SnowBank{position:absolute;bottom:23%;height:42px;border-radius:50%;background:#eff6fa;filter:blur(.3px)}.bank1{left:-8%;width:70%;transform:rotate(-4deg)}.bank2{right:-16%;width:78%;transform:rotate(5deg);background:#f8fbfd}
.wa2AlbumMeta{position:absolute;left:20px;top:20px;display:grid;gap:2px;color:white;text-shadow:0 2px 12px rgba(6,19,31,.3)}.wa2AlbumMeta small{font-size:8px;letter-spacing:.18em;opacity:.72}.wa2AlbumMeta b{font-size:31px;letter-spacing:-.04em}.wa2AlbumMeta em{font-style:normal;font-size:9px;letter-spacing:.16em;opacity:.8}
.wa2Piano{position:absolute;left:16px;right:16px;bottom:16px;height:58px;display:flex;align-items:stretch;background:#f8fbfd;border-radius:8px;overflow:hidden;box-shadow:0 7px 20px rgba(15,35,52,.18)}.wa2Piano span{flex:1;border-right:1px solid #c8d4dd;background:linear-gradient(#fff,#edf3f7)}.wa2Piano span.black{flex:.62;height:62%;background:linear-gradient(#20384d,#101d2a);z-index:2;margin-left:-4%;margin-right:-4%;border-radius:0 0 3px 3px;border:0;box-shadow:0 2px 5px rgba(0,0,0,.24)}.wa2AlbumEdge{position:absolute;right:-41px;top:49%;transform:rotate(90deg);font-size:7px;letter-spacing:.28em;color:rgba(255,255,255,.55)}
html[data-theme="wa2"] .wa2HeroNote{display:flex;align-items:center;gap:9px;margin-bottom:12px;font-size:9px;letter-spacing:.13em;color:#6685a0}.wa2HeroNote i{width:36px;height:1px;background:#a5bdd0}.wa2HeroNote small{letter-spacing:.03em;color:#8a9aaa}
html[data-theme="wa2"] .wa2Hero .heroMain h2{font-size:30px;letter-spacing:-.025em;margin-bottom:10px;color:#1b334a}

html[data-theme="wa2"] .wa2Metric{position:relative;overflow:hidden;padding-top:22px!important}.wa2Metric:before{content:attr(data-wa2-no);position:absolute;right:15px;top:9px;font-size:9px;letter-spacing:.14em;color:#a0b5c6}.wa2Metric:after{content:'';position:absolute;left:0;top:0;width:42%;height:2px;background:linear-gradient(90deg,#6e9abd,transparent)}
html[data-theme="wa2"] .wa2SectionHead{position:relative;padding-left:18px}.wa2SectionHead:before{content:'✦';position:absolute;left:0;top:2px;color:#6b95b6;font-size:10px}.wa2SectionHead:after{content:'';display:block;height:1px;margin-top:11px;background:linear-gradient(90deg,#bfd3e3,transparent 74%)}

html[data-theme="wa2"] .wa2DeckLabel{display:flex;align-items:center;gap:10px;margin:12px 0 15px;padding:0 4px;font-size:8px;letter-spacing:.16em;color:#7690a5}.wa2DeckLabel i{height:1px;flex:1;background:linear-gradient(90deg,#aac2d5,transparent)}.wa2DeckLabel small{font-size:8px;letter-spacing:.12em}
html[data-theme="wa2"] .wa2StudyCard{position:relative;overflow:hidden;border-radius:18px!important}.wa2StudyCard:before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:linear-gradient(#d6e8f4,#6796bb,#d6e8f4)}.wa2StudyCard:after{content:'WINTER RECORD';position:absolute;right:15px;top:12px;font-size:7px;letter-spacing:.18em;color:#a5b8c8;pointer-events:none}.wa2StudyCard .cardType{padding-right:100px}
html[data-theme="wa2"] .wa2StudyCard .codeBlock,html[data-theme="wa2"] .wa2StudyCard textarea.editor{border-radius:13px!important;border:1px solid #284663!important;background:linear-gradient(180deg,#0d1b29,#12283b)!important}

html[data-theme="wa2"] .wa2TrackRow{position:relative;padding-left:48px!important;overflow:hidden}.wa2TrackRow:before{content:var(--wa2-track);position:absolute;left:16px;top:50%;transform:translateY(-50%);font-size:9px;letter-spacing:.1em;color:#7f9ab0}.wa2TrackRow:after{content:'';position:absolute;left:39px;top:19%;bottom:19%;width:1px;background:#d7e4ee}.wa2TrackRow:hover{transform:translateX(2px);transition:transform .15s ease}
html[data-theme="wa2"] .wa2KnowledgeCard{position:relative;overflow:hidden;padding-top:27px!important;background:linear-gradient(145deg,rgba(255,255,255,.93),rgba(239,247,252,.88))!important}.wa2KnowledgeCard:before{content:var(--wa2-k);position:absolute;left:17px;top:10px;font-size:7px;letter-spacing:.16em;color:#8fa6b9}.wa2KnowledgeCard:after{content:'';position:absolute;right:-38px;bottom:-50px;width:120px;height:120px;border:1px solid rgba(105,151,185,.12);border-radius:50%;box-shadow:0 0 0 16px rgba(105,151,185,.035),0 0 0 34px rgba(105,151,185,.025)}

html[data-theme="wa2"] .mobileToolsPanel{background:linear-gradient(180deg,#eaf3f9 0%,#f7fafc 42%,#eef5f9 100%)!important}.wa2Mode .mobileToolsHead h2:after{content:'  ❄';font-size:13px;color:#7ea4c2}.wa2Mode .mobileToolsHead{border-bottom:1px solid #d6e4ee;margin-bottom:12px}.wa2Mode .mobileToolsGroup{backdrop-filter:blur(16px)}
html[data-theme="wa2"] .mobileBar{border-top:1px solid rgba(180,204,222,.9)}html[data-theme="wa2"] .mobileBtn{position:relative}html[data-theme="wa2"] .mobileBtn.active:before{content:'•';position:absolute;top:4px;left:50%;transform:translateX(-50%);font-size:10px;color:#6c96b6}

@media(max-width:820px){
  html[data-theme="wa2"] .wa2Masthead{margin-top:2px;padding:12px 13px 11px}.wa2MastBottom{display:block}.wa2MastBottom small{display:block;margin-top:5px}
  html[data-theme="wa2"] #page-home>.title{font-size:42px;line-height:1.05}
  html[data-theme="wa2"] .wa2Hero{grid-template-columns:1fr!important;padding:20px!important;gap:18px}.wa2AlbumArt{min-height:210px!important;transform:none!important}.wa2Piano{height:44px}.wa2AlbumMeta b{font-size:25px}.wa2Moon{width:42px;height:42px}
  html[data-theme="wa2"] .wa2Hero .heroMain h2{font-size:27px}.wa2HeroNote small{display:none}
  html[data-theme="wa2"] .summaryGrid{gap:8px}
}
@media(max-width:480px){html[data-theme="wa2"] .wa2AlbumArt{min-height:188px!important}.wa2AlbumEdge{display:none}.wa2Masthead:after{font-size:28px}.wa2MastBottom b{font-size:14px}}
`;
document.head.appendChild(css);
})();
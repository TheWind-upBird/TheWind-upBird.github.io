(()=>{
const root=document.documentElement;
function currentProblem(){try{return typeof current==='function'?current():CURRICULUM[state.currentProblem||0]}catch(e){return null}}
function localToday(){const d=new Date();return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`}
function setText(el,value){if(el&&el.textContent!==value)el.textContent=value}
function addStatusStrip(){
  const home=document.getElementById('page-home');if(!home||home.querySelector('.wa2StatusStrip'))return;
  const hero=home.querySelector('.hero');if(!hero)return;
  const strip=document.createElement('div');strip.className='wa2StatusStrip';
  strip.innerHTML='<div><small>WINTER LOG</small><b id="wa2LogDate"></b></div><i></i><div><small>NOW PLAYING</small><b id="wa2NowTrack"></b></div><i></i><div><small>RECORD</small><b id="wa2RecordCount"></b></div>';
  hero.insertAdjacentElement('beforebegin',strip);
}
function addPageLabels(){
  const labels={problems:['TRACK LIST','100 PROBLEMS'],knowledge:['WINTER NOTES','KNOWLEDGE MAP'],review:['REPRISE','REVIEW SESSION']};
  Object.entries(labels).forEach(([id,[a,b]])=>{
    const page=document.getElementById(`page-${id}`);if(!page||page.querySelector('.wa2PageLabel'))return;
    const eyebrow=page.querySelector('.eyebrow');const x=document.createElement('div');x.className='wa2PageLabel';x.innerHTML=`<span>${a}</span><i></i><small>${b}</small>`;eyebrow?.insertAdjacentElement('beforebegin',x);
  });
}
function addCornerRail(){
  if(document.getElementById('wa2CornerRail'))return;
  const rail=document.createElement('div');rail.id='wa2CornerRail';rail.setAttribute('aria-hidden','true');rail.innerHTML='<span>SIDE A</span><i></i><span>HOT100</span>';
  document.body.appendChild(rail);
}
function updateDynamic(){
  const p=currentProblem();const n=(state?.currentProblem||0)+1;const solved=Object.keys(state?.solved||{}).length;
  setText(document.getElementById('wa2LogDate'),localToday());
  setText(document.getElementById('wa2NowTrack'),`${String(n).padStart(2,'0')} · ${p?.title||'Hot100'}`);
  setText(document.getElementById('wa2RecordCount'),`${solved} / ${CURRICULUM.length}`);
  document.querySelectorAll('.wa2AlbumMeta em').forEach(el=>setText(el,`TRACK ${String(n).padStart(2,'0')} / ${String(CURRICULUM.length).padStart(3,'0')}`));
  document.querySelectorAll('.wa2HeroNote span').forEach(el=>setText(el,`WINTER NOTE ${String(n).padStart(2,'0')}`));
  document.querySelectorAll('.wa2DeckLabel small').forEach(el=>setText(el,`TRACK ${String(n).padStart(2,'0')} · STEP BY STEP`));
}
function decorate(){
  addStatusStrip();addPageLabels();addCornerRail();updateDynamic();
  document.body.classList.toggle('wa2Polished',root.dataset.theme==='wa2');
}
let raf=0;function schedule(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;decorate()})}
window.addEventListener('hot100themechange',schedule);
const mo=new MutationObserver(()=>{if(root.dataset.theme==='wa2')schedule()});mo.observe(document.body,{childList:true,subtree:true});
decorate();

const style=document.createElement('style');style.id='wa2PolishStyles';style.textContent=`
.wa2StatusStrip,.wa2PageLabel,#wa2CornerRail{display:none}
html[data-theme="wa2"]{--wa2-serif:ui-serif,"Songti SC","STSong","Noto Serif CJK SC",Georgia,serif}
html[data-theme="wa2"] #page-home>.title,html[data-theme="wa2"] .wa2Hero .heroMain h2,html[data-theme="wa2"] .page>.title{font-family:var(--wa2-serif);font-weight:650;letter-spacing:-.02em}
html[data-theme="wa2"] #page-home>.title{max-width:760px;font-size:54px;line-height:1.02}
html[data-theme="wa2"] #page-home>.subtitle{max-width:720px;line-height:1.8;color:#667c90}
html[data-theme="wa2"] .wa2AlbumSky{background-image:linear-gradient(180deg,rgba(8,23,38,.08),rgba(8,23,38,.02)),url('./wa2-winter-scene.svg')!important;background-size:cover!important;background-position:center!important}
html[data-theme="wa2"] .wa2Moon,html[data-theme="wa2"] .wa2Star,html[data-theme="wa2"] .wa2Horizon,html[data-theme="wa2"] .wa2SnowBank{display:none!important}
html[data-theme="wa2"] .wa2AlbumArt{min-height:330px!important;border-radius:16px!important;box-shadow:0 26px 58px rgba(25,55,83,.24),0 0 0 1px rgba(255,255,255,.55) inset!important}
html[data-theme="wa2"] .wa2AlbumArt:before{content:'';position:absolute;inset:0;z-index:3;pointer-events:none;background:linear-gradient(120deg,rgba(255,255,255,.16),transparent 26%,transparent 72%,rgba(255,255,255,.08));mix-blend-mode:screen}
html[data-theme="wa2"] .wa2AlbumMeta{z-index:5;background:rgba(11,31,49,.3);backdrop-filter:blur(9px);padding:10px 12px;border-left:2px solid rgba(221,238,249,.82);border-radius:0 8px 8px 0;left:0!important;top:24px!important}
html[data-theme="wa2"] .wa2AlbumMeta b{font-family:var(--wa2-serif);font-weight:600;letter-spacing:.01em}
html[data-theme="wa2"] .wa2Piano{display:none!important}html[data-theme="wa2"] .wa2AlbumEdge{z-index:5}
html[data-theme="wa2"] .wa2StatusStrip{display:grid;grid-template-columns:auto 1px minmax(0,1fr) 1px auto;align-items:center;gap:16px;margin:-4px 0 14px;padding:10px 14px;border-top:1px solid #c7dae8;border-bottom:1px solid #dce8f1;background:rgba(255,255,255,.34);backdrop-filter:blur(10px)}
.wa2StatusStrip>div{display:grid;gap:2px;min-width:0}.wa2StatusStrip small{font-size:7px;letter-spacing:.18em;color:#8ca2b5}.wa2StatusStrip b{font-size:11px;font-weight:650;color:#45647f;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.wa2StatusStrip>i{height:24px;width:1px;background:#cfdeea}
html[data-theme="wa2"] .wa2PageLabel{display:flex;align-items:center;gap:10px;margin-bottom:14px;color:#718da5;font-size:8px;letter-spacing:.18em}.wa2PageLabel i{width:54px;height:1px;background:linear-gradient(90deg,#7ea4c1,#c9dce9)}.wa2PageLabel small{font-size:8px;letter-spacing:.14em;color:#9aafc0}
html[data-theme="wa2"] #page-problems>.title,html[data-theme="wa2"] #page-knowledge>.title,html[data-theme="wa2"] #page-review>.title{position:relative;display:inline-block;margin-bottom:10px}
html[data-theme="wa2"] #page-problems>.title:after,html[data-theme="wa2"] #page-knowledge>.title:after,html[data-theme="wa2"] #page-review>.title:after{content:'';position:absolute;left:0;right:-32px;bottom:-7px;height:1px;background:linear-gradient(90deg,#7198b7,transparent)}
html[data-theme="wa2"] .problemRow{border-radius:0!important;border-left:0!important;border-right:0!important;background:rgba(255,255,255,.48)!important;margin:0!important;box-shadow:none!important;transition:background .16s ease,transform .16s ease}
html[data-theme="wa2"] .problemRow:hover{background:rgba(255,255,255,.86)!important;transform:translateX(4px)}html[data-theme="wa2"] .problemRow b{font-family:var(--wa2-serif);font-weight:600;color:#244059}
html[data-theme="wa2"] .problemList{border-top:1px solid #cfdfeb;border-bottom:1px solid #cfdfeb}html[data-theme="wa2"] .problemList>.problemRow+ .problemRow{border-top:1px solid #dbe7ef!important}
html[data-theme="wa2"] .knowledgeGrid{gap:12px!important}html[data-theme="wa2"] .wa2KnowledgeCard h3{font-family:var(--wa2-serif);font-weight:600;color:#29465f}html[data-theme="wa2"] .wa2KnowledgeCard{border-radius:14px!important;transition:transform .18s ease,box-shadow .18s ease}html[data-theme="wa2"] .wa2KnowledgeCard:hover{transform:translateY(-2px);box-shadow:0 18px 38px rgba(52,84,111,.11)!important}
html[data-theme="wa2"] .wa2StudyCard .cardType,html[data-theme="wa2"] .wa2StudyCard h2,html[data-theme="wa2"] .wa2StudyCard h3{font-family:var(--wa2-serif)}html[data-theme="wa2"] .wa2StudyCard{box-shadow:0 20px 46px rgba(45,77,105,.09)!important}html[data-theme="wa2"] .wa2StudyCard:before{width:4px!important}html[data-theme="wa2"] .deckHead{border-bottom:0}html[data-theme="wa2"] .deckHead>div:first-child>b{font-family:var(--wa2-serif);font-size:17px;color:#29465f}
html[data-theme="wa2"] #wa2CornerRail{display:flex;position:fixed;right:10px;top:50%;transform:translateY(-50%) rotate(90deg);transform-origin:center;align-items:center;gap:8px;z-index:3;pointer-events:none;font-size:7px;letter-spacing:.22em;color:rgba(80,116,146,.42)}#wa2CornerRail i{width:38px;height:1px;background:rgba(100,139,169,.3)}
html[data-theme="wa2"] .mobileToolsPanel .themeChoice.active{background:linear-gradient(145deg,#f8fcff,#e7f1f8);box-shadow:0 8px 20px rgba(66,103,134,.09),0 0 0 1px rgba(105,148,181,.1) inset}
html[data-theme="wa2"] .primary{position:relative;overflow:hidden}html[data-theme="wa2"] .primary:after{content:'';position:absolute;inset:0;transform:translateX(-120%);background:linear-gradient(100deg,transparent,rgba(255,255,255,.23),transparent);transition:transform .45s ease}html[data-theme="wa2"] .primary:hover:after{transform:translateX(120%)}
@media(max-width:820px){html[data-theme="wa2"] #page-home>.title{font-size:40px;line-height:1.08}html[data-theme="wa2"] .wa2StatusStrip{grid-template-columns:1fr 1px 1.5fr;gap:10px;padding:9px 10px}.wa2StatusStrip>div:last-child,.wa2StatusStrip>i:nth-of-type(2){display:none}html[data-theme="wa2"] .wa2AlbumArt{min-height:238px!important}html[data-theme="wa2"] #wa2CornerRail{display:none}html[data-theme="wa2"] .wa2PageLabel{margin-top:2px}}
@media(max-width:480px){html[data-theme="wa2"] #page-home>.title{font-size:36px}.wa2StatusStrip b{font-size:10px}}
`;
document.head.appendChild(style);
})();
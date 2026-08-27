(()=>{
const base=buildCards;
function beginnerCard(p,data){return {id:'intuition',step:'建立直觉',render(){return `${header('learn','知识','建立直觉')}<div class="cardBody"><h2>${esc(data.title)}</h2><div class="bigPrompt">${esc(data.example)}</div><div class="callout"><b>先看发生了什么</b><br><span class="muted">${esc(data.observe)}</span></div><p><b>我们真正要解决的问题：</b>${esc(data.question)}</p><div class="callout"><b>从这里再引出方法</b><br><span class="muted">${esc(data.answer)}</span></div></div>${footer()}`},bind(){bindFooter()}}}
buildCards=function(p){const cards=base(p);const data=window.HOT100_BEGINNER_INTUITION[p.slug];if(data&&p.slug!=='two-sum')cards[0]=beginnerCard(p,data);return cards;};
})();

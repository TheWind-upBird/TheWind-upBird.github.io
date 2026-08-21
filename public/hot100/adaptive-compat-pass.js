(()=>{
function adaptiveState(){
  state.attempts=state.attempts||{};
  return state.attempts.__adaptive||(state.attempts.__adaptive={interviews:[],mistakes:{},activeInterview:null,quickSession:null});
}
const compatBaseShowPage=showPage;
showPage=function(name){
  const qs=adaptiveState().quickSession;
  const keepDeckIndex=name==='deck'&&qs?state.deckIndex:null;
  const result=compatBaseShowPage(name);
  document.querySelectorAll('[data-adaptive-page]').forEach(b=>b.classList.toggle('active',b.dataset.adaptivePage===name));
  if(keepDeckIndex!==null&&state.deckIndex!==keepDeckIndex){state.deckIndex=keepDeckIndex;persist();renderCard()}
  return result;
};
const compatBaseRenderHome=renderHome;
renderHome=function(){
  compatBaseRenderHome();
  if(!adaptiveState().quickSession)document.getElementById('quickContinue')?.remove();
};
})();
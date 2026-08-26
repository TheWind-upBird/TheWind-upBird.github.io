(()=>{
function dayKey(date=new Date()){
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
}
function addDays(days,date=new Date()){
  const next=new Date(date.getTime());next.setDate(next.getDate()+Number(days||0));return dayKey(next)
}
window.HOT100_CALENDAR={dayKey,addDays,version:1,principle:'device-local-calendar'};
})();

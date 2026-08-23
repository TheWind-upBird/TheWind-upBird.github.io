(()=>{
const KEY='hot100-product-profile-v1';
const STRINGS={
  'zh-CN':{
    today:'今天',settings:'学习设置',goal:'目标',daily:'每天投入',level:'当前水平',language:'课程语言',coding:'编程语言',save:'保存设置',later:'稍后再说',start:'开始我的路线',
    goalInternship:'实习',goalCampus:'校招',goalSwitch:'跳槽',goalGeneral:'系统补基础',
    levelBeginner:'Easy 经常没思路',levelDeveloping:'Easy 能做，Medium 较困难',levelInterview:'能独立完成部分 Medium',
    minute10:'10 分钟',minute20:'20 分钟',minute30:'30 分钟',minute60:'60 分钟',
    zh:'中文',en:'English',python:'Python',cpp:'C++（准备中）',java:'Java（准备中）'
  },
  'en-US':{
    today:'Today',settings:'Learning settings',goal:'Goal',daily:'Daily time',level:'Current level',language:'Course language',coding:'Coding language',save:'Save settings',later:'Not now',start:'Build my path',
    goalInternship:'Internship',goalCampus:'New grad recruiting',goalSwitch:'Job switch',goalGeneral:'Build fundamentals',
    levelBeginner:'Often stuck on Easy',levelDeveloping:'Can solve Easy; Medium is hard',levelInterview:'Can solve some Medium independently',
    minute10:'10 min',minute20:'20 min',minute30:'30 min',minute60:'60 min',
    zh:'中文',en:'English',python:'Python',cpp:'C++ (coming)',java:'Java (coming)'
  }
};
const defaults={
  version:1,onboardingComplete:false,locale:'zh-CN',codingLanguage:'python',goal:'internship',dailyMinutes:20,level:'beginner',activeTrack:'hot100-core',interviewDate:null,createdAt:null,updatedAt:null
};
let profile={...defaults};
try{profile={...defaults,...JSON.parse(localStorage.getItem(KEY)||'null')}}catch(e){}
try{
  const hasExistingProgress=typeof state!=='undefined'&&(Object.keys(state.solved||{}).length>0||Object.keys(state.completedCards||{}).length>0);
  if(hasExistingProgress&&!localStorage.getItem(KEY))profile={...profile,onboardingComplete:true,createdAt:new Date().toISOString()};
}catch(e){}
function persistProfile(){profile.updatedAt=new Date().toISOString();if(!profile.createdAt)profile.createdAt=profile.updatedAt;localStorage.setItem(KEY,JSON.stringify(profile));window.dispatchEvent(new CustomEvent('hot100profilechange',{detail:{profile:{...profile}}}))}
function update(patch){profile={...profile,...patch};persistProfile();return {...profile}}
function t(key,locale=profile.locale){return STRINGS[locale]?.[key]??STRINGS['zh-CN'][key]??key}
function setLocale(locale){if(!STRINGS[locale])return;update({locale});document.documentElement.lang=locale==='zh-CN'?'zh-CN':'en'}
function reset(){profile={...defaults};localStorage.removeItem(KEY);return {...profile}}
window.HOT100_PRODUCT_PROFILE={key:KEY,get:()=>({...profile}),update,t,setLocale,reset,strings:STRINGS};
document.documentElement.lang=profile.locale==='zh-CN'?'zh-CN':'en';
})();
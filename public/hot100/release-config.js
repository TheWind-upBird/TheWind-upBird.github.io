(()=>{
const release={
  schemaVersion:1,
  version:'0.4.0-beta.2',
  channel:'friends-beta',
  stage:'closed-beta',
  releasedAt:'2026-08-26',
  features:{pythonRunner:true,feedback:true,retention:true},
  rollout:{currentRing:'friends',nextRing:'public-beta',promotion:'manual-go-no-go'},
  knownLimitations:['无账号和跨设备同步','首次加载 Python 运行环境需要联网','当前仅正式支持 Python']
};
window.SOLVESHIFT_RELEASE=Object.freeze({...release,features:Object.freeze({...release.features}),rollout:Object.freeze({...release.rollout}),knownLimitations:Object.freeze([...release.knownLimitations])});
})();

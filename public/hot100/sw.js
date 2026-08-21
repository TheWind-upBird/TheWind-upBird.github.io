const CACHE='hot100-shell-v5';
const SHELL=[
  './','./index.html','./style.css','./manifest.webmanifest','./icon.svg','./icon-192.svg','./icon-512.svg',
  './curriculum-1.js','./curriculum-2.js','./curriculum-3.js','./curriculum-4.js','./curriculum-5.js','./curriculum-6.js',
  './handcrafted-patterns.js','./lesson-overrides.js','./beginner-intuition.js',
  './handcrafted-2-10.js','./handcrafted-11-20.js','./handcrafted-21-30.js',
  './hot100-31-32.js','./hot100-33-34.js','./hot100-35-40.js','./hot100-41-45.js','./hot100-46-50.js',
  './hot100-51-60.js','./hot100-61-70.js','./hot100-71-80.js','./hot100-81-90.js','./hot100-91-100.js',
  './quality-2-30-pass.js','./engine-state.js','./engine-cards.js','./python-extra.js','./editor-runtime.js',
  './handcrafted-cards.js','./quality-pass.js','./quality-content-pass.js','./two-sum-cards.js','./engine-ui.js',
  './product-pass.js','./utility-pass.js','./practice-snapshot-pass.js','./adaptive-mode-pass.js','./adaptive-compat-pass.js','./mobile-install-fix.js','./mobile-tools-drawer.js'
];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>Promise.allSettled(SHELL.map(url=>cache.add(url)))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('hot100-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  const req=event.request;if(req.method!=='GET')return;
  const url=new URL(req.url);
  const sameOrigin=url.origin===self.location.origin;
  const pyodide=url.hostname==='cdn.jsdelivr.net'&&url.pathname.includes('/pyodide/');
  if(!sameOrigin&&!pyodide)return;
  event.respondWith(caches.match(req).then(cached=>{
    const network=fetch(req).then(res=>{
      if(res&&(res.ok||res.type==='opaque')){
        const copy=res.clone();caches.open(CACHE).then(cache=>cache.put(req,copy)).catch(()=>{});
      }
      return res;
    }).catch(()=>cached);
    return cached||network;
  }));
});

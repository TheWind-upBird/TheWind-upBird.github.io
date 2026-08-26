const CACHE='hot100-shell-v45';
const SHELL=[
  './','./index.html','./style.css','./manifest.webmanifest','./icon.svg','./icon-192.svg','./icon-512.svg','./wa2-winter-scene.svg','./theme-bootstrap.js','./release-config.js','./release-guard-pass.js',
  './privacy.html','./terms.html','./beta-guide.html','./legal.css','./SolveShift-Beta-Release-Checklist.md','./SECURITY.md',
  './curriculum-1.js','./curriculum-2.js','./curriculum-3.js','./curriculum-4.js','./curriculum-5.js','./curriculum-6.js',
  './handcrafted-patterns.js','./lesson-overrides.js','./beginner-intuition.js',
  './handcrafted-2-10.js','./handcrafted-11-20.js','./handcrafted-21-30.js',
  './hot100-31-32.js','./hot100-33-34.js','./hot100-35-40.js','./hot100-41-45.js','./hot100-46-50.js',
  './hot100-51-60.js','./hot100-61-70.js','./hot100-71-80.js','./hot100-91-100.js','./hot100-81-90.js',
  './quality-2-30-pass.js','./content-integrity-pass.js','./calendar-utils.js','./engine-state.js','./analytics-pass.js','./engine-cards.js','./python-worker.js','./python-extra.js','./editor-runtime.js',
  './handcrafted-cards.js','./quality-pass.js','./quality-content-pass.js','./two-sum-cards.js','./engine-ui.js',
  './product-pass.js','./utility-pass.js','./practice-snapshot-pass.js','./adaptive-mode-pass.js','./adaptive-compat-pass.js',
  './mobile-install-fix.js','./theme-pass.js','./wa2-design-pass.js','./wa2-polish-pass.js','./wa2-art-fix.js','./mobile-tools-drawer.js','./wa2-motion-pass.js','./ui-polish-pass.js',
  './product-catalog.js','./product-profile.js','./learning-policy.js','./product-shell.js','./study-modes.js','./product-library.js','./mastery-pass.js','./accessibility-pass.js','./retention-pass.js','./feedback-pass.js','./continuity-pass.js','./app-health-pass.js','./data-protection-pass.js'
];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));
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
  if(sameOrigin){
    event.respondWith(fetch(req).then(res=>{
      if(res&&res.ok){const copy=res.clone();caches.open(CACHE).then(cache=>cache.put(req,copy)).catch(()=>{})}
      return res;
    }).catch(async()=>{
      const hit=await caches.match(req);if(hit)return hit;
      if(req.mode==='navigate')return caches.match('./index.html');
      return Response.error()
    }));
    return;
  }
  event.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(res=>{
    if(res&&(res.ok||res.type==='opaque')){const copy=res.clone();caches.open(CACHE).then(cache=>cache.put(req,copy)).catch(()=>{})}
    return res;
  })));
});

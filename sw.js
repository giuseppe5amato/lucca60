/* Lucca 60 – service worker, versione 628eaa2c85 */
const CACHE="lucca60-628eaa2c85";
const CORE=["./","index.html","mappa.jpg","manifest.webmanifest","icon-192.png","icon-512.png","icon-maskable.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith("lucca60-")&&k!==CACHE&&k!=="lucca60-fonts").map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const r=e.request; if(r.method!=="GET")return;
  const u=new URL(r.url);
  if(u.hostname==="fonts.googleapis.com"||u.hostname==="fonts.gstatic.com"){
    e.respondWith(caches.open("lucca60-fonts").then(c=>c.match(r).then(hit=>hit||fetch(r).then(res=>{c.put(r,res.clone());return res}).catch(()=>hit))));
    return;
  }
  if(u.origin!==location.origin)return;
  if(r.mode==="navigate"){
    /* prima la copia salvata (in fiera il segnale è scarso), poi aggiornamento in sottofondo */
    const net=fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put("index.html",cp))}return res});
    e.respondWith(caches.match("index.html").then(hit=>hit||net).catch(()=>caches.match("index.html")));
    e.waitUntil(net.catch(()=>{}));
    return;
  }
  e.respondWith(caches.match(r,{ignoreSearch:true}).then(hit=>hit||fetch(r).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp));return res})));
});

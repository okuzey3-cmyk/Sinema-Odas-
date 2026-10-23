/* Demet'in Sinema Odası - çevrimdışı çalışma yardımcısı
   Sayfa: önce internetten (güncelleme hemen gelsin), yoksa kayıtlı kopya.
   Afişler ve yazı tipleri: önce kayıtlı kopya (hızlı ve çevrimdışı). */
var SAYFA="sinema-sayfa-v1", RESIM="sinema-resim-v1";
self.addEventListener("install",function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(SAYFA).then(function(c){return c.addAll(["./","./index.html","./manifest.json"])}).catch(function(){}));
});
self.addEventListener("activate",function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.filter(function(k){return k!==SAYFA&&k!==RESIM}).map(function(k){return caches.delete(k)}));
  }).then(function(){return self.clients.claim()}));
});
function kirp(){
  caches.open(RESIM).then(function(c){c.keys().then(function(ks){
    if(ks.length>500)ks.slice(0,ks.length-500).forEach(function(k){c.delete(k)});
  })});
}
self.addEventListener("fetch",function(e){
  var r=e.request;
  if(r.method!=="GET")return;
  var u=new URL(r.url);
  if(u.origin===self.location.origin){
    e.respondWith(fetch(r).then(function(res){
      if(res&&res.ok){var k=res.clone();caches.open(SAYFA).then(function(c){c.put(r,k)})}
      return res;
    }).catch(function(){
      return caches.match(r).then(function(m){
        return m||caches.match("./index.html").then(function(m2){return m2||caches.match("./")});
      });
    }));
    return;
  }
  if(u.hostname==="image.tmdb.org"||u.hostname==="fonts.gstatic.com"||u.hostname==="fonts.googleapis.com"){
    e.respondWith(caches.open(RESIM).then(function(c){
      return c.match(r).then(function(m){
        if(m)return m;
        return fetch(r).then(function(res){
          if(res&&(res.ok||res.type==="opaque")){c.put(r,res.clone());if(Math.random()<0.05)kirp()}
          return res;
        });
      });
    }));
  }
});

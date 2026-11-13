/* "Bago" billboard + header helpers, shared by every page.
   The billboard is already in each page's header (no jump while loading); this only refreshes it from updates.json. */
(function(){
  var base = (document.currentScript && document.currentScript.src || '').replace(/bb\.js(\?.*)?$/, '');
  // open every page at the top (or at the #section in the link), not where the last visit left off
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  function fit(){ var h=document.querySelector('header.nav'); if(!h) return;
    var px=h.offsetHeight+'px'; document.documentElement.style.setProperty('--hdr',px); document.documentElement.style.scrollPaddingTop=px; }
  function place(){ fit(); var id=decodeURIComponent(location.hash.slice(1)); var el=id&&document.getElementById(id);
    if(el){ el.scrollIntoView({behavior:'instant', block:'start'}); } else { window.scrollTo({top:0, left:0, behavior:'instant'}); } }
  window.tabiPlace = place;
  window.addEventListener('resize', fit);
  // some phone viewers (and big system text) shift the page a moment after it opens:
  // keep re-placing for the first ~1.5 s, but stop as soon as the person touches or scrolls
  var touched=false;
  ['touchstart','wheel','keydown','mousedown'].forEach(function(e){ window.addEventListener(e,function(){ touched=true; },{passive:true,once:true}); });
  function again(){ if(!touched) place(); }
  window.addEventListener('load', function(){ place(); setTimeout(again,300); setTimeout(again,800); setTimeout(again,1500); });
  window.addEventListener('pageshow', function(ev){ if(ev.persisted) again(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(again);
  place();
  fetch(base + 'updates.json', {cache: 'no-cache'}).then(function(r){ return r.json(); }).then(function(u){
    if (!u || !u.length) return;
    var t=document.getElementById('bb-text'), a=document.getElementById('bb-link');
    if (t) t.textContent = u[0].title; if (a) a.href = base + 'kuwento/#' + u[0].date;
  }).catch(function(){});
})();

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

  /* Updates come from the "TABI Updates" Google Sheet (File > Share > Publish to web > CSV).
     Columns: Ipakita (checkbox) | Petsa | Lalabas sa (optional) | Pamagat | Buod | Facebook link.
     A row shows only when ticked and its "Lalabas sa" date (or Petsa) has arrived, Manila time.
     If the sheet can't be read, updates.json is used, as before. */
  var SHEET_CSV = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR1s134MNkvePDv3cZ_gZesqA7ax_i7SswebRmeGB0mj3rX4LUwH9gqJuAcz7uEVscpddRskti04kMn/pub?gid=0&single=true&output=csv';
  function csv(text){ var rows=[], row=[], f='', q=false;
    for (var i=0;i<text.length;i++){ var c=text[i];
      if (q){ if (c=='"'){ if (text[i+1]=='"'){ f+='"'; i++; } else q=false; } else f+=c; }
      else if (c=='"') q=true; else if (c==','){ row.push(f); f=''; }
      else if (c=='\n' || c=='\r'){ if (c=='\r' && text[i+1]=='\n') i++; row.push(f); rows.push(row); row=[]; f=''; }
      else f+=c; }
    if (f!=='' || row.length){ row.push(f); rows.push(row); } return rows; }
  function day(v){ v=(v||'').trim(); var m=v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (!m){ var u=v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/); if (u) m=[0,u[3],u[1],u[2]]; }
    if (!m) return '';
    return m[1]+'-'+('0'+m[2]).slice(-2)+'-'+('0'+m[3]).slice(-2); }
  function fromSheet(text){
    var today=new Date(Date.now()+8*3600e3).toISOString().slice(0,10), out=[];
    csv(text).slice(1).forEach(function(r){
      var show=/^(true|oo|yes|1|✓|x)$/i.test((r[0]||'').trim()), date=day(r[1]), from=day(r[2])||date;
      var title=(r[3]||'').trim(), text=(r[4]||'').trim(), link=(r[5]||'').trim();
      if (!show || !date || !title || from>today) return;
      var u={date:date, title:title, text:text}; if (/^https?:\/\//.test(link)) u.link=link; out.push(u); });
    out.sort(function(a,b){ return a.date<b.date?1:a.date>b.date?-1:0; });
    return out; }
  function fromJson(){ return fetch(base + 'updates.json', {cache: 'no-cache'}).then(function(r){ return r.json(); }); }
  window.tabiUpdates = (/^https:\/\//.test(SHEET_CSV)
    ? fetch(SHEET_CSV + (SHEET_CSV.indexOf('?')<0?'?':'&') + 't=' + Date.now()).then(function(r){ if(!r.ok) throw 0; return r.text(); })
        .then(function(t){ var u=fromSheet(t); if (!u.length) throw 0; return u; }).catch(fromJson)
    : fromJson()).catch(function(){ return []; });

  window.tabiUpdates.then(function(u){
    if (!u || !u.length) return;
    var t=document.getElementById('bb-text'), a=document.getElementById('bb-link');
    if (t) t.textContent = u[0].title; if (a) a.href = base + 'kuwento/#' + u[0].date;
  });
})();

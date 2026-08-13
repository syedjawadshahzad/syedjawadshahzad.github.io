// (function(){
// const state={publications:Array.isArray(window.PUBLICATIONS)?window.PUBLICATIONS:[],activeKeyword:""};
// const $=id=>document.getElementById(id);
// const esc=v=>String(v||"").replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
// const attr=v=>esc(v).replace(/`/g,"&#96;");
// function absScore(v){if(!v)return 0;if(v==="4*")return 5;let n=Number(String(v).replace(/[^0-9.]/g,""));return Number.isNaN(n)?0:n;}
// function qScore(v){return {Q1:4,Q2:3,Q3:2,Q4:1}[String(v||"").toUpperCase()]||0;}
// function uniq(a){return [...new Set((a||[]).map(x=>String(x).trim()).filter(Boolean))];}
// function authors(a){return String(a||"").replace(/\s+and\s+/g,"; ");}
// function typeOK(p,t){if(t==="all")return true;if(t==="working")return p.working===true;if(t==="published")return p.working!==true;if(t==="article")return p.entryType==="article";if(t==="chapter")return ["incollection","inbook","book"].includes(p.entryType);if(t==="conference")return ["inproceedings","conference"].includes(p.entryType);return true;}
// function populateYears(){const y=$("filter-year");if(!y)return;const existing=new Set([...y.options].map(o=>o.value));uniq(state.publications.map(p=>p.year)).sort((a,b)=>Number(b)-Number(a)).forEach(year=>{if(existing.has(String(year)))return;let o=document.createElement("option");o.value=year;o.textContent=year;y.appendChild(o);});}
// function rows(){const t=$("filter-type")?.value||"all",a=$("filter-abs")?.value||"all",s=$("filter-scopus")?.value||"all",y=$("filter-year")?.value||"all",sort=$("filter-sort")?.value||"year-desc";let r=state.publications.filter(p=>{if(p.excluded)return false;if(!typeOK(p,t))return false;if(a!=="all"&&String(p.abs||"")!==a)return false;if(s!=="all"&&String(p.scopus||"")!==s)return false;if(y!=="all"&&String(p.year||"")!==y)return false;if(state.activeKeyword&&!(p.keywords||[]).map(k=>String(k).toLowerCase()).includes(state.activeKeyword.toLowerCase()))return false;return true;});r.sort((x,z)=>{if(sort==="year-asc")return Number(x.year||0)-Number(z.year||0)||String(x.title).localeCompare(String(z.title));if(sort==="abs-desc")return absScore(z.abs)-absScore(x.abs)||Number(z.year||0)-Number(x.year||0);if(sort==="q-desc")return qScore(z.scopus)-qScore(x.scopus)||Number(z.year||0)-Number(x.year||0);if(sort==="title-asc")return String(x.title).localeCompare(String(z.title));return Number(z.year||0)-Number(x.year||0)||String(x.title).localeCompare(String(z.title));});return r;}
// function dashboard(r){if($("stat-total"))$("stat-total").textContent=r.length;if($("stat-abs3plus"))$("stat-abs3plus").textContent=r.filter(p=>absScore(p.abs)>=3).length;if($("stat-q1"))$("stat-q1").textContent=r.filter(p=>p.scopus==="Q1").length;if($("stat-working"))$("stat-working").textContent=r.filter(p=>p.working).length;}
// function cloud(){const el=$("word-cloud");if(!el)return;const m=new Map();state.publications.forEach(p=>{if(p.excluded)return;(p.keywords||[]).forEach(k=>{let low=String(k).toLowerCase();if(["working","exclude"].includes(low))return;m.set(k,(m.get(k)||0)+1);});});el.innerHTML="";[...m.entries()].sort((a,b)=>b[1]-a[1]).slice(0,18).forEach(([w,c])=>{let b=document.createElement("button");b.type="button";b.className="word-cloud-item"+(state.activeKeyword.toLowerCase()===String(w).toLowerCase()?" active":"");b.innerHTML=`<span>${esc(w)}</span><em>${esc(c)}</em>`;b.onclick=()=>{state.activeKeyword=state.activeKeyword.toLowerCase()===String(w).toLowerCase()?"":w;render();};el.appendChild(b);});}
// function note(r){const el=$("active-filter-note");if(!el)return;let parts=[];if(state.activeKeyword)parts.push(`theme: <strong>${esc(state.activeKeyword)}</strong>`);el.innerHTML=parts.length?`${r.length} result(s) for ${parts.join(" and ")}`:`${r.length} publication(s) shown`;}
// function cards(r){const list=$("publication-list");if(!list)return;if(!state.publications.length){list.innerHTML='<div class="pub-empty"><strong>No publication data found.</strong><br>Run <code>python build_publications_assets.py</code> in your Quarto source folder.</div>';return;}if(!r.length){list.innerHTML='<div class="pub-empty">No publications match the current filters.</div>';return;}list.innerHTML=r.map(p=>{const kw=uniq(p.keywords).filter(k=>!["working","exclude"].includes(String(k).toLowerCase())).slice(0,4).map(k=>`<button type="button" class="pub-keyword" data-keyword="${attr(k)}">${esc(k)}</button>`).join("");let links=[];if(p.doi)links.push(`<a href="https://doi.org/${attr(p.doi)}" target="_blank" rel="noopener">DOI</a>`);if(p.url)links.push(`<a href="${attr(p.url)}" target="_blank" rel="noopener">Link</a>`);let badges=[p.working?'<span class="pub-badge type-working">Working paper</span>':'<span class="pub-badge type-published">Published</span>',p.abs?`<span class="pub-badge abs-badge">ABS ${esc(p.abs)}</span>`:"",p.scopus?`<span class="pub-badge scopus-badge">Scopus ${esc(p.scopus)}</span>`:""].filter(Boolean).join("");return `<article class="pub-card"><div class="pub-card-topline"><span class="pub-year">${esc(p.year)}</span><span class="pub-badge-wrap">${badges}</span></div><h3>${esc(p.title)}</h3><div class="pub-venue">${esc(p.journal||p.note||"")}</div><div class="pub-authors">${esc(authors(p.author))}</div>${kw?`<div class="pub-keywords">${kw}</div>`:""}${links.length?`<div class="pub-links">${links.join(" ")}</div>`:""}</article>`;}).join("");list.querySelectorAll(".pub-keyword").forEach(b=>b.onclick=()=>{state.activeKeyword=b.dataset.keyword||"";render();document.querySelector(".word-cloud-panel")?.scrollIntoView({behavior:"smooth",block:"start"});});}
// function render(){let r=rows();dashboard(r);cloud();note(r);cards(r);}
// function bind(){["filter-type","filter-abs","filter-scopus","filter-year","filter-sort"].forEach(id=>{let e=$(id);if(e){e.addEventListener("input",render);e.addEventListener("change",render);}});$("pub-reset")?.addEventListener("click",()=>{["filter-type","filter-abs","filter-scopus","filter-year"].forEach(id=>{if($(id))$(id).value="all"});if($("filter-sort"))$("filter-sort").value="year-desc";state.activeKeyword="";render();});$("keyword-clear")?.addEventListener("click",()=>{state.activeKeyword="";render();});}
// document.addEventListener("DOMContentLoaded",()=>{populateYears();bind();render();});
// })();


(function() {
  const state = {
    publications: Array.isArray(window.PUBLICATIONS) ? window.PUBLICATIONS : [],
    activeKeyword: ""
  };
  const $ = id => document.getElementById(id);
  const esc = v => String(v || "").replace(/[&<>'"]/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  } [c]));
  const attr = v => esc(v).replace(/`/g, "&#96;");

  function absScore(v) {
    if (!v) return 0;
    if (v === "4*") return 5;
    let n = Number(String(v).replace(/[^0-9.]/g, ""));
    return Number.isNaN(n) ? 0 : n;
  }

  function qScore(v) {
    return {
      Q1: 4,
      Q2: 3,
      Q3: 2,
      Q4: 1
    } [String(v || "").toUpperCase()] || 0;
  }

  function uniq(a) {
    return [...new Set((a || []).map(x => String(x).trim()).filter(Boolean))];
  }

  function authors(a) {
    return String(a || "").replace(/\s+and\s+/g, "; ");
  }

  function typeOK(p, t) {
    if (t === "all") return true;
    if (t === "working") return p.working === true;
    if (t === "published") return p.working !== true;
    if (t === "article") return p.entryType === "article";
    if (t === "chapter") return ["incollection", "inbook", "book"].includes(p.entryType);
    if (t === "conference") return ["inproceedings", "conference"].includes(p.entryType);
    return true;
  }

  function populateYears() {
    const y = $("filter-year");
    if (!y) return;
    const existing = new Set([...y.options].map(o => o.value));
    uniq(state.publications.map(p => p.year)).sort((a, b) => Number(b) - Number(a)).forEach(year => {
      if (existing.has(String(year))) return;
      let o = document.createElement("option");
      o.value = year;
      o.textContent = year;
      y.appendChild(o);
    });
  }

  function rows() {
    const t = $("filter-type")?.value || "all",
      a = $("filter-abs")?.value || "all",
      s = $("filter-scopus")?.value || "all",
      y = $("filter-year")?.value || "all",
      sort = $("filter-sort")?.value || "year-desc";
    let r = state.publications.filter(p => {
      if (p.excluded) return false;
      if (!typeOK(p, t)) return false;
      if (a !== "all" && String(p.abs || "") !== a) return false;
      if (s !== "all" && String(p.scopus || "") !== s) return false;
      if (y !== "all" && String(p.year || "") !== y) return false;
      if (state.activeKeyword && !(p.keywords || []).map(k => String(k).toLowerCase()).includes(state
          .activeKeyword.toLowerCase())) return false;
      return true;
    });
    r.sort((x, z) => {
      if (sort === "year-asc") return Number(x.year || 0) - Number(z.year || 0) || String(x.title).localeCompare(
        String(z.title));
      if (sort === "abs-desc") return absScore(z.abs) - absScore(x.abs) || Number(z.year || 0) - Number(x.year ||
        0);
      if (sort === "q-desc") return qScore(z.scopus) - qScore(x.scopus) || Number(z.year || 0) - Number(x.year ||
        0);
      if (sort === "title-asc") return String(x.title).localeCompare(String(z.title));
      return Number(z.year || 0) - Number(x.year || 0) || String(x.title).localeCompare(String(z.title));
    });
    return r;
  }

  function dashboard(r) {
    if ($("stat-total")) $("stat-total").textContent = r.length;
    if ($("stat-abs3plus")) $("stat-abs3plus").textContent = r.filter(p => absScore(p.abs) >= 3).length;
    if ($("stat-q1")) $("stat-q1").textContent = r.filter(p => p.scopus === "Q1").length;
    if ($("stat-working")) $("stat-working").textContent = r.filter(p => p.working).length;
  }

  function cloud() {
    const el = $("word-cloud");
    if (!el) return;
    const m = new Map();
    state.publications.forEach(p => {
      if (p.excluded) return;
      (p.keywords || []).forEach(k => {
        let low = String(k).toLowerCase();
        if (["working", "exclude"].includes(low)) return;
        m.set(k, (m.get(k) || 0) + 1);
      });
    });
    el.innerHTML = "";
    [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 18).forEach(([w, c]) => {
      let b = document.createElement("button");
      b.type = "button";
      b.className = "word-cloud-item" + (state.activeKeyword.toLowerCase() === String(w).toLowerCase() ?
        " active" : "");
      b.innerHTML = `<span>${esc(w)}</span><em>${esc(c)}</em>`;
      b.onclick = () => {
        state.activeKeyword = state.activeKeyword.toLowerCase() === String(w).toLowerCase() ? "" : w;
        render();
      };
      el.appendChild(b);
    });
  }

  function note(r) {
    const el = $("active-filter-note");
    if (!el) return;
    let parts = [];
    if (state.activeKeyword) parts.push(`theme: <strong>${esc(state.activeKeyword)}</strong>`);
    el.innerHTML = parts.length ? `${r.length} result(s) for ${parts.join(" and ")}` :
      `${r.length} publication(s) shown`;
  }

  function cards(r) {
    const list = $("publication-list");
    if (!list) return;
    if (!state.publications.length) {
      list.innerHTML =
        '<div class="pub-empty"><strong>No publication data found.</strong><br>Run <code>python build_publications_assets.py</code> in your Quarto source folder.</div>';
      return;
    }
    if (!r.length) {
      list.innerHTML = '<div class="pub-empty">No publications match the current filters.</div>';
      return;
    }
    list.innerHTML = r.map(p => {
      const kw = uniq(p.keywords).filter(k => !["working", "exclude"].includes(String(k).toLowerCase())).slice(0,
          4).map(k => `<button type="button" class="pub-keyword" data-keyword="${attr(k)}">${esc(k)}</button>`)
        .join("");
      let links = [];
      if (p.doi) links.push(`<a href="https://doi.org/${attr(p.doi)}" target="_blank" rel="noopener">Journal</a>`);
      if (p.url) links.push(`<a href="${attr(p.url)}" target="_blank" rel="noopener">SSRN</a>`);
      let badges = [p.working ? '<span class="pub-badge type-working">Working paper</span>' :
        '<span class="pub-badge type-published">Published</span>', p.abs ?
        `<span class="pub-badge abs-badge">ABS ${esc(p.abs)}</span>` : "", p.scopus ?
        `<span class="pub-badge scopus-badge">Scopus ${esc(p.scopus)}</span>` : ""
      ].filter(Boolean).join("");
      return `<article class="pub-card"><div class="pub-card-topline"><span class="pub-year">${esc(p.year)}</span><span class="pub-badge-wrap">${badges}</span></div><h3>${esc(p.title)}</h3><div class="pub-venue">${esc(p.journal||p.note||"")}</div><div class="pub-authors">${esc(authors(p.author))}</div>${kw?`<div class="pub-keywords">${kw}</div>`:""}${links.length?`<div class="pub-links">${links.join(" ")}</div>`:""}</article>`;
    }).join("");
    list.querySelectorAll(".pub-keyword").forEach(b => b.onclick = () => {
      state.activeKeyword = b.dataset.keyword || "";
      render();
      document.querySelector(".word-cloud-panel")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  }

  function render() {
    let r = rows();
    dashboard(r);
    cloud();
    note(r);
    cards(r);
  }

  function bind() {
    ["filter-type", "filter-abs", "filter-scopus", "filter-year", "filter-sort"].forEach(id => {
      let e = $(id);
      if (e) {
        e.addEventListener("input", render);
        e.addEventListener("change", render);
      }
    });
    $("pub-reset")?.addEventListener("click", () => {
      ["filter-type", "filter-abs", "filter-scopus", "filter-year"].forEach(id => {
        if ($(id)) $(id).value = "all"
      });
      if ($("filter-sort")) $("filter-sort").value = "year-desc";
      state.activeKeyword = "";
      render();
    });
    $("keyword-clear")?.addEventListener("click", () => {
      state.activeKeyword = "";
      render();
    });
  }
  document.addEventListener("DOMContentLoaded", () => {
    populateYears();
    bind();
    render();
  });
})();
const fs = require('fs');

const blocks = JSON.parse(fs.readFileSync('doc_structured.json', 'utf8'));

function esc(s) {
  return String(s)
    .replace(/&(?!amp;|lt;|gt;|quot;|#)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function isCodeLine(text) {
  // Strip inline // comment before pattern matching so "int *p = &a;  // русский" works
  const s = text.replace(/\/\/.*$/, '').trim();

  if (/^#include|^#define|^using namespace/.test(text)) return true;
  // Starts with //
  if (/^\/\//.test(text.trim())) return true;
  // SQL keywords
  if (/^(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|BEGIN|END|COMMIT|ROLLBACK|DECLARE|SET\s+@|EXEC)\b/i.test(text)) return true;
  // Just braces / semicolons
  if (/^[{};]$/.test(s)) return true;
  // Line (stripped of comment) ends with ; or {
  if (/[;{]$/.test(s) && s.length > 0) return true;
  // cout/cin with stream operators
  if (/\bcout\s*<<|\bcin\s*>>/.test(s)) return true;
  // endl alone or in expression
  if (/\bendl\b/.test(s) && !/[А-Яа-яЁё]{3}/.test(s)) return true;
  // Type declarations: int, float, double, char, void, bool, long, etc. — including pointer types (int *p)
  if (/^(int|float|double|char|void|bool|long|short|unsigned|string|auto|struct|class|const|size_t)\s*[\*&]?\s*\w/.test(s)) return true;
  if (/^\s+(int|float|double|char|bool|long|auto|string|void|struct|const)\s*[\*&]?\s*\w/.test(s)) return true;
  // Control flow
  if (/^(if\s*\(|else[\s{]|while\s*\(|for\s*\(|do\s*\{|return[\s;(]|break;|continue;|switch\s*\()/.test(s)) return true;
  // stdlib / memory functions
  if (/^(printf|scanf|malloc|calloc|realloc|free|new\s|delete[\s[;]|nullptr|NULL)\b/.test(s)) return true;
  // File I/O
  if (/^(fclose|fopen|fprintf|fscanf|fwrite|fread|fgets|fputs|feof|rewind)\b/.test(s)) return true;
  // Stream operators without Russian text
  if (/<<|>>/.test(s) && !/[А-Яа-яЁё]{3}/.test(s)) return true;
  // Function-call/definition patterns without Russian text
  if (/\w+\s*\([^)]*\)\s*[{;]/.test(s) && !/[А-Яа-яЁё]{4}/.test(s)) return true;
  // Pointer dereference / address-of assignment: *p = ...; or p = &a;
  if (/^[\*&]?\w[\w\[\].>*-]*\s*[+\-*/%]?=/.test(s) && /[;]$/.test(s) && !/[А-Яа-яЁё]/.test(s)) return true;
  return false;
}

function isSubheading(text) {
  if (text.length > 100) return false;
  if (text.endsWith(':') || text.endsWith('?')) return true;
  const headingPhrases = [
    'Состав', 'Виды', 'Типы', 'Основные', 'Классификация', 'Преимущества',
    'Недостатки', 'Структура', 'Принцип', 'Применение', 'Примеры IDE',
    'История', 'Три уровня', 'Ключевые', 'Синтаксис', 'Результат', 'Аналогия',
    'Особенности', 'Ограничения', 'Свойства', 'Формы записи',
    'Что такое', 'Трансляторы', 'Этапы разработки'
  ];
  return headingPhrases.some(p => text.startsWith(p));
}

function renderContent(content) {
  // Group items into segments for proper merging
  const segments = [];
  let i = 0;
  while (i < content.length) {
    const item = content[i];
    if (item.style === '16') {
      const seg = {type: 'list', items: []};
      while (i < content.length && content[i].style === '16') {
        seg.items.push(content[i].text);
        i++;
      }
      segments.push(seg);
    } else if (item.style === 'code') {
      // Explicit code style (fenced blocks, tables, diagrams)
      const seg = {type: 'code', lines: []};
      while (i < content.length && content[i].style === 'code') {
        seg.lines.push(content[i].text);
        i++;
      }
      segments.push(seg);
    } else if (item.style === 'h4') {
      segments.push({type: 'h4', text: item.text});
      i++;
    } else if (isCodeLine(item.text)) {
      const seg = {type: 'code', lines: []};
      while (i < content.length && content[i].style !== '16' && content[i].style !== 'h4'
             && content[i].style !== 'code' && isCodeLine(content[i].text)) {
        seg.lines.push(content[i].text);
        i++;
      }
      segments.push(seg);
    } else {
      const type = isSubheading(item.text) ? 'h4' : 'p';
      segments.push({type, text: item.text});
      i++;
    }
  }

  let html = '';
  for (const seg of segments) {
    if (seg.type === 'list') {
      html += '<ul>' + seg.items.map(t => '<li>' + esc(t) + '</li>').join('') + '</ul>';
    } else if (seg.type === 'code') {
      html += '<div class="code-wrap"><button class="code-copy-btn" onclick="copyCode(this)" title="Копировать код">&#128203;</button><pre><code>' + seg.lines.map(l => esc(l)).join('\n') + '</code></pre></div>';
    } else if (seg.type === 'h4') {
      html += '<h4>' + esc(seg.text) + '</h4>';
    } else {
      html += '<p>' + esc(seg.text) + '</p>';
    }
  }
  return html;
}

let totalQ = 0;
blocks.forEach(b => { totalQ += b.questions.length; });

// Build sidebar
let sidebarHtml = '';
blocks.forEach((block, bi) => {
  sidebarHtml += '<div class="sb-block">';
  sidebarHtml += '<div class="sb-block-hdr" onclick="toggleSbBlock(' + (bi+1) + ')" id="sb-header-' + (bi+1) + '">';
  sidebarHtml += '<span class="sb-arrow" id="sb-arrow-' + (bi+1) + '">&#9660;</span> ' + esc(block.title);
  sidebarHtml += '</div>';
  sidebarHtml += '<ul class="sb-questions" id="sb-list-' + (bi+1) + '">';
  block.questions.forEach((q, qi) => {
    const qId = 'q-' + (bi+1) + '-' + (qi+1);
    const qNum = (q.title.match(/^Вопрос (\d+)/) || ['', qi+1])[1];
    const shortTitle = q.title.replace(/^Вопрос \d+\.\s*/, '');
    const displayTitle = shortTitle.length > 52 ? shortTitle.substring(0, 52) + '…' : shortTitle;
    sidebarHtml += '<li><a href="#' + qId + '" class="sb-link" onclick="openQ(\'' + qId + '\')">';
    sidebarHtml += '<span class="sb-num">' + qNum + '</span>' + esc(displayTitle);
    sidebarHtml += '</a></li>';
  });
  sidebarHtml += '</ul></div>';
});

// Build main content
let mainHtml = '';
blocks.forEach((block, bi) => {
  mainHtml += '<section class="block-section" id="block-' + (bi+1) + '" data-block="' + (bi+1) + '">';
  mainHtml += '<h2 class="block-title">' + esc(block.title) + '</h2>';
  block.questions.forEach((q, qi) => {
    const qId = 'q-' + (bi+1) + '-' + (qi+1);
    const searchData = (q.title + ' ' + q.content.map(c => c.text).join(' ')).toLowerCase().substring(0, 500);
    const bodyContent = renderContent(q.content);
    mainHtml += '<div class="question-card" id="' + qId + '" data-block="' + (bi+1) + '" data-search="' + esc(searchData) + '">';
    mainHtml += '<div class="question-header" onclick="toggleQ(\'' + qId + '\')">';
    mainHtml += '<span class="q-num">' + (qi+1) + '</span>';
    mainHtml += '<span class="q-arrow" id="arr-' + qId + '">&#9658;</span>';
    mainHtml += '<span class="q-title">' + esc(q.title) + '</span>';
    mainHtml += '</div>';
    mainHtml += '<div class="question-body" id="body-' + qId + '">';
    mainHtml += bodyContent;
    mainHtml += '</div>';
    mainHtml += '</div>';
  });
  mainHtml += '</section>';
});

// Block filter buttons
let filterTabsHtml = '<button class="filter-tab active" data-block="all" onclick="filterBlock(\'all\', this)">Все (' + totalQ + ')</button>';
blocks.forEach((b, bi) => {
  const shortName = b.title.replace(/^БЛОК \d+\.\s*/, '');
  filterTabsHtml += '<button class="filter-tab" data-block="' + (bi+1) + '" onclick="filterBlock(' + (bi+1) + ', this)">Блок ' + (bi+1) + ': ' + esc(shortName.substring(0,28)) + (shortName.length > 28 ? '…' : '') + '</button>';
});

const html = `<!DOCTYPE html>
<html lang="ru" data-theme="dark">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Экзаменационные ответы — Python и инструментальные средства разработки</title>
<style>
/* ── THEMES ── */
[data-theme="dark"] {
  --bg:#0f1117;--surface:#1a1d27;--surface2:#21253a;--border:#2e3250;
  --accent:#6c8ef5;--accent2:#4ade80;--accent3:#f97316;
  --text:#e2e8f0;--text-muted:#8892b0;--code-bg:#0d1117;--code-text:#a8d8a8;
  --shadow:rgba(0,0,0,.5);--card-hover:rgba(108,142,245,.15);
  --theme-icon:"☀";
}
[data-theme="light"] {
  --bg:#f0f4fb;--surface:#ffffff;--surface2:#f5f7ff;--border:#dde3f5;
  --accent:#4a6cf7;--accent2:#16a34a;--accent3:#ea580c;
  --text:#1a1f36;--text-muted:#5a6480;--code-bg:#f3f5fc;--code-text:#1a6e3c;
  --shadow:rgba(80,100,180,.12);--card-hover:rgba(74,108,247,.08);
  --theme-icon:"🌙";
}

/* ── RESET ── */
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Segoe UI',system-ui,sans-serif;background:var(--bg);color:var(--text);font-size:15px;line-height:1.65;transition:background .25s,color .25s}
a{color:inherit;text-decoration:none}

/* ── TOPBAR ── */
.topbar{position:fixed;top:0;left:0;right:0;height:56px;background:var(--surface);border-bottom:1px solid var(--border);display:flex;align-items:center;gap:12px;padding:0 16px;z-index:1000;box-shadow:0 2px 12px var(--shadow);transition:background .25s,border-color .25s}
.topbar-logo{font-weight:700;font-size:15px;color:var(--accent);white-space:nowrap}
.topbar-sub{color:var(--text-muted);font-size:12px;white-space:nowrap}
.search-wrap{flex:1;max-width:480px;position:relative}
.search-wrap input{width:100%;padding:8px 44px 8px 34px;border-radius:20px;border:1.5px solid var(--border);background:var(--surface2);color:var(--text);font-size:14px;outline:none;transition:border-color .2s,background .25s}
.search-wrap input:focus{border-color:var(--accent)}
.search-wrap input::placeholder{color:var(--text-muted)}
.search-icon{position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--text-muted);pointer-events:none;font-size:14px}
.search-kbd{position:absolute;right:10px;top:50%;transform:translateY(-50%);color:var(--text-muted);font-size:11px;background:var(--surface);padding:1px 5px;border-radius:4px;border:1px solid var(--border);pointer-events:none}
.topbar-count{font-size:12px;color:var(--text-muted);white-space:nowrap;min-width:72px;text-align:right}
.topbar-actions{display:flex;gap:6px;align-items:center}
.theme-btn{background:none;border:1.5px solid var(--border);border-radius:8px;padding:5px 9px;cursor:pointer;font-size:15px;color:var(--text-muted);transition:all .2s;line-height:1}
.theme-btn:hover{border-color:var(--accent);color:var(--accent)}
.dl-btn{padding:7px 14px;background:var(--accent);color:#fff;border-radius:20px;font-size:13px;font-weight:600;white-space:nowrap;border:none;cursor:pointer;transition:opacity .2s}
.dl-btn:hover{opacity:.85}

/* ── PROGRESS ── */
.progress{position:fixed;top:56px;left:0;height:2px;background:linear-gradient(90deg,var(--accent),var(--accent2));width:0;z-index:999;transition:width .1s}

/* ── LAYOUT ── */
.layout{display:flex;margin-top:56px;min-height:calc(100vh - 56px)}

/* ── SIDEBAR ── */
.sidebar{width:300px;min-width:300px;background:var(--surface);border-right:1px solid var(--border);position:fixed;top:56px;bottom:0;left:0;overflow-y:auto;overflow-x:hidden;padding:8px 0 48px;transition:background .25s,border-color .25s}
.sidebar::-webkit-scrollbar{width:3px}
.sidebar::-webkit-scrollbar-thumb{background:var(--border);border-radius:4px}
.sb-block{margin-bottom:2px}
.sb-block-hdr{display:flex;align-items:center;gap:7px;padding:10px 14px;font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.8px;cursor:pointer;user-select:none;border-left:3px solid transparent;transition:all .15s}
.sb-block-hdr:hover{color:var(--accent);background:var(--surface2)}
.sb-arrow{font-size:9px;transition:transform .2s;flex-shrink:0}
.sb-questions{list-style:none;overflow:hidden;transition:max-height .3s ease}
.sb-questions.closed{max-height:0!important}
.sb-link{display:flex;align-items:baseline;gap:6px;padding:5px 14px 5px 22px;font-size:12.5px;color:var(--text-muted);transition:all .15s;border-left:3px solid transparent;line-height:1.4}
.sb-link:hover{color:var(--text);background:var(--surface2);border-left-color:var(--accent)}
.sb-link.active{color:var(--accent);border-left-color:var(--accent);background:var(--card-hover)}
.sb-num{font-size:11px;font-weight:700;color:var(--border);flex-shrink:0;min-width:18px}
.sb-link.active .sb-num{color:var(--accent)}

/* ── MAIN ── */
.main{margin-left:300px;flex:1;padding:20px 28px 80px;max-width:920px}

/* ── FILTER TABS ── */
.filter-tabs{display:flex;gap:6px;margin-bottom:18px;flex-wrap:wrap}
.filter-tab{padding:5px 12px;border-radius:16px;border:1px solid var(--border);background:transparent;color:var(--text-muted);font-size:12.5px;cursor:pointer;transition:all .15s;white-space:nowrap}
.filter-tab:hover{border-color:var(--accent);color:var(--accent)}
.filter-tab.active{background:var(--accent);color:#fff;border-color:var(--accent)}

/* ── BLOCK SECTION ── */
.block-section{margin-bottom:32px}
.block-title{font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--accent2);padding:6px 0 10px;border-bottom:1px solid var(--border);margin-bottom:12px;transition:color .25s}

/* ── QUESTION CARD ── */
.question-card{background:var(--surface);border:1px solid var(--border);border-radius:8px;margin-bottom:6px;overflow:hidden;transition:border-color .15s,background .25s}
.question-card:hover{border-color:rgba(108,142,245,.4)}
.question-card.open{border-color:var(--accent)}
.question-card.hidden{display:none}
.question-header{display:flex;align-items:flex-start;gap:8px;padding:13px 14px;cursor:pointer;user-select:none;position:relative}
.question-header:hover{background:var(--surface2)}
.q-num{font-size:11px;font-weight:700;color:var(--text-muted);min-width:20px;margin-top:2px;flex-shrink:0}
.q-arrow{color:var(--accent);font-size:11px;margin-top:3px;transition:transform .2s;flex-shrink:0}
.question-card.open .q-arrow{transform:rotate(90deg)}
.q-title{font-size:14px;font-weight:600;color:var(--text);line-height:1.4;flex:1}

/* ── CODE COPY BUTTON ── */
.code-wrap{position:relative;margin:8px 0}
.code-wrap pre{margin:0}
.code-copy-btn{position:absolute;top:7px;right:8px;background:var(--surface2);border:1px solid var(--border);border-radius:5px;padding:3px 7px;font-size:12px;cursor:pointer;color:var(--text-muted);opacity:0;transition:opacity .15s,background .15s,color .15s,border-color .15s;line-height:1;z-index:2}
.code-wrap:hover .code-copy-btn{opacity:1}
.code-copy-btn:hover{background:var(--accent);color:#fff;border-color:var(--accent)}
.code-copy-btn.copied{opacity:1;background:var(--accent2);color:#fff;border-color:var(--accent2)}

/* ── QUESTION BODY ── */
.question-body{padding:0 16px 16px 46px;display:none}
.question-card.open .question-body{display:block}
.question-body h4{font-size:11.5px;font-weight:700;color:var(--accent);margin:14px 0 7px;text-transform:uppercase;letter-spacing:.5px}
.question-body p{margin:0 0 9px;color:var(--text);font-size:14px;transition:color .25s}
.question-body ul{margin:3px 0 10px 14px}
.question-body li{margin-bottom:5px;font-size:14px;color:var(--text);transition:color .25s}
.question-body pre{background:var(--code-bg);border:1px solid var(--border);border-radius:6px;padding:10px 14px;margin:8px 0;overflow-x:auto;transition:background .25s,border-color .25s}
.question-body code{font-family:'Cascadia Code','Fira Code',Consolas,monospace;font-size:12.5px;color:var(--code-text);line-height:1.55;white-space:pre;transition:color .25s}

/* ── HIGHLIGHT ── */
mark{background:rgba(108,142,245,.22);color:var(--accent);border-radius:2px;padding:0 1px}
[data-theme="light"] mark{background:rgba(74,108,247,.15)}

/* ── NO RESULTS ── */
.no-results{text-align:center;padding:50px 20px;color:var(--text-muted);font-size:15px;display:none}
.no-results.show{display:block}

/* ── SCROLL TOP ── */
.scroll-top{position:fixed;bottom:22px;right:22px;width:38px;height:38px;background:var(--accent);border:none;border-radius:50%;color:#fff;font-size:16px;cursor:pointer;opacity:0;transition:opacity .25s;box-shadow:0 3px 12px var(--shadow);z-index:500}
.scroll-top.visible{opacity:1}

/* ── TOAST ── */
.toast{position:fixed;bottom:70px;right:22px;background:var(--surface);border:1px solid var(--accent2);border-radius:8px;padding:8px 16px;font-size:13px;color:var(--accent2);z-index:600;opacity:0;transform:translateY(8px);transition:opacity .2s,transform .2s;pointer-events:none}
.toast.show{opacity:1;transform:translateY(0)}

@media(max-width:768px){
  .sidebar{display:none}
  .main{margin-left:0;padding:12px 14px 60px}
  .topbar-sub,.topbar-count{display:none}
}
</style>
</head>
<body>

<div class="topbar">
  <div class="topbar-logo">&#128218; Ответы</div>
  <div class="topbar-sub">Python · Инструментальные средства разработки</div>
  <div class="search-wrap">
    <span class="search-icon">&#128269;</span>
    <input type="text" id="searchInput" placeholder="Поиск (/) по вопросам и ответам..." autocomplete="off" spellcheck="false">
    <span class="search-kbd">/</span>
  </div>
  <div class="topbar-count" id="countLabel">${totalQ} вопросов</div>
  <div class="topbar-actions">
    <button class="theme-btn" id="themeBtn" onclick="toggleTheme()" title="Сменить тему">&#9790;</button>
    <a href="index.html" class="dl-btn">&#11015; Скачать</a>
  </div>
</div>

<div class="progress" id="progressBar"></div>
<div class="toast" id="toast">&#10003; Скопировано!</div>

<div class="layout">
  <nav class="sidebar" id="sidebar">${sidebarHtml}</nav>
  <main class="main">
    <div class="filter-tabs">${filterTabsHtml}</div>
    ${mainHtml}
    <div class="no-results" id="noResults">&#128269; Ничего не найдено. Попробуйте другой запрос.</div>
  </main>
</div>

<button class="scroll-top" id="scrollTop" onclick="window.scrollTo({top:0,behavior:'smooth'})" title="Наверх">&#8679;</button>

<script>
var activeBlock = 'all';
var TOTAL = ${totalQ};

/* ── THEME ── */
function toggleTheme() {
  var html = document.documentElement;
  var next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  document.getElementById('themeBtn').textContent = next === 'dark' ? '\\u263e' : '\\u2600\\ufe0f';
  try { localStorage.setItem('exam-theme', next); } catch(e) {}
}
(function() {
  try {
    var saved = localStorage.getItem('exam-theme');
    if (saved) {
      document.documentElement.setAttribute('data-theme', saved);
      document.getElementById('themeBtn').textContent = saved === 'dark' ? '\\u263e' : '\\u2600\\ufe0f';
    }
  } catch(e) {}
})();

/* ── COPY CODE ── */
function copyCode(btn) {
  var code = btn.parentElement.querySelector('code');
  if (!code) return;
  var text = code.textContent || '';
  navigator.clipboard.writeText(text.trim()).then(function() {
    btn.classList.add('copied');
    btn.textContent = '\\u2713';
    showToast();
    setTimeout(function() { btn.classList.remove('copied'); btn.innerHTML = '&#128203;'; }, 2000);
  }).catch(function() {
    var ta = document.createElement('textarea');
    ta.value = text.trim();
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast();
  });
}

function showToast() {
  var t = document.getElementById('toast');
  t.classList.add('show');
  setTimeout(function() { t.classList.remove('show'); }, 1800);
}

/* ── ACCORDION ── */
function toggleQ(id) {
  var card = document.getElementById(id);
  if (!card) return;
  card.classList.toggle('open');
  setActiveSbLink(id);
}
function openQ(id) {
  var card = document.getElementById(id);
  if (card && !card.classList.contains('open')) card.classList.add('open');
  setActiveSbLink(id);
}
function setActiveSbLink(id) {
  document.querySelectorAll('.sb-link').forEach(function(l){ l.classList.remove('active'); });
  var link = document.querySelector('.sb-link[href="#'+id+'"]');
  if (link) link.classList.add('active');
}
function toggleSbBlock(n) {
  var list = document.getElementById('sb-list-'+n);
  var arrow = document.getElementById('sb-arrow-'+n);
  if (list.classList.contains('closed')) {
    list.classList.remove('closed');
    arrow.style.transform = '';
  } else {
    list.classList.add('closed');
    arrow.style.transform = 'rotate(-90deg)';
  }
}

/* ── FILTER ── */
function filterBlock(block, btn) {
  activeBlock = block;
  document.querySelectorAll('.filter-tab').forEach(function(b){ b.classList.remove('active'); });
  btn.classList.add('active');
  runSearch();
}

/* ── SEARCH ── */
var searchInput = document.getElementById('searchInput');
var countLabel = document.getElementById('countLabel');
var noResults = document.getElementById('noResults');

function runSearch() {
  var q = searchInput.value.toLowerCase().trim();
  var cards = document.querySelectorAll('.question-card');
  var visible = 0;
  cards.forEach(function(card) {
    var cardBlock = parseInt(card.getAttribute('data-block'));
    var blockOk = activeBlock === 'all' || cardBlock === activeBlock;
    var searchText = card.getAttribute('data-search') || '';
    var titleEl = card.querySelector('.q-title');
    var titleText = titleEl ? titleEl.textContent.toLowerCase() : '';
    var matchSearch = !q || titleText.includes(q) || searchText.includes(q);
    if (blockOk && matchSearch) {
      card.classList.remove('hidden');
      visible++;
      if (q && q.length >= 2) {
        if (titleEl) titleEl.innerHTML = highlight(titleEl.textContent, q);
        card.classList.add('open');
      } else {
        if (titleEl) titleEl.innerHTML = escHtml(titleEl.textContent);
      }
    } else {
      card.classList.add('hidden');
    }
  });
  document.querySelectorAll('.block-section').forEach(function(section) {
    var any = section.querySelectorAll('.question-card:not(.hidden)').length > 0;
    section.style.display = any ? '' : 'none';
  });
  noResults.classList.toggle('show', visible === 0);
  countLabel.textContent = (q || activeBlock !== 'all') ? (visible + ' из ' + TOTAL) : (TOTAL + ' вопросов');
}

function escHtml(s) {
  return s.replace(/[<>&"]/g, function(c){ return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]; });
}
function highlight(text, q) {
  var safe = escHtml(text);
  if (!q) return safe;
  var lower = safe.toLowerCase();
  var ql = q.toLowerCase();
  var result = '';
  var i = 0;
  while (i < safe.length) {
    var j = lower.indexOf(ql, i);
    if (j < 0) { result += safe.substring(i); break; }
    result += safe.substring(i, j) + '<mark>' + safe.substring(j, j + q.length) + '</mark>';
    i = j + q.length;
  }
  return result;
}

searchInput.addEventListener('input', runSearch);

/* ── KEYBOARD ── */
document.addEventListener('keydown', function(e) {
  // Use e.code to catch physical slash key regardless of keyboard layout (RU/EN)
  if (e.code === 'Slash' && document.activeElement !== searchInput) {
    e.preventDefault(); searchInput.focus(); searchInput.select();
  } else if (e.key === 'Escape') {
    searchInput.value = ''; runSearch(); searchInput.blur();
  }
});

/* ── SCROLL ── */
var progressBar = document.getElementById('progressBar');
var scrollTopBtn = document.getElementById('scrollTop');
window.addEventListener('scroll', function() {
  var total = document.documentElement.scrollHeight - window.innerHeight;
  if (total > 0) progressBar.style.width = (window.scrollY / total * 100) + '%';
  scrollTopBtn.classList.toggle('visible', window.scrollY > 300);
  var cards = Array.from(document.querySelectorAll('.question-card:not(.hidden)'));
  var activeId = null;
  for (var i = 0; i < cards.length; i++) {
    if (cards[i].getBoundingClientRect().top < 100) activeId = cards[i].id;
  }
  if (activeId) {
    var newActive = document.querySelector('.sb-link[href="#'+activeId+'"]');
    if (newActive && !newActive.classList.contains('active')) {
      document.querySelectorAll('.sb-link').forEach(function(l){ l.classList.remove('active'); });
      newActive.classList.add('active');
      var sidebar = document.getElementById('sidebar');
      var linkTop = newActive.offsetTop;
      if (linkTop < sidebar.scrollTop || linkTop > sidebar.scrollTop + sidebar.clientHeight - 60) {
        sidebar.scrollTop = linkTop - sidebar.clientHeight / 2;
      }
    }
  }
}, {passive:true});

/* ── INIT ── */
document.querySelectorAll('.block-section').forEach(function(section) {
  var first = section.querySelector('.question-card');
  if (first) first.classList.add('open');
});
if (location.hash) {
  var el = document.getElementById(location.hash.slice(1));
  if (el) { el.classList.add('open'); setTimeout(function(){ el.scrollIntoView({behavior:'smooth',block:'start'}); }, 200); }
}
</script>
</body>
</html>`;

fs.writeFileSync('answers.html', html, 'utf8');
console.log('answers.html written:', html.length, 'bytes');

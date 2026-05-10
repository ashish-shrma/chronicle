// Chronicle — vanilla JS app
// Reads from /data/articles.json and /data/categories.json
// Target VEC custom code dispatches 'chronicle:experience' to switch layout

const ECID_ORG_ID = 'B504732B5D3B2A790A495ECF@AdobeOrg';
const LS_KEY = 'chronicle.demo.reader';
const SS_SYNCED = 'chronicle.ids.synced'; // sessionStorage flag: IDs confirmed in AMCV this session
const AUTHENTICATED = 1;
const LOGGED_OUT = 2;
const HOME_CATS = ['tech', 'world', 'business', 'science'];

const READERS = [
  { id: 'reader_001', name: 'Aarav',  tier: 'premium', region: 'IN', topics: 'tech,science' },
  { id: 'reader_002', name: 'Priya',  tier: 'free',    region: 'IN', topics: 'world,culture' },
  { id: 'reader_003', name: 'Sarah',  tier: 'premium', region: 'US', topics: 'business,tech' },
  { id: 'reader_004', name: 'James',  tier: 'free',    region: 'UK', topics: 'sports,world' },
  { id: 'reader_005', name: 'Yuki',   tier: 'premium', region: 'JP', topics: 'culture,science' },
  { id: 'reader_006', name: 'Carlos', tier: 'free',    region: 'MX', topics: 'world,business' },
  { id: 'reader_007', name: 'Fatima', tier: 'premium', region: 'AE', topics: 'world,culture,science' },
  { id: 'reader_008', name: 'Wei',    tier: 'free',    region: 'SG', topics: 'tech' },
  { id: 'reader_009', name: 'Olivia', tier: 'premium', region: 'UK', topics: 'culture,business' },
  { id: 'reader_010', name: 'Rohit',  tier: 'free',    region: 'IN', topics: 'sports,tech' }
];

// ─── Data ───────────────────────────────────────────────────────────────────

let _articles = [];
let _categories = [];
let _dataLoaded = false;

async function loadData() {
  if (_dataLoaded) return;
  const [a, c] = await Promise.all([
    fetch('/data/articles.json').then(r => r.json()),
    fetch('/data/categories.json').then(r => r.json())
  ]);
  _articles = a.articles || [];
  _categories = c.categories || [];
  _dataLoaded = true;
}

function byCategory(slug) { return _articles.filter(a => a.category === slug); }
function topN(slug, n) { return byCategory(slug).slice(0, n); }
function heroByTopics(topics) {
  if (!topics.length) return _articles[0] || null;
  return _articles.find(a => topics.includes(a.category))
      || _articles.find(a => a.tags && a.tags.some(t => topics.includes(t)))
      || _articles[0]
      || null;
}

// ─── Rendering helpers ───────────────────────────────────────────────────────

function fmtDate(iso) {
  try { return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }); }
  catch { return ''; }
}

function esc(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function cardHtml(article, size = 'md') {
  const img = article.imageUrl && size !== 'sm'
    ? `<img src="${esc(article.imageUrl)}" alt="" loading="lazy">`
    : '';
  const summary = size !== 'sm'
    ? `<div class="card-summary">${esc(article.summary)}</div>`
    : '';
  return `
    <div class="card card-${esc(size)}" data-article-id="${esc(article.id)}">
      <a href="/article/${esc(article.id)}">
        ${img}
        <div class="card-source">${esc(article.source)} · ${esc(article.category)}</div>
        <div class="card-title">${esc(article.title)}</div>
        ${summary}
        <div class="card-meta">${article.readTimeMinutes} min read · ${fmtDate(article.publishedAt)}</div>
      </a>
    </div>`;
}

function gridHtml(articles, cols, size = 'md') {
  return `<div class="grid grid-${cols}">${articles.map(a => cardHtml(a, size)).join('')}</div>`;
}

function categorySectionHtml(cat, articles, cols) {
  return `
    <section class="cat-section target-zone" data-zone="cat-${esc(cat.slug)}" data-category="${esc(cat.slug)}">
      <div class="cat-section-header">
        <h2 class="cat-section-title">${esc(cat.name)}</h2>
        <a href="/category/${esc(cat.slug)}" class="cat-section-more">More in ${esc(cat.name)} →</a>
      </div>
      ${gridHtml(articles.slice(0, cols), cols)}
    </section>`;
}

function recsPlaceholderHtml(zone, title) {
  return `
    <section class="section-wrap target-zone" data-zone="${esc(zone)}">
      <h2 class="section-title">${esc(title)}</h2>
      <div class="recs-placeholder">Recommendations appear here once Adobe Target activity is live.</div>
    </section>`;
}

function adPlaceholderHtml() {
  return `<div class="ad-placeholder">Advertisement</div>`;
}

function experienceBadgeHtml(experience) {
  if (experience === 'premium') {
    return `<div class="exp-badge exp-badge-premium"><span class="exp-badge-dot"></span>Premium experience · Adobe Target</div>`;
  }
  if (experience === 'free') {
    return `<div class="exp-badge exp-badge-free"><span class="exp-badge-dot"></span>Free tier experience · Adobe Target</div>`;
  }
  return '';
}

// ─── Nav ────────────────────────────────────────────────────────────────────

function renderNav() {
  const navEl = document.getElementById('site-nav');
  if (!navEl) return;
  const currentPath = location.pathname;
  const links = _categories.map(c =>
    `<a href="/category/${esc(c.slug)}" class="${currentPath.includes(c.slug) ? 'active' : ''}">${esc(c.name)}</a>`
  ).join('');
  navEl.innerHTML = links + `<a href="/about" style="color:var(--muted)">About</a>`;
}

// ─── Homepage ────────────────────────────────────────────────────────────────

let _experience = 'default';
let _topics = [];

function homepageLayoutHtml(experience, topics) {
  const isPremium = experience === 'premium';
  const isFree = experience === 'free';
  const cols = isPremium ? 5 : 4;
  const hero = heroByTopics(isPremium ? topics : []);

  const order = isPremium && topics.length
    ? [...topics.filter(t => HOME_CATS.includes(t)), ...HOME_CATS.filter(t => !topics.includes(t))]
    : HOME_CATS;

  const sections = order.map(slug => {
    const cat = _categories.find(c => c.slug === slug);
    if (!cat) return '';
    return categorySectionHtml(cat, topN(slug, cols), cols);
  }).join('');

  return `
    ${experienceBadgeHtml(experience)}
    <section class="hero-section target-zone" data-zone="hero">
      ${hero ? cardHtml(hero, 'lg') : '<p style="color:var(--muted);font-family:var(--sans)">No articles yet — run the ingest pipeline.</p>'}
    </section>
    ${isFree ? adPlaceholderHtml() : ''}
    ${recsPlaceholderHtml('recently-viewed', 'Recently viewed')}
    <div class="target-zone" data-zone="category-sections">
      ${sections}
    </div>
    ${recsPlaceholderHtml('for-you', 'For you')}`;
}

function renderHomepage() {
  const layout = document.getElementById('homepage-layout');
  if (!layout) return;
  layout.innerHTML = homepageLayoutHtml(_experience, _topics);
  renderNav();
}

function applyExperience(experience, topics) {
  _experience = experience;
  _topics = topics || [];

  // keep data layer in sync for Analytics
  if (window.chronicleData) {
    window.chronicleData.experience = experience;
  }

  renderHomepage();
}

// ─── Article page ────────────────────────────────────────────────────────────

function renderArticle() {
  const id = location.pathname.split('/').filter(Boolean).pop()
    || new URLSearchParams(location.search).get('id')
    || '';
  const mount = document.getElementById('article-mount');
  if (!mount) return;

  const article = _articles.find(a => a.id === id);
  if (!article) {
    mount.innerHTML = `<div class="not-found"><h1>Article not found</h1><p><a href="/">← Back to homepage</a></p></div>`;
    return;
  }

  // Update data layer with full article data for any re-evaluation
  window.chronicleData = window.chronicleData || {};
  window.chronicleData.page = { type: 'article', category: article.category, articleId: article.id };
  window.chronicleData.article = {
    id: article.id, title: article.title, category: article.category,
    source: article.source, publishedAt: article.publishedAt,
    readTimeMinutes: article.readTimeMinutes, tags: article.tags || []
  };

  const paragraphs = article.body.split(/\n+/).filter(Boolean)
    .map(p => `<p>${esc(p)}</p>`).join('');
  const tags = (article.tags || []).slice(0, 8)
    .map(t => `<span class="article-tag">${esc(t)}</span>`).join('');

  mount.innerHTML = `
    <div class="article-wrap">
      <div class="article-kicker">${esc(article.source)} · ${esc(article.category)}</div>
      <h1 class="article-title">${esc(article.title)}</h1>
      <div class="article-byline">
        ${article.author ? `By ${esc(article.author)} · ` : ''}
        ${fmtDate(article.publishedAt)} · ${article.readTimeMinutes} min read
      </div>
      ${article.imageUrl ? `<img class="article-image" src="${esc(article.imageUrl)}" alt="">` : ''}
      <div class="article-body">${paragraphs}</div>
      <a href="${esc(article.originalUrl)}" target="_blank" rel="noopener noreferrer"
         class="article-read-full" data-track="read-full">
        Read the full article on ${esc(article.source)} →
      </a>
      ${tags ? `<div class="article-tags">${tags}</div>` : ''}
    </div>
    <div style="margin-top:3rem">
      ${recsPlaceholderHtml('related', 'Related articles')}
    </div>`;

  document.title = `${article.title} — Chronicle`;
  renderNav();
  initScrollDepth(article.id);
  initReadFullTracking();
}

// ─── Category page ────────────────────────────────────────────────────────────

function renderCategory() {
  const slug = location.pathname.split('/').filter(Boolean).pop()
    || new URLSearchParams(location.search).get('slug')
    || '';
  const mount = document.getElementById('category-mount');
  if (!mount) return;

  const cat = _categories.find(c => c.slug === slug);
  const articles = byCategory(slug).slice(0, 24);

  if (!cat) {
    mount.innerHTML = `<div class="not-found"><h1>Category not found</h1><p><a href="/">← Back to homepage</a></p></div>`;
    return;
  }

  mount.innerHTML = `
    <div class="cat-page-header">
      <div class="cat-page-kicker">Category</div>
      <h1 class="cat-page-title">${esc(cat.name)}</h1>
      <p class="cat-page-desc">${esc(cat.description)}</p>
    </div>
    ${articles.length ? gridHtml(articles, 3) : '<p style="color:var(--muted);font-family:var(--sans)">No articles in this category yet.</p>'}`;

  document.title = `${cat.name} — Chronicle`;
  renderNav();
}

// ─── About page ──────────────────────────────────────────────────────────────

function renderAbout() {
  renderNav();
}

// ─── Scroll depth ─────────────────────────────────────────────────────────────

function initScrollDepth(articleId) {
  const fired = new Set();
  const thresholds = [0.25, 0.5, 0.75, 1.0];
  function onScroll() {
    const doc = document.documentElement;
    const total = doc.scrollHeight - doc.clientHeight;
    if (total <= 0) return;
    const pct = Math.min(1, doc.scrollTop / total);
    for (const t of thresholds) {
      if (pct >= t && !fired.has(t)) {
        fired.add(t);
        if (window._satellite && window._satellite.track) {
          window._satellite.track('scrollDepth', { articleId, depth: t, 'article.scrollDepth': t });
        }
      }
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
}

function initReadFullTracking() {
  document.querySelectorAll('[data-track="read-full"]').forEach(el => {
    el.addEventListener('click', () => {
      if (window._satellite && window._satellite.track) {
        const id = window.chronicleData?.article?.id || '';
        window._satellite.track('readFullClick', { articleId: id });
      }
    });
  });
}

// ─── Reader Picker ────────────────────────────────────────────────────────────

function setCustomerId(id, authState) {
  if (!window.Visitor || !ECID_ORG_ID) return false;
  try {
    window.Visitor.getInstance(ECID_ORG_ID).setCustomerIDs({
      crm_id: { id, authState }
    });
    return true;
  } catch (e) {
    console.warn('[reader-picker] setCustomerIDs failed', e);
    return false;
  }
}

function whenVisitorReady(id, authState, callback) {
  let attempts = 0;
  let cancelled = false;
  let timer = null;
  function attempt() {
    if (cancelled) return;
    if (setCustomerId(id, authState)) {
      if (!cancelled) callback();
    } else if (attempts++ < 50) {
      timer = setTimeout(attempt, 100);
    }
  }
  attempt();
  return function cancel() { cancelled = true; if (timer) clearTimeout(timer); };
}

function initReaderPicker() {
  const mount = document.getElementById('reader-picker-mount');
  if (!mount) return;

  const savedId = localStorage.getItem(LS_KEY);

  if (savedId) {
    if (!sessionStorage.getItem(SS_SYNCED)) {
      // First load this tab session with a saved reader. AMCV may not have the ID yet
      // (e.g. fresh incognito tab). Set IDs then reload so the next page load request
      // carries customerIds in the AMCV cookie before at.js fires.
      sessionStorage.setItem(SS_SYNCED, '1');
      whenVisitorReady(savedId, AUTHENTICATED, () => location.reload());
    } else {
      // Already reloaded once this session — just reinforce the IDs (no reload)
      whenVisitorReady(savedId, AUTHENTICATED, () => {});
    }
  }

  function buildUI() {
    const current = READERS.find(r => r.id === (localStorage.getItem(LS_KEY) || ''));
    mount.innerHTML = `
      <div class="reader-picker">
        <button class="rp-btn" id="rp-toggle">
          ${current ? `👤 ${current.name} (${current.tier})` : 'Demo: pick reader'}
        </button>
        <div class="rp-panel" id="rp-panel">
          <div class="rp-label">Demo: Reader Picker — simulates authenticated session</div>
          <div class="rp-list">
            ${READERS.map(r => `
              <button class="rp-item${current && current.id === r.id ? ' active' : ''}" data-reader-id="${r.id}">
                <div class="rp-item-name">${r.name} <span class="rp-item-meta">· ${r.tier} · ${r.region}</span></div>
                <div class="rp-item-meta">${r.topics}</div>
              </button>`).join('')}
          </div>
          ${current ? `<button class="rp-logout" id="rp-logout">Log out</button>` : ''}
        </div>
      </div>`;

    document.getElementById('rp-toggle').addEventListener('click', () => {
      document.getElementById('rp-panel').classList.toggle('open');
    });

    mount.querySelectorAll('.rp-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const reader = READERS.find(r => r.id === btn.dataset.readerId);
        if (!reader) return;
        localStorage.setItem(LS_KEY, reader.id);
        localStorage.setItem(LS_KEY + '.tier', reader.tier);
        localStorage.setItem(LS_KEY + '.topics', reader.topics);
        localStorage.setItem(LS_KEY + '.region', reader.region);
        sessionStorage.setItem(SS_SYNCED, '1');
        whenVisitorReady(reader.id, AUTHENTICATED, () => location.reload());
      });
    });

    const logoutBtn = document.getElementById('rp-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        localStorage.removeItem(LS_KEY);
        localStorage.removeItem(LS_KEY + '.tier');
        localStorage.removeItem(LS_KEY + '.topics');
        localStorage.removeItem(LS_KEY + '.region');
        sessionStorage.removeItem(SS_SYNCED);
        whenVisitorReady('', LOGGED_OUT, () => location.reload());
      });
    }
  }

  buildUI();
}

// ─── Experience event listener ────────────────────────────────────────────────

// Target's XT custom code dispatches this event. Since chronicle.js is a sync
// script at the bottom of <body>, if the async Launch bundle loads from cache
// before chronicle.js is fetched, at.js can deliver and dispatch this event
// before this listener exists. The inline capture script in <head> stores
// window.chronicleData._offer for that case; we read it in init below.
document.addEventListener('chronicle:experience', e => {
  const { experience, topics } = e.detail || {};
  applyExperience(experience || 'default', topics || []);
});

// ─── Init ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await loadData();
  } catch (err) {
    console.error('[chronicle] failed to load data:', err);
    const page = document.body.dataset.page;
    if (page === 'home') {
      const el = document.getElementById('homepage-layout');
      if (el) el.innerHTML = '<p class="loading">Failed to load articles. Please try refreshing.</p>';
    }
    return;
  }

  // If the chronicle:experience event fired before this script loaded (Launch cached,
  // at.js responded fast), apply it now before the first render.
  const prefired = window.chronicleData && window.chronicleData._offer;
  if (prefired && _experience === 'default') {
    _experience = prefired.experience || 'default';
    _topics = prefired.topics || [];
  }

  const page = document.body.dataset.page;
  if (page === 'home')     renderHomepage();
  if (page === 'article')  renderArticle();
  if (page === 'category') renderCategory();
  if (page === 'about')    renderAbout();

  initReaderPicker();
});

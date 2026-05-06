# Chronicle — Homepage Layout XT Activity

Single Target activity that uses all three products:

- **Adobe Target** — XT activity drives the layout change  
- **Customer Attributes** — `crs.subscription_tier` is the audience split condition; `crs.topics_followed` seeds hero + category order for premium readers  
- **Adobe Analytics (A4T)** — reporting metric is article opens + "read full" clicks per experience  

---

## Activity setup

| Field | Value |
|---|---|
| Type | Experience Targeting (XT) |
| Goal metric | Conversion — custom event `articleOpen` (Analytics) |
| Additional metrics | `readFullClick`, average `scrollDepth` |
| Reporting source | Adobe Analytics (A4T) |
| Location | `.target-zone[data-zone="layout"]` on `/` |
| Priority | High |

---

## Audiences

| Experience | Audience |
|---|---|
| Premium reader | Customer Attribute: `crs.subscription_tier` **equals** `premium` |
| Free reader | Customer Attribute: `crs.subscription_tier` **equals** `free` |
| Default | All Visitors (fallback) |

---

## Custom code per experience

In the VEC, for each experience choose **Action → Custom Code** on `.target-zone[data-zone="layout"]`.

### Experience 1 — Premium reader

```js
(function () {
  var topics = '${crs.topics_followed}';          // Velocity: resolves to e.g. "tech,science"
  var topicsArr = topics && topics !== '$' + '{crs.topics_followed}'
    ? topics.split(',').map(function(t){ return t.trim(); })
    : [];                                          // fallback if attribute not resolved

  window.chronicleData = window.chronicleData || {};
  window.chronicleData.experience = 'premium';

  document.dispatchEvent(new CustomEvent('chronicle:experience', {
    detail: { experience: 'premium', topics: topicsArr }
  }));
})();
```

### Experience 2 — Free reader

```js
(function () {
  window.chronicleData = window.chronicleData || {};
  window.chronicleData.experience = 'free';

  document.dispatchEvent(new CustomEvent('chronicle:experience', {
    detail: { experience: 'free', topics: [] }
  }));
})();
```

### Experience 3 — Default (no action needed)

No custom code required. The page renders the default layout if the event is never dispatched.

---

## What each experience looks like

| | Default | Free | Premium |
|---|---|---|---|
| Grid columns | 4 | 4 | 5 |
| Ad slot | hidden | **visible** | hidden |
| Hero article | latest | latest | first article matching `topics_followed` |
| Category order | tech, world, business, science | tech, world, business, science | `topics_followed` categories first |
| Experience badge | none | "Free tier · Adobe Target" | "Premium experience · Adobe Target" |

---

## Demo flow

1. Open the homepage — default layout renders (no badge).
2. Open the Reader Picker (`?demo=true`), select **Sarah** (premium, US, business+tech).
3. Target fires, dispatches `chronicle:experience` with `experience: 'premium'` and `topics: ['business','tech']`.
4. Layout switches to 5-col, no ad slot, hero is from business/tech, business section moves first.
5. Switch to **James** (free, UK) — layout switches to 4-col with ad slot.
6. Analytics (A4T) tracks which experience each reader engaged with.

---

## Analytics events fired by the page (picked up via Launch)

| Event | Trigger | mbox param |
|---|---|---|
| `articleOpen` | Article detail page mount | `article.id`, `article.category` |
| `readFullClick` | External "Read full on Source" link click | `article.id` |
| `scrollDepth` | 25/50/75/100% scroll on article | `article.scrollDepth` |
| `categoryClick` | Category nav link clicked | `page.category` |

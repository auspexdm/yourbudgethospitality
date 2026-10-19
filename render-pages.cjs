// Run `node render-pages.cjs` after changing listings in data.js
// (after `node render-seo.cjs`). It builds:
//   stays/<slug>.html          one crawlable page per stay
//   resorts-in-alibag.html     all resorts
//   villas-in-alibag.html      all villas
//   sitemap.xml                every page above plus the core pages
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const root = __dirname;
const ORIGIN = 'https://www.yourbudgethospitality.com';
const ctx = {};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, 'data.js'), 'utf8') + '\nthis.SITE = SITE; this.PLACES = PLACES; this.STAYS = STAYS;', ctx);
const { SITE, STAYS } = ctx;

const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const rupees = n => '₹' + Number(n).toLocaleString('en-IN');
const list = arr => (arr.length > 1 ? `${arr.slice(0, -1).join(', ')} and ${arr[arr.length - 1]}` : arr[0] || '');
const lower = s => (/^[A-Z]{2}/.test(s) ? s : s.charAt(0).toLowerCase() + s.slice(1));
// "Private pool" -> "a private pool", "AC bedrooms" -> "AC bedrooms"
const withArticle = h => {
  const t = lower(h);
  const first = t.split(' ')[0];
  if (/^[A-Z]{2}/.test(t) || /s$/.test(t) || /s$/.test(first)) return t;
  return (/^[aeiou]/.test(t) ? 'an ' : 'a ') + t;
};
const photos = s => (s.images && s.images.length ? s.images : (s.image ? [s.image] : []));
const wa = text => `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;
const bookLink = s => wa(`Hi ${SITE.name}, I'd like to book ${s.name} in ${s.place}. Please share availability and the total price.`);
const where = s => (s.area ? `${s.area}, ${s.place}` : s.place);
const stayUrl = s => `/stays/${s.slug}.html`;
const unit = s => (s.type === 'villa' ? 'per night for the whole villa' : 'per room, per night');
const guestsLabel = s => s.guestsText || (s.type === 'villa' ? `Sleeps ${s.guests}` : `${s.guests} guests per room`);
const roomsLabel = s => (!s.rooms ? '' : (s.type === 'villa' ? `${s.rooms} BHK` : `${s.rooms} rooms`));
const typeWord = s => (s.type === 'villa' ? 'private villa' : 'resort');
const caption = file => {
  const m = path.basename(file, path.extname(file)).match(/^.*?-\d+-(.+)$/);
  return m ? m[1].replace(/-/g, ' ') : 'photo';
};

const PAGES = {
  resort: { file: 'resorts-in-alibag.html', label: 'Resorts', h1: 'Resorts in Alibag' },
  villa: { file: 'villas-in-alibag.html', label: 'Villas', h1: 'Private pool villas in Alibag' }
};

/* ---------- shared chrome ---------- */
function head({ title, desc, url, image, imageAlt, ld }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  <link rel="canonical" href="${ORIGIN}${url}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${esc(SITE.name)}">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:url" content="${ORIGIN}${url}">
  ${image ? `<meta property="og:image" content="${ORIGIN}/${esc(image)}">
  <meta property="og:image:alt" content="${esc(imageAlt)}">` : ''}
  <meta name="twitter:card" content="summary_large_image">
  <script type="application/ld+json">${JSON.stringify(ld)}</script>
  <meta name="theme-color" content="#2F6CAB">
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,400..700&family=Figtree:wght@400;500;600;700&display=swap">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="stylesheet" href="/style.css">
  <script src="/data.js" defer></script>
  <script src="/main.js" defer></script>
</head>`;
}

function header(current) {
  const cur = k => (current === k ? ' aria-current="page"' : '');
  return `  <a class="skip-link" href="#main">Skip to content</a>

  <header class="site-header" id="siteHeader">
    <div class="wrap nav">
      <a class="brand" href="/">
        <img src="/ybh-mark.png" alt="" width="44" height="44">
        <span>Your Budget<br>Hospitality</span>
      </a>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="navMenu">
        <i class="fa-solid fa-bars" aria-hidden="true"></i><span class="sr-only">Menu</span>
      </button>
      <nav class="nav-menu" id="navMenu" aria-label="Main">
        <a class="nav-link" href="/properties.html">All stays</a>
        <a class="nav-link" href="/${PAGES.resort.file}"${cur('resort')}>Resorts</a>
        <a class="nav-link" href="/${PAGES.villa.file}"${cur('villa')}>Villas</a>
        <a class="nav-link" href="/#places">Places</a>
        <a class="nav-link" href="/contact.html">Contact</a>
        <a class="btn btn-primary btn-sm" href="/contact.html">Send enquiry</a>
      </nav>
    </div>
  </header>`;
}

function footer() {
  const stayLinks = STAYS.map(s => `<li><a href="${stayUrl(s)}">${esc(s.name)}</a></li>`).join('\n            ');
  return `  <footer class="site-footer on-dark">
    <div class="wrap">
      <div class="footer-grid">
        <div class="footer-brand">
          <a class="brand" href="/">
            <img src="/ybh-mark.png" alt="" width="44" height="44">
            <span>Your Budget<br>Hospitality</span>
          </a>
          <p>Affordable resorts and villas, with the nightly price shown upfront.</p>
        </div>
        <div>
          <h2 class="footer-title">Stays</h2>
          <ul>
            <li><a href="/properties.html">All stays</a></li>
            <li><a href="/${PAGES.resort.file}">Resorts</a></li>
            <li><a href="/${PAGES.villa.file}">Villas</a></li>
          </ul>
        </div>
        <div>
          <h2 class="footer-title">Properties</h2>
          <ul>
            ${stayLinks}
          </ul>
        </div>
        <div>
          <h2 class="footer-title">Contact</h2>
          <ul>
            <li><a data-site="phone" href="tel:${SITE.phone}">${esc(SITE.phoneDisplay)}</a></li>
            <li><a data-site="whatsapp" href="https://wa.me/${SITE.whatsapp}">WhatsApp</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; <span id="year">${new Date().getFullYear()}</span> ${esc(SITE.name)}</p>
        <p><a href="/contact.html">Send a booking enquiry</a></p>
      </div>
    </div>
  </footer>

  <a class="wa-float" data-site="whatsapp" href="https://wa.me/${SITE.whatsapp}" aria-label="Chat on WhatsApp"><i class="fa-brands fa-whatsapp" aria-hidden="true"></i></a>
</body>
</html>
`;
}

const crumbs = items => `<nav class="crumbs" aria-label="Breadcrumb"><ol>${items.map((c, i) =>
  i === items.length - 1 ? `<li aria-current="page">${esc(c.name)}</li>` : `<li><a href="${c.url}">${esc(c.name)}</a></li>`).join('')}</ol></nav>`;
const crumbLd = items => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: ORIGIN + c.url }))
});
const orgRef = { '@id': `${ORIGIN}/#organization` };

/* Static card that links to the stay page (main.js does not re-render these). */
function linkCard(s) {
  const p = photos(s);
  return `<article class="stay-card">
      <div class="stay-media">${p.length ? `<img src="/${esc(p[0])}" alt="${esc(s.name)}, ${esc(s.place)}" loading="lazy">` : ''}<span class="stay-tag tag-${esc(s.type)}">${s.type === 'villa' ? 'Villa' : 'Resort'}</span></div>
      <div class="stay-body">
        <p class="stay-place"><i class="fa-solid fa-location-dot" aria-hidden="true"></i>${esc(where(s))}</p>
        <h3 class="stay-name"><a class="stay-link" href="${stayUrl(s)}">${esc(s.name)}</a></h3>
        <ul class="stay-facts"><li><i class="fa-solid fa-user-group" aria-hidden="true"></i>${esc(guestsLabel(s))}</li>${roomsLabel(s) ? `<li><i class="fa-solid fa-bed" aria-hidden="true"></i>${roomsLabel(s)}</li>` : ''}</ul>
        ${(s.highlights || []).length ? `<ul class="stay-highlights">${s.highlights.slice(0, 3).map(h => `<li>${esc(h)}</li>`).join('')}</ul>` : ''}
        <div class="stay-foot">
          <p class="price"><strong>${(s.roomTypes || []).length > 1 ? 'From ' : ''}${rupees(s.price)}</strong><span>${s.type === 'villa' ? 'per night, whole villa' : 'per room, per night'}</span></p>
          <a class="btn btn-outline btn-sm" href="${stayUrl(s)}">View stay</a>
        </div>
      </div>
    </article>`;
}

/* ---------- stay pages ---------- */
function stayPage(s) {
  const pics = photos(s);
  const kind = typeWord(s);
  const hl = s.highlights || [];
  const rooms = s.roomTypes || [];
  const multi = rooms.length > 1;
  const priceText = s.type === 'villa'
    ? `${rupees(s.price)} per night for the whole villa`
    : `${multi ? 'from ' : ''}${rupees(s.price)} per room, per night`;
  const sizeText = s.type === 'villa'
    ? `${s.rooms ? `It is a ${s.rooms} BHK villa and` : 'It'} ${lower(guestsLabel(s))} guests`.replace('sleeps 8-10 guests', 'sleeps 8 to 10 guests')
    : `Rooms take up to ${s.guests} guests each${s.rooms ? `, across ${s.rooms} rooms` : ''}`;

  const title = `${s.name}, ${s.place} | ${s.type === 'villa' ? 'Private Pool Villa' : 'Resort'} from ${rupees(s.price)} | ${SITE.name}`;
  const desc = `${s.name} is a ${kind} in ${where(s)} with ${list(hl.map(withArticle))}. ${priceText.charAt(0).toUpperCase() + priceText.slice(1)}. Enquire on WhatsApp.`;
  const intro = `${s.name} is a ${kind} in ${where(s)}${hl.length ? ` with ${list(hl.map(withArticle))}` : ''}. ${sizeText}. Prices are ${priceText}.`;

  const others = STAYS.filter(o => o.slug !== s.slug).sort((a, b) => (a.type === s.type ? 0 : 1) - (b.type === s.type ? 0 : 1)).slice(0, 3);
  const trail = [{ name: 'Home', url: '/' }, { name: PAGES[s.type].label, url: `/${PAGES[s.type].file}` }, { name: s.name, url: stayUrl(s) }];

  const faqs = [
    [`How much does ${s.name} cost per night?`, rooms.length
      ? `${rooms.map(r => `${r.name}: ${rupees(r.price)}`).join('; ')} (${unit(s)}). Prices can change on weekends and holidays, so we confirm the final price with your dates.`
      : `${s.name} is listed at ${rupees(s.price)} ${unit(s)}. Prices can change on weekends and holidays, so we confirm the final price with your dates.`],
    [`How many guests can stay at ${s.name}?`, s.type === 'villa'
      ? `${s.name} ${lower(guestsLabel(s)).replace('8-10', '8 to 10')} guests. For bigger groups, ask us about booking a second villa nearby.`
      : `Each room takes up to ${s.guests} guests. Bigger groups can book several rooms together.`],
    [`How do I book ${s.name}?`, `Send us your check-in and check-out dates and number of guests on WhatsApp or call ${SITE.phoneDisplay}. We check availability with the property and reply with the total price and payment details.`]
  ];

  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': s.type === 'villa' ? 'LodgingBusiness' : 'Resort',
        '@id': `${ORIGIN}${stayUrl(s)}#lodging`,
        name: s.name,
        url: ORIGIN + stayUrl(s),
        description: intro,
        image: pics.slice(0, 6).map(p => `${ORIGIN}/${p}`),
        address: { '@type': 'PostalAddress', addressLocality: s.area || s.place, addressRegion: 'Maharashtra', addressCountry: 'IN' },
        priceRange: `${rupees(s.price)}+`,
        amenityFeature: hl.map(h => ({ '@type': 'LocationFeatureSpecification', name: h, value: true })),
        telephone: SITE.phone,
        ...(s.rooms && s.type === 'resort' ? { numberOfRooms: s.rooms } : {})
      },
      {
        '@type': 'WebPage',
        '@id': `${ORIGIN}${stayUrl(s)}#webpage`,
        url: ORIGIN + stayUrl(s),
        name: title,
        description: desc,
        isPartOf: { '@id': `${ORIGIN}/#website` },
        about: { '@id': `${ORIGIN}${stayUrl(s)}#lodging` },
        publisher: orgRef,
        inLanguage: 'en-IN'
      },
      crumbLd(trail),
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } }))
      }
    ]
  };

  const gallery = pics.length ? `<div class="stay-gallery">${pics.slice(0, 5).map((p, i) =>
    `<figure class="g-item${i === 0 ? ' g-main' : ''}"><img src="/${esc(p)}" alt="${esc(s.name)} ${esc(caption(p))}" ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'}></figure>`).join('')}
          <button class="btn btn-light g-all" type="button" data-gallery="${esc(s.slug)}"><i class="fa-solid fa-images" aria-hidden="true"></i>See all ${pics.length} photos</button>
        </div>` : '';

  return `${head({ title, desc, url: stayUrl(s), image: pics[0], imageAlt: `${s.name} in ${s.place}`, ld })}
<body data-page="stay">
${header(s.type)}

  <main id="main">
    <section class="page-head stay-head">
      <div class="wrap">
        ${crumbs(trail)}
        <p class="stay-place"><i class="fa-solid fa-location-dot" aria-hidden="true"></i>${esc(where(s))}, Maharashtra · ${s.type === 'villa' ? 'Private villa' : 'Resort'}</p>
        <h1>${esc(s.name)}, ${esc(s.place)}</h1>
        <p>${esc(intro)}</p>
      </div>
    </section>

    <section class="section section-results">
      <div class="wrap">
        ${gallery}
        <div class="stay-detail">
          <div class="stay-copy">
            <h2>About ${esc(s.name)}</h2>
            <ul class="stay-facts detail-facts">
              <li><i class="fa-solid fa-user-group" aria-hidden="true"></i>${esc(guestsLabel(s))}</li>
              ${roomsLabel(s) ? `<li><i class="fa-solid fa-bed" aria-hidden="true"></i>${roomsLabel(s)}</li>` : ''}
              <li><i class="fa-solid fa-location-dot" aria-hidden="true"></i>${esc(where(s))}</li>
            </ul>
            ${hl.length ? `<h3>Highlights</h3>
            <ul class="stay-highlights">${hl.map(h => `<li>${esc(h)}</li>`).join('')}</ul>` : ''}
            ${rooms.length ? `<h3>${multi ? 'Room types and prices' : 'Room and price'}</h3>
            <ul class="room-list">${rooms.map(r => `<li><span>${esc(r.name)}</span><strong>${rupees(r.price)}</strong></li>`).join('')}</ul>
            <p class="muted">Prices are per room, per night. We confirm the final price for your dates.</p>` : ''}

            <h2>${esc(s.name)} questions</h2>
            ${faqs.map(([q, a]) => `<h3>${esc(q)}</h3>\n            <p>${esc(a)}</p>`).join('\n            ')}
          </div>
          <aside class="panel book-panel">
            <p class="price"><strong>${multi ? 'From ' : ''}${rupees(s.price)}</strong><span>${s.type === 'villa' ? 'per night, whole villa' : 'per room, per night'}</span></p>
            <p>Send your dates and group size. We check availability and reply with the total price.</p>
            <a class="btn btn-whatsapp" href="${bookLink(s)}" target="_blank" rel="noopener"><i class="fa-brands fa-whatsapp" aria-hidden="true"></i>Book on WhatsApp</a>
            <a class="btn btn-outline" href="/contact.html?property=${encodeURIComponent(s.slug)}">Send an enquiry</a>
            <a class="link-quiet" href="tel:${SITE.phone}">Or call ${esc(SITE.phoneDisplay)}</a>
          </aside>
        </div>
      </div>
    </section>

    <section class="section section-mist">
      <div class="wrap">
        <div class="section-head"><h2>More stays in Alibag</h2><a class="link-quiet" href="/properties.html">See all stays</a></div>
        <div class="stay-grid">${others.map(linkCard).join('')}</div>
      </div>
    </section>
  </main>

${footer()}`;
}

/* ---------- type pages ---------- */
function typePage(type) {
  const cfg = PAGES[type];
  const stays = STAYS.filter(s => s.type === type).sort((a, b) => a.price - b.price);
  const from = stays.length ? Math.min(...stays.map(s => s.price)) : 0;
  const names = list(stays.map(s => s.name));
  const url = `/${cfg.file}`;
  const title = type === 'villa'
    ? `Private Pool Villas in Alibag from ${rupees(from)} | ${SITE.name}`
    : `Resorts in Alibag from ${rupees(from)} per Night | ${SITE.name}`;
  const desc = type === 'villa'
    ? `Book a whole private pool villa in Alibag for your group. Compare ${names}, from ${rupees(from)} per night. Enquire on WhatsApp.`
    : `Compare resorts in Alibag with pools and family rooms: ${names}. Rooms from ${rupees(from)} per night. Enquire on WhatsApp.`;
  const intro = type === 'villa'
    ? `Rent the whole villa for your family or friends. All ${stays.length} villas listed here have a private pool and sleep groups of up to 10, from ${rupees(from)} per night for the villa.`
    : `Book a room at a resort with a pool, restaurant and housekeeping. Good for couples and small families. ${stays.length} resorts listed, with rooms from ${rupees(from)} per night.`;
  const trail = [{ name: 'Home', url: '/' }, { name: cfg.label, url }];
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'CollectionPage', '@id': `${ORIGIN}${url}#webpage`, url: ORIGIN + url, name: title, description: desc, isPartOf: { '@id': `${ORIGIN}/#website` }, publisher: orgRef, inLanguage: 'en-IN' },
      { '@type': 'ItemList', name: cfg.h1, itemListElement: stays.map((s, i) => ({ '@type': 'ListItem', position: i + 1, name: s.name, url: ORIGIN + stayUrl(s) })) },
      crumbLd(trail)
    ]
  };
  const other = PAGES[type === 'villa' ? 'resort' : 'villa'];
  return `${head({ title, desc, url, image: photos(stays[0] || {})[0], imageAlt: `${stays[0] ? stays[0].name : cfg.h1} in Alibag`, ld })}
<body data-page="type">
${header(type)}

  <main id="main">
    <section class="page-head">
      <div class="wrap">
        ${crumbs(trail)}
        <h1>${esc(cfg.h1)}</h1>
        <p>${esc(intro)}</p>
      </div>
    </section>

    <section class="section section-results">
      <div class="wrap">
        <div class="stay-grid">${stays.map(linkCard).join('')}</div>
        <p class="results-note">Looking for ${type === 'villa' ? 'a single room instead' : 'the whole house for a group'}? See <a href="/${other.file}">${esc(other.h1.toLowerCase())}</a> or <a href="/properties.html">compare every stay</a>.</p>
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        <div class="cta on-dark">
          <img src="/ybh-mark.png" alt="" width="96" height="96">
          <div>
            <h2>Not sure which one?</h2>
            <p>Tell us your dates, group size and budget, and we'll suggest ${type === 'villa' ? 'villas' : 'resorts'} that fit.</p>
          </div>
          <div class="cta-actions">
            <a class="btn btn-whatsapp" data-site="whatsapp" href="https://wa.me/${SITE.whatsapp}"><i class="fa-brands fa-whatsapp" aria-hidden="true"></i>Chat on WhatsApp</a>
            <a class="btn btn-light-outline" href="/contact.html">Send enquiry</a>
          </div>
        </div>
      </div>
    </section>
  </main>

${footer()}`;
}

/* ---------- write ---------- */
fs.mkdirSync(path.join(root, 'stays'), { recursive: true });
for (const f of fs.readdirSync(path.join(root, 'stays'))) {
  if (f.endsWith('.html') && !STAYS.some(s => `${s.slug}.html` === f)) fs.unlinkSync(path.join(root, 'stays', f));
}
STAYS.forEach(s => fs.writeFileSync(path.join(root, 'stays', `${s.slug}.html`), stayPage(s)));
Object.keys(PAGES).forEach(t => fs.writeFileSync(path.join(root, PAGES[t].file), typePage(t)));

const today = new Date().toISOString().slice(0, 10);
const urls = ['/', '/properties.html', `/${PAGES.resort.file}`, `/${PAGES.villa.file}`, ...STAYS.map(stayUrl), '/contact.html'];
fs.writeFileSync(path.join(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${ORIGIN}${u}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`);
console.log(`Wrote ${STAYS.length} stay pages, ${Object.keys(PAGES).length} type pages and sitemap.xml (${urls.length} URLs).`);

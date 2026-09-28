/* Your Budget Hospitality — shared site logic.
   You shouldn't need to edit this file; listings live in data.js. */
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const rupees = n => '₹' + Number(n).toLocaleString('en-IN');
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  const params = new URLSearchParams(location.search);

  const TYPES = {
    resort: { label: 'Resort', plural: 'Resorts', sub: 'Rooms with a pool, restaurant and housekeeping. Good for couples and small families.' },
    villa: { label: 'Villa', plural: 'Villas', sub: 'The whole house to yourselves. Good for friends and big families.' }
  };

  const capacity = s => (s.type === 'resort' ? s.guests * (s.rooms || 1) : s.guests);
  const priceUnit = s => (s.type === 'villa' ? 'per night, whole villa' : 'per room, per night');
  const roomsLabel = s => (!s.rooms ? '' : (s.type === 'villa' ? `${s.rooms} BHK` : plural(s.rooms, 'room', 'rooms')));
  const guestsLabel = s => s.guestsText || (s.type === 'villa' ? `Sleeps ${s.guests}` : `${s.guests} guests per room`);
  const priceLabel = s => ((s.roomTypes && s.roomTypes.length > 1) ? `From ${rupees(s.price)}` : rupees(s.price));
  const bookLink = s => waLink(`Hi ${SITE.name}, I'd like to book ${s.name} in ${s.place}. Please share availability and the total price.`);
  const roomList = s => (!s.roomTypes || !s.roomTypes.length ? '' :
    `<ul class="room-list">${s.roomTypes.map(r =>
      `<li><span>${esc(r.name)}</span><strong>${rupees(r.price)}</strong></li>`).join('')}</ul>`);
  const minPrice = list => (list.length ? Math.min(...list.map(s => s.price)) : 0);
  const waLink = text => `https://wa.me/${SITE.whatsapp}${text ? '?text=' + encodeURIComponent(text) : ''}`;

  /* Places that have at least one stay, in PLACES order
     (plus any place typed in STAYS that isn't in PLACES yet). */
  function placeSummaries() {
    const seen = new Set();
    return [...PLACES.map(p => p.name), ...STAYS.map(s => s.place)]
      .filter(n => n && !seen.has(n) && seen.add(n))
      .map(name => {
        const stays = STAYS.filter(s => s.place === name);
        const info = PLACES.find(p => p.name === name) || {};
        return { name, blurb: info.blurb || '', count: stays.length, from: minPrice(stays) };
      })
      .filter(p => p.count > 0);
  }

  /* Illustration shown until a real photo is added (or if a photo fails to load). */
  function art(type) {
    if (type === 'villa') {
      return `<svg class="stay-art" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="400" height="300" fill="#E4F2E1"/>
        <circle cx="318" cy="72" r="30" fill="#fff"/>
        <path d="M0 214C70 176 140 190 210 206S340 180 400 196V300H0Z" fill="#5ECB4A" opacity=".35"/>
        <path d="M0 246C90 226 180 240 260 232S360 222 400 230V300H0Z" fill="#449779" opacity=".45"/>
        <path d="M118 152L190 104L262 152Z" fill="#449779"/>
        <rect x="132" y="150" width="116" height="78" fill="#fff"/>
        <rect x="178" y="184" width="24" height="44" fill="#2F6CAB" opacity=".75"/>
        <rect x="146" y="166" width="22" height="18" fill="#2F6CAB" opacity=".3"/>
        <rect x="212" y="166" width="22" height="18" fill="#2F6CAB" opacity=".3"/>
        <path d="M302 236C304 198 302 170 292 138" stroke="#0F2B3A" stroke-width="5" fill="none" stroke-linecap="round" opacity=".5"/>
        <path d="M292 138C274 128 258 132 246 144M292 138C308 124 326 126 338 136M292 138C286 118 290 104 300 96M292 138C272 142 262 156 260 170M292 138C312 142 322 154 326 168" stroke="#2F8F3E" stroke-width="7" fill="none" stroke-linecap="round"/>
      </svg>`;
    }
    let windows = '';
    for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) {
      windows += `<rect x="${164 + c * 30}" y="${112 + r * 28}" width="18" height="14" fill="#2F6CAB" opacity=".28"/>`;
    }
    return `<svg class="stay-art" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="400" height="300" fill="#E3EDF6"/>
      <circle cx="84" cy="70" r="28" fill="#fff"/>
      <rect x="150" y="96" width="170" height="114" fill="#fff"/>
      <rect x="144" y="86" width="182" height="12" fill="#2F6CAB" opacity=".85"/>
      ${windows}
      <path d="M0 210H400V300H0Z" fill="#2F6CAB" opacity=".22"/>
      <path d="M0 238C30 230 50 246 80 238S130 230 160 238 210 246 240 238 290 230 320 238 370 246 400 238" stroke="#fff" stroke-width="4" fill="none" opacity=".85"/>
      <path d="M0 268C30 260 50 276 80 268S130 260 160 268 210 276 240 268 290 260 320 268 370 276 400 268" stroke="#fff" stroke-width="4" fill="none" opacity=".6"/>
      <path d="M72 212C74 180 72 158 64 132" stroke="#0F2B3A" stroke-width="5" fill="none" stroke-linecap="round" opacity=".5"/>
      <path d="M64 132C46 122 30 126 18 138M64 132C80 118 98 120 110 130M64 132C58 112 62 98 72 90M64 132C84 136 94 148 98 162" stroke="#449779" stroke-width="7" fill="none" stroke-linecap="round"/>
    </svg>`;
  }

  const photos = s => (s.images && s.images.length ? s.images : (s.image ? [s.image] : []));

  function media(s, interactive = true) {
    const list = photos(s);
    const img = list.length
      ? `<img src="${esc(list[0])}" alt="${esc(s.name)}, ${esc(s.place)}" loading="lazy" onerror="this.remove()">`
      : '';
    const opener = (interactive && list.length)
      ? `<button class="media-btn" type="button" data-gallery="${esc(s.slug)}" aria-label="View photos of ${esc(s.name)}"></button>
         <span class="photo-count"><i class="fa-solid fa-camera" aria-hidden="true"></i>${plural(list.length, 'photo', 'photos')}</span>`
      : '';
    return art(s.type) + img + opener;
  }

  /* Photo gallery */
  const gallery = { el: null, list: [], index: 0, name: '', opener: null };

  function paintGallery() {
    const img = gallery.el.querySelector('img');
    img.src = gallery.list[gallery.index];
    img.alt = `${gallery.name}, photo ${gallery.index + 1}`;
    gallery.el.querySelector('.lb-caption').textContent = `${gallery.name} — ${gallery.index + 1} of ${gallery.list.length}`;
    const single = gallery.list.length < 2;
    gallery.el.querySelectorAll('.lb-nav').forEach(b => { b.hidden = single; });
  }

  function stepGallery(dir) {
    gallery.index = (gallery.index + dir + gallery.list.length) % gallery.list.length;
    paintGallery();
  }

  function closeGallery() {
    if (!gallery.el) return;
    gallery.el.hidden = true;
    document.body.style.overflow = '';
    if (gallery.opener) gallery.opener.focus();
  }

  function openGallery(slug, opener) {
    const s = STAYS.find(x => x.slug === slug);
    if (!s) return;
    const list = photos(s);
    if (!list.length) return;

    if (!gallery.el) {
      const el = document.createElement('div');
      el.className = 'lightbox';
      el.setAttribute('role', 'dialog');
      el.setAttribute('aria-modal', 'true');
      el.setAttribute('aria-label', 'Photo gallery');
      el.hidden = true;
      el.innerHTML = `
        <button class="lb-close" type="button" aria-label="Close gallery"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
        <button class="lb-nav lb-prev" type="button" aria-label="Previous photo"><i class="fa-solid fa-chevron-left" aria-hidden="true"></i></button>
        <figure class="lb-stage"><img src="" alt=""><figcaption class="lb-caption"></figcaption></figure>
        <button class="lb-nav lb-next" type="button" aria-label="Next photo"><i class="fa-solid fa-chevron-right" aria-hidden="true"></i></button>`;
      document.body.appendChild(el);
      gallery.el = el;
      el.addEventListener('click', e => {
        if (e.target === el || e.target.closest('.lb-close')) closeGallery();
        else if (e.target.closest('.lb-prev')) stepGallery(-1);
        else if (e.target.closest('.lb-next')) stepGallery(1);
      });
      document.addEventListener('keydown', e => {
        if (!gallery.el || gallery.el.hidden) return;
        if (e.key === 'Escape') closeGallery();
        if (e.key === 'ArrowLeft') stepGallery(-1);
        if (e.key === 'ArrowRight') stepGallery(1);
      });
    }

    gallery.list = list;
    gallery.index = 0;
    gallery.name = s.name;
    gallery.opener = opener || null;
    gallery.el.hidden = false;
    document.body.style.overflow = 'hidden';
    paintGallery();
    gallery.el.querySelector('.lb-close').focus();
  }

  function stayCard(s) {
    const t = TYPES[s.type] || TYPES.resort;
    const where = s.area ? `${s.area}, ${s.place}` : s.place;
    const hl = (s.highlights || []).slice(0, 3).map(h => `<li>${esc(h)}</li>`).join('');
    const rooms = roomsLabel(s);
    return `<article class="stay-card">
      <div class="stay-media">${media(s)}<span class="stay-tag tag-${esc(s.type)}">${t.label}</span></div>
      <div class="stay-body">
        <p class="stay-place"><i class="fa-solid fa-location-dot" aria-hidden="true"></i>${esc(where)}</p>
        <h3 class="stay-name">${esc(s.name)}</h3>
        <ul class="stay-facts">
          <li><i class="fa-solid fa-user-group" aria-hidden="true"></i>${guestsLabel(s)}</li>
          ${rooms ? `<li><i class="fa-solid fa-bed" aria-hidden="true"></i>${rooms}</li>` : ''}
        </ul>
        ${roomList(s)}
        ${hl ? `<ul class="stay-highlights">${hl}</ul>` : ''}
        <div class="stay-foot">
          <p class="price"><strong>${priceLabel(s)}</strong><span>${priceUnit(s)}</span></p>
          <a class="btn btn-whatsapp btn-sm" href="${bookLink(s)}" target="_blank" rel="noopener" aria-label="Book ${esc(s.name)} on WhatsApp"><i class="fa-brands fa-whatsapp" aria-hidden="true"></i>Book</a>
        </div>
      </div>
    </article>`;
  }

  function fillPlaceSelect(sel, anyLabel) {
    sel.innerHTML = `<option value="">${anyLabel}</option>` +
      placeSummaries().map(p => `<option value="${esc(p.name)}">${esc(p.name)}</option>`).join('');
  }

  /* ---------- Every page ---------- */
  function initChrome() {
    document.addEventListener('click', e => {
      const btn = e.target.closest('[data-gallery]');
      if (btn) openGallery(btn.dataset.gallery, btn);
    });

    const header = $('#siteHeader');
    const onScroll = () => header && header.classList.toggle('scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const toggle = $('.nav-toggle');
    const menu = $('#navMenu');
    if (toggle && menu) {
      toggle.addEventListener('click', () => {
        const open = menu.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(open));
        toggle.querySelector('i').className = open ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
      });
    }

    $$('[data-site="phone"]').forEach(a => { a.textContent = SITE.phoneDisplay; a.href = 'tel:' + SITE.phone; });
    $$('[data-site="email"]').forEach(a => { a.textContent = SITE.email; a.href = 'mailto:' + SITE.email; });
    $$('[data-site="address"]').forEach(el => { el.textContent = SITE.address; });
    $$('[data-site="whatsapp"]').forEach(a => {
      a.href = waLink(`Hi ${SITE.name}, I'd like to know more about your stays.`);
      a.target = '_blank';
      a.rel = 'noopener';
    });

    const fp = $('#footerPlaces');
    if (fp) {
      fp.innerHTML = placeSummaries()
        .map(p => `<li><a href="properties.html?place=${encodeURIComponent(p.name)}">${esc(p.name)}</a></li>`).join('');
    }
    const y = $('#year');
    if (y) y.textContent = new Date().getFullYear();
  }

  /* ---------- Home ---------- */
  function initHome() {
    const places = placeSummaries();
    const names = places.map(p => p.name);
    const joined = names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}` : names[0] || '';

    const sum = $('#heroSummary');
    if (sum && STAYS.length) {
      sum.textContent = `Resorts and villas in ${joined}, with the nightly price on every listing. Stays start at ${rupees(minPrice(STAYS))}.`;
    }

    const sPlace = $('#sPlace');
    if (sPlace) fillPlaceSelect(sPlace, 'Anywhere');
    const search = $('#heroSearch');
    if (search) {
      search.addEventListener('submit', e => {
        e.preventDefault();
        const q = new URLSearchParams();
        new FormData(search).forEach((v, k) => { if (v) q.set(k, v); });
        location.href = 'properties.html' + (q.toString() ? `?${q}` : '');
      });
    }

    const list = $('#placeList');
    if (list) {
      list.innerHTML = places.map(p => `<li>
        <a class="place-row" href="properties.html?place=${encodeURIComponent(p.name)}">
          <span class="place-name">${esc(p.name)}${p.blurb ? `<span class="place-blurb">${esc(p.blurb)}</span>` : ''}</span>
          <span class="place-meta"><strong>${p.count}</strong>${p.count === 1 ? 'stay' : 'stays'}</span>
          <span class="place-meta"><strong>${rupees(p.from)}</strong>lowest nightly price</span>
        </a>
      </li>`).join('');
    }

    Object.keys(TYPES).forEach(type => {
      const st = STAYS.filter(s => s.type === type);
      $$(`[data-type-count="${type}"]`).forEach(el => { el.textContent = st.length; });
      $$(`[data-type-from="${type}"]`).forEach(el => { el.textContent = st.length ? rupees(minPrice(st)) : 'Coming soon'; });
    });

    const grid = $('#featuredGrid');
    if (grid) {
      let featured = STAYS.filter(s => s.featured).slice(0, 6);
      if (!featured.length) featured = STAYS.slice(0, 3);
      grid.innerHTML = featured.map(stayCard).join('');
    }
  }

  /* ---------- Stays listing ---------- */
  function initStays() {
    const fPlace = $('#fPlace');
    const fGuests = $('#fGuests');
    const fBudget = $('#fBudget');
    const fSort = $('#fSort');
    const segBtns = $$('[data-filter-type]');
    const defaults = { type: '', place: '', guests: '', budget: '', sort: 'price-asc' };
    const state = { ...defaults };
    Object.keys(state).forEach(k => { if (params.get(k)) state[k] = params.get(k); });
    if (!TYPES[state.type]) state.type = '';

    fillPlaceSelect(fPlace, 'All places');
    const sync = () => {
      [[fPlace, 'place'], [fGuests, 'guests'], [fBudget, 'budget'], [fSort, 'sort']].forEach(([el, k]) => {
        el.value = state[k];
        if (el.value !== state[k]) { state[k] = defaults[k]; el.value = state[k]; }
      });
    };

    const render = () => {
      const list = STAYS.filter(s =>
        (!state.type || s.type === state.type) &&
        (!state.place || s.place === state.place) &&
        (!state.guests || capacity(s) >= Number(state.guests)) &&
        (!state.budget || s.price <= Number(state.budget))
      ).sort((a, b) => (state.sort === 'price-desc' ? b.price - a.price : a.price - b.price));

      segBtns.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.filterType === state.type)));

      const typeWord = state.type ? TYPES[state.type].plural : 'Stays';
      const title = state.place ? `${typeWord} in ${state.place}` : (state.type ? typeWord : 'All stays');
      $('#pageTitle').textContent = title;
      const place = PLACES.find(p => p.name === state.place);
      $('#pageSub').textContent = (place && place.blurb) ? `${place.blurb}.` :
        (state.type ? TYPES[state.type].sub : 'Filter by place, stay type, group size and budget. Every listing shows its nightly price.');
      document.title = `${title} | ${SITE.name}`;

      $('#resultCount').textContent = list.length ? `Showing ${plural(list.length, 'stay', 'stays')}` : '';
      $('#stayGrid').innerHTML = list.map(stayCard).join('');
      $('#emptyState').hidden = list.length > 0;

      const q = new URLSearchParams();
      Object.entries(state).forEach(([k, v]) => { if (v && v !== defaults[k]) q.set(k, v); });
      history.replaceState(null, '', q.toString() ? `?${q}` : location.pathname);
    };

    segBtns.forEach(b => b.addEventListener('click', () => { state.type = b.dataset.filterType; render(); }));
    [[fPlace, 'place'], [fGuests, 'guests'], [fBudget, 'budget'], [fSort, 'sort']].forEach(([el, k]) => {
      el.addEventListener('change', () => { state[k] = el.value; render(); });
    });
    $('#clearFilters').addEventListener('click', () => { Object.assign(state, defaults); sync(); render(); });

    sync();
    render();
  }

  /* ---------- Enquiry form ---------- */
  function initContact() {
    const form = $('#enquiryForm');
    if (!form) return;

    const sel = $('#fProperty');
    sel.innerHTML = '<option value="">Not decided yet, suggest a stay</option>' + placeSummaries().map(p =>
      `<optgroup label="${esc(p.name)}">${STAYS.filter(s => s.place === p.name).map(s =>
        `<option value="${esc(s.slug)}">${esc(s.name)} (${TYPES[s.type].label}, from ${rupees(s.price)})</option>`).join('')}</optgroup>`
    ).join('');
    const pre = params.get('property');
    if (pre && STAYS.some(s => s.slug === pre)) sel.value = pre;

    const preview = $('#stayPreview');
    const showPreview = () => {
      const s = STAYS.find(x => x.slug === sel.value);
      if (!s) { preview.hidden = true; preview.innerHTML = ''; return; }
      preview.hidden = false;
      preview.innerHTML = `<div class="preview-media">${media(s, false)}</div>
        <div>
          <p class="stay-place"><i class="fa-solid fa-location-dot" aria-hidden="true"></i>${esc(s.area ? `${s.area}, ${s.place}` : s.place)}</p>
          <h2 class="preview-name">${esc(s.name)}</h2>
          <p class="price"><strong>${priceLabel(s)}</strong><span>${priceUnit(s)}</span></p>
        </div>`;
    };
    sel.addEventListener('change', showPreview);
    showPreview();

    const ci = $('#fCheckin');
    const co = $('#fCheckout');
    const iso = d => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    const today = new Date();
    ci.min = iso(today);
    const syncOut = () => {
      const base = ci.value ? new Date(`${ci.value}T00:00`) : new Date(today);
      base.setDate(base.getDate() + 1);
      co.min = iso(base);
      if (co.value && co.value < co.min) co.value = co.min;
    };
    ci.addEventListener('change', syncOut);
    syncOut();

    const status = $('#formStatus');
    const setStatus = (kind, msg) => { status.className = `form-status ${kind}`; status.textContent = msg; };

    const collect = () => {
      const d = Object.fromEntries(new FormData(form));
      const s = STAYS.find(x => x.slug === d.property);
      d.stay = s ? `${s.name}, ${s.place}` : 'Not decided yet';
      return d;
    };
    const summary = d => [
      `Booking enquiry for ${SITE.name}`,
      `Stay: ${d.stay}`,
      `Check-in: ${d.checkin}`,
      `Check-out: ${d.checkout}`,
      `Guests: ${d.guests}`,
      `Name: ${d.name}`,
      `Phone: ${d.phone}`,
      d.email && `Email: ${d.email}`,
      d.message && `Note: ${d.message}`
    ].filter(Boolean).join('\n');

    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      if (!SITE.web3formsKey || SITE.web3formsKey.startsWith('YOUR_')) {
        setStatus('err', 'Email enquiries are not set up yet. Add the Web3Forms access key in data.js, or use Send on WhatsApp.');
        return;
      }
      const d = collect();
      const btn = $('#submitBtn');
      btn.disabled = true;
      btn.textContent = 'Sending…';
      try {
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            access_key: SITE.web3formsKey,
            subject: `New booking enquiry: ${d.stay}`,
            from_name: SITE.name,
            name: d.name,
            phone: d.phone,
            email: d.email || undefined,
            stay: d.stay,
            check_in: d.checkin,
            check_out: d.checkout,
            guests: d.guests,
            message: d.message,
            botcheck: d.botcheck
          })
        });
        const out = await res.json();
        if (!res.ok || !out.success) throw new Error(out.message || 'Request failed');
        form.reset();
        showPreview();
        syncOut();
        setStatus('ok', `Enquiry sent. We'll contact you on ${d.phone} to confirm availability and the final price.`);
      } catch (err) {
        setStatus('err', "The enquiry didn't send. Check your internet connection and try again, or use Send on WhatsApp.");
      } finally {
        btn.disabled = false;
        btn.textContent = 'Send enquiry';
      }
    });

    $('#waBtn').addEventListener('click', () => {
      if (!form.reportValidity()) return;
      window.open(waLink(summary(collect())), '_blank', 'noopener');
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initChrome();
    const page = document.body.dataset.page;
    if (page === 'home') initHome();
    if (page === 'stays') initStays();
    if (page === 'contact') initContact();
  });
})();

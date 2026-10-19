(function () {
  const SITE_BASE = 'https://nszgoaride.com';

  function normalizePath(pathname) {
    if (!pathname) return '/';
    const withoutHtml = pathname.replace(/\/index\.html$/i, '/').replace(/\.html$/i, '');
    const cleaned = withoutHtml.replace(/\/+$/, '') || '/';
    return cleaned === '' ? '/' : cleaned;
  }

  function renderHighlights(highlights, heading) {
    if (!Array.isArray(highlights) || !highlights.length) return '';
    return `
      <section class="section features-section">
        <div class="container">
          <div class="section-masthead"><div class="masthead-label">At a glance</div><h2 class="masthead-title">${escapeHtml(heading || 'Highlights')}</h2></div>
          <ul class="seo-highlights">${highlights.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
        </div>
      </section>
    `;
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderPickupOptions(page) {
    const locations = page.pickupInformation && page.pickupInformation.locations;
    if (!Array.isArray(locations) || !locations.length) {
      return '<option value="Dabolim Airport">Dabolim Airport</option><option value="Madgaon Railway Station">Madgaon Railway Station</option><option value="North Goa">North Goa</option><option value="South Goa">South Goa</option><option value="Hotel/Resort Pickup">Hotel / Resort Pickup</option>';
    }
    return locations.map((location) => `<option value="${escapeHtml(location)}">${escapeHtml(location)}</option>`).join('');
  }

  function safeUrl(value, options) {
    if (typeof value !== 'string' || !value.trim()) return null;

    const candidate = value.trim();
    if (candidate.startsWith('#')) return candidate;
    if (candidate.startsWith('//')) return null;

    try {
      const url = new URL(candidate, SITE_BASE);
      if (url.protocol !== 'https:') return null;
      if (options && options.sameOrigin && url.origin !== SITE_BASE) return null;
      if (url.origin === SITE_BASE) {
        if (url.pathname !== '/' && !/\.[^/]+$/.test(url.pathname)) {
          url.pathname = `${url.pathname.replace(/\/+$/, '')}/`;
        }
        return `${url.pathname}${url.search}${url.hash}`;
      }
      return url.href;
    } catch (error) {
      return null;
    }
  }

  function getPageVehicles(page) {
    if (Array.isArray(page.vehicles)) return page.vehicles;

    const vehicles = [
      { name: 'Maruti Ignis', category: 'budget', image: '/image/ignis.jpeg', transmissions: [{ type: 'Manual', dailyPrice: 1200 }] },
      { name: 'Maruti Swift', category: 'budget', image: '/image/swift.png', transmissions: [{ type: 'Manual', dailyPrice: 1200 }] },
      { name: 'Maruti Brezza', category: 'family', image: 'https://image2url.com/r2/default/images/1771080613820-4e08e3eb-6cf3-456d-af67-d620cf20afa2.jpeg', transmissions: [{ type: 'Manual', dailyPrice: 2000 }, { type: 'Automatic', dailyPrice: 2500 }] },
      { name: 'Hyundai Creta', category: 'family', image: 'https://image2url.com/r2/default/images/1771082168034-3cea15fd-961e-441b-827a-e772f7a0db43.png', transmissions: [{ type: 'Manual', dailyPrice: 2500 }, { type: 'Automatic', dailyPrice: 3200 }] },
      { name: 'Toyota Innova Crysta', category: 'family', image: 'https://image2url.com/r2/default/images/1771082409934-b12afb7d-7dfd-42d5-a583-c6b96ae3b097.jpeg', seatingCapacity: '7–8 seats', transmissions: [{ type: 'Manual', dailyPrice: 3000 }, { type: 'Automatic', dailyPrice: 3500 }] },
      { name: 'Toyota Innova Hycross', category: 'family', image: 'https://image2url.com/r2/default/images/1771086867555-f1b998ba-9d26-4c0e-b1c8-d55ddb7e33b8.jpeg', seatingCapacity: '7–8 seats', features: ['Hybrid'], transmissions: [{ type: 'Automatic', dailyPrice: 3500 }] },
      { name: 'Toyota Fortuner', category: 'luxury', image: 'https://image2url.com/r2/default/images/1771085163103-0cfc8bf6-b170-4f60-9be3-068e68b08592.jpeg', transmissions: [{ type: 'Automatic', dailyPrice: 6000 }] }
    ];

    if (page.slug === '/automatic-car-rental-goa') {
      return vehicles.map((vehicle) => ({
        ...vehicle,
        transmissions: vehicle.transmissions.filter((transmission) => transmission.type === 'Automatic')
      })).filter((vehicle) => vehicle.transmissions.length);
    }
    if (page.slug === '/cheap-car-rental-goa') {
      return vehicles.filter((vehicle) => vehicle.category === 'budget');
    }
    if (page.slug === '/luxury-car-rental-goa') {
      return vehicles.filter((vehicle) => vehicle.category === 'luxury');
    }
    return vehicles;
  }

  function renderBreadcrumbs(breadcrumbs) {
    if (!Array.isArray(breadcrumbs) || !breadcrumbs.length) return '';
    const items = breadcrumbs.map((item, index) => {
      const isCurrent = index === breadcrumbs.length - 1;
      const label = escapeHtml(item.name);
      const href = item.url && safeUrl(item.url, { sameOrigin: true });
      const content = !isCurrent && href ? `<a href="${escapeHtml(href)}">${label}</a>` : `<span${isCurrent ? ' aria-current="page"' : ''}>${label}</span>`;
      return `<li>${content}</li>`;
    }).join('');

    return `<nav class="seo-breadcrumbs" aria-label="Breadcrumb"><ol>${items}</ol></nav>`;
  }

  function getCurrentPage() {
    const pathname = normalizePath(window.location.pathname);
    const direct = window.seoPages && (window.seoPages[pathname] || window.seoPages[pathname + '/']);
    if (direct) return direct;
    const matchKey = Object.keys(window.seoPages || {}).find((key) => key.toLowerCase() === pathname.toLowerCase());
    return matchKey ? window.seoPages[matchKey] : null;
  }

  function renderFaqs(faqs) {
    if (!Array.isArray(faqs) || !faqs.length) return '';
    return `<div class="faq-grid">${faqs.map((item) => `<div class="faq-item"><h3 class="faq-q">${escapeHtml(item.question)}</h3><p class="faq-a">${escapeHtml(item.answer)}</p></div>`).join('')}</div>`;
  }

  function renderSections(sections) {
    if (!sections || !sections.length) return '';
    return sections.map((section) => `
      <section id="${escapeHtml(section.id)}" class="section seo-section">
        <div class="container">
          <div class="section-masthead">
            <div class="masthead-label">SEO Focus</div>
            <h2 class="masthead-title">${escapeHtml(section.heading)}</h2>
          </div>
          <div class="seo-content" data-scroll-reveal>
            ${(section.paragraphs || []).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}
            ${(section.bullets && section.bullets.length) ? `<ul>${section.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join('')}</ul>` : ''}
          </div>
        </div>
      </section>
    `).join('');
  }

  function renderBenefits(benefits) {
    if (!benefits || !benefits.items || !benefits.items.length) return '';
    return `
      <section id="features" class="section features-section">
        <div class="container">
          <div class="section-masthead">
            <div class="masthead-label">04 — Our Promise</div>
            <h2 class="masthead-title">${escapeHtml(benefits.heading || 'Why Choose NSZ Goa Ride?')}</h2>
          </div>
          <div class="features-grid">
            ${benefits.items.map((item) => `
              <div class="feature-card">
                <div class="feature-icon-wrap">${escapeHtml(item.icon || '✅')}</div>
                <h3>${escapeHtml(item.title)}</h3>
                <p>${escapeHtml(item.description)}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    `;
  }

  function renderHowItWorks(howItWorks) {
    if (!howItWorks || !howItWorks.steps || !howItWorks.steps.length) return '';
    return `
      <section class="section seo-section">
        <div class="container">
          <div class="section-masthead">
            <div class="masthead-label">03 — Process</div>
            <h2 class="masthead-title">${escapeHtml(howItWorks.heading || 'How it works')}</h2>
          </div>
          <div class="features-grid">
            ${howItWorks.steps.map((step) => `
              <div class="feature-card">
                <div class="feature-icon-wrap">${escapeHtml(step.number)}</div>
                <h3>${escapeHtml(step.title)}</h3>
                <p>${escapeHtml(step.description)}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    `;
  }

  function renderLocations(locations) {
    if (!locations || !locations.items || !locations.items.length) return '';
    return `
      <section class="section seo-section">
        <div class="container">
          <div class="section-masthead">
            <div class="masthead-label">Areas</div>
            <h2 class="masthead-title">${escapeHtml(locations.heading || 'Service areas')}</h2>
          </div>
          <div class="features-grid">
            ${locations.items.map((item) => `
              <div class="feature-card">
                <div class="feature-icon-wrap">📍</div>
                <h3>${escapeHtml(item.name)}</h3>
                <p>${escapeHtml(item.description)}</p>
                ${item.url && safeUrl(item.url, { sameOrigin: true }) ? `<p><a href="${escapeHtml(safeUrl(item.url, { sameOrigin: true }))}">Learn more</a></p>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    `;
  }

  function renderVehicleCards(vehicles) {
    if (!Array.isArray(vehicles) || !vehicles.length) return '';

    const cards = vehicles.map((vehicle) => {
      const image = safeUrl(vehicle.image);
      const transmissions = Array.isArray(vehicle.transmissions) ? vehicle.transmissions : [];
      if (!vehicle.name || !transmissions.length) return '';

      const specs = [
        vehicle.seatingCapacity,
        ...(Array.isArray(vehicle.features) ? vehicle.features : [])
      ].filter(Boolean);
      const priceRows = transmissions.map((transmission) => {
        const price = Number(transmission.dailyPrice);
        if (!transmission.type || !Number.isFinite(price) || price <= 0) return '';
        const formattedPrice = price.toLocaleString('en-IN');
        return `
          <div class="price-row">
            <span class="price-type">${escapeHtml(transmission.type)}</span>
            <span class="price-amt">₹${escapeHtml(formattedPrice)}<small>/day</small></span>
          </div>
        `;
      }).join('');
      if (!priceRows.trim()) return '';

      return `
        <article class="vehicle-card" data-category="${escapeHtml(vehicle.category || 'family')}" data-price="${escapeHtml(transmissions[0].dailyPrice)}">
          ${image ? `<div class="vehicle-photo"><img src="${escapeHtml(image)}" alt="${escapeHtml(vehicle.imageAlt || vehicle.name)}" width="800" height="520" loading="lazy" decoding="async"><span class="vehicle-badge">${escapeHtml(vehicle.badge || 'Fleet')}</span></div>` : ''}
          <div class="vehicle-body">
            <h3 class="vehicle-name">${escapeHtml(vehicle.name)}</h3>
            ${specs.length ? `<ul class="vehicle-specs">${specs.map((spec) => `<li>${escapeHtml(spec)}</li>`).join('')}</ul>` : ''}
            <div class="price-table">${priceRows}</div>
            <div class="card-actions">
              ${transmissions.map((transmission) => {
                const price = Number(transmission.dailyPrice);
                if (!transmission.type || !Number.isFinite(price) || price <= 0) return '';
                return `<button type="button" class="btn-card btn-card--orange" data-book-vehicle="${escapeHtml(vehicle.name)}" data-book-transmission="${escapeHtml(transmission.type)}" data-book-price="${escapeHtml(price.toLocaleString('en-IN'))}">Book ${escapeHtml(transmission.type)}</button>`;
              }).join('')}
            </div>
          </div>
        </article>
      `;
    }).filter(Boolean);

    return cards.length ? `<div class="vehicles-grid">${cards.join('')}</div>` : '';
  }

  function renderFleetSection(fleet, vehicles) {
    if (!fleet) return '';
    const controls = fleet.showAllVehicles === false ? '' : `
      <div class="fleet-controls" data-scroll-reveal>
        <label class="fleet-control-group" for="vehicle-filter"><span>Filter</span><select id="vehicle-filter" aria-label="Filter vehicles"><option value="all">All vehicles</option><option value="budget">Budget</option><option value="family">Family</option><option value="luxury">Luxury</option></select></label>
        <label class="fleet-control-group" for="vehicle-sort"><span>Sort by</span><select id="vehicle-sort" aria-label="Sort vehicles"><option value="price-asc">Price: Low to High</option><option value="price-desc">Price: High to Low</option><option value="name">Name</option></select></label>
      </div>
    `;
    return `
      <section id="vehicles" class="section vehicles-section" data-section="vehicles">
        <div class="container">
          <div class="section-masthead">
            <div class="masthead-label">01 — Fleet</div>
            <h2 class="masthead-title">${escapeHtml(fleet.heading || 'Choose from Our Goa Self-Drive Fleet')}</h2>
            ${fleet.description ? `<p class="masthead-desc">${escapeHtml(fleet.description)}</p>` : ''}
          </div>
          ${controls}
          ${renderVehicleCards(vehicles)}
        </div>
      </section>
    `;
  }

  function renderVehicleOptions(vehicles) {
    if (!Array.isArray(vehicles) || !vehicles.length) return '';
    return vehicles.flatMap((vehicle) => (vehicle.transmissions || []).map((transmission) => {
      const price = Number(transmission.dailyPrice);
      if (!vehicle.name || !transmission.type || !Number.isFinite(price) || price <= 0) return '';
      const value = `${vehicle.name} ${transmission.type} - ₹${price.toLocaleString('en-IN')}/day`;
      return `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`;
    })).filter(Boolean).join('');
  }

  function renderCalculatorOptions(vehicles) {
    if (!Array.isArray(vehicles) || !vehicles.length) return '';
    return vehicles.flatMap((vehicle) => (vehicle.transmissions || []).map((transmission) => {
      const price = Number(transmission.dailyPrice);
      if (!vehicle.name || !transmission.type || !Number.isFinite(price) || price <= 0) return '';
      return `<option value="${escapeHtml(price)}">${escapeHtml(vehicle.name)} (${escapeHtml(transmission.type)}) — ₹${escapeHtml(price.toLocaleString('en-IN'))}/day</option>`;
    })).filter(Boolean).join('');
  }

  function renderGallery(gallery, heading) {
    if (!Array.isArray(gallery) || !gallery.length) return '';
    const images = gallery.map((item) => {
      const image = safeUrl(item.image);
      if (!image || !item.alt) return '';
      return `<figure><img src="${escapeHtml(image)}" alt="${escapeHtml(item.alt || '')}" width="800" height="520" loading="lazy" decoding="async"></figure>`;
    }).filter(Boolean);
    if (!images.length) return '';

    return `
      <section class="section seo-gallery" aria-labelledby="seo-gallery-heading">
        <div class="container">
          <div class="section-masthead"><div class="masthead-label">Fleet photos</div><h2 class="masthead-title" id="seo-gallery-heading">${escapeHtml(heading || 'Our vehicles')}</h2></div>
          <div class="seo-gallery-grid">${images.join('')}</div>
        </div>
      </section>
    `;
  }

  function renderOptionalContent(section, id) {
    if (!section || !Array.isArray(section.paragraphs) || !section.paragraphs.length) return '';
    return `
      <section class="section seo-section" id="${escapeHtml(id)}">
        <div class="container">
          <div class="section-masthead"><h2 class="masthead-title">${escapeHtml(section.heading || '')}</h2></div>
          <div class="seo-content">${section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}</div>
        </div>
      </section>
    `;
  }

  function renderPricing(page) {
    if (!page.pricing) return '';
    return `
      <section class="section seo-pricing">
        <div class="container">
          <div class="section-masthead"><h2 class="masthead-title">${escapeHtml(page.pricing.heading || 'Pricing and rental conditions')}</h2></div>
          ${page.pricing.description ? `<div class="seo-content"><p>${escapeHtml(page.pricing.description)}</p></div>` : ''}
        </div>
      </section>
    `;
  }

  function renderFinalCta(page) {
    const primary = page.primaryCTA;
    const secondary = page.secondaryCTA;
    if (!primary && !secondary) return '';
    const primaryHref = primary && safeUrl(primary.href, { sameOrigin: true });
    const secondaryHref = secondary && safeUrl(secondary.href);
    return `
      <section class="section seo-final-cta">
        <div class="container">
          <h2>${escapeHtml(page.hero.h1)}</h2>
          <p>Confirm your vehicle, dates and pickup details with NSZ Goa Ride.</p>
          <div class="hero-actions">
            ${primaryHref ? `<a class="btn-hero-primary" href="${escapeHtml(primaryHref)}">${escapeHtml(primary.label || 'Check availability')}</a>` : ''}
            ${secondaryHref ? `<a class="btn-hero-ghost" href="${escapeHtml(secondaryHref)}" target="_blank" rel="noopener">${escapeHtml(secondary.label || 'WhatsApp')}</a>` : ''}
          </div>
        </div>
      </section>
    `;
  }

  function renderPageActions(root) {
    if (root.dataset.nszActionsReady === 'true') return;
    root.dataset.nszActionsReady = 'true';
    root.addEventListener('click', (event) => {
      if (!(event.target instanceof Element)) return;
      const button = event.target.closest('[data-book-vehicle]');
      if (!button || !root.contains(button)) return;

      if (typeof window.sendGoogleAdsConversion === 'function') window.sendGoogleAdsConversion();
      if (typeof window.bookViaWhatsApp === 'function') {
        window.bookViaWhatsApp(
          button.getAttribute('data-book-vehicle'),
          button.getAttribute('data-book-transmission'),
          `₹${button.getAttribute('data-book-price')}`
        );
      } else {
        console.error('The WhatsApp booking function is unavailable.');
      }
    });
  }

  function renderSeoMarkup(page) {
    const vehicles = getPageVehicles(page);
    const vehicleOptions = renderVehicleOptions(vehicles);
    const calculatorOptions = renderCalculatorOptions(vehicles);
    const pickupOptions = renderPickupOptions(page);
    const minimumDailyRate = vehicles
      .flatMap((vehicle) => vehicle.transmissions || [])
      .map((transmission) => Number(transmission.dailyPrice))
      .filter((price) => Number.isFinite(price) && price > 0)
      .sort((a, b) => a - b)[0];
    const relatedLinks = (page.relatedPages || []).map((slug) => {
      const href = safeUrl(slug, { sameOrigin: true });
      if (!href) return '';
      const label = slug.replace(/^\/|\/$/g, '').split('/').pop().replace(/-/g, ' ');
      return `<a href="${escapeHtml(href)}">${escapeHtml(label)}</a>`;
    }).filter(Boolean).join(' · ');
    const headingLines = String(page.hero.h1 || '').split(/\s+/).filter(Boolean);
    const h1 = `
      <h1 class="hero-heading">${[
        headingLines.slice(0, 2).join(' '),
        headingLines.slice(2, 4).join(' '),
        headingLines.slice(4).join(' ')
      ].filter(Boolean).map((line, index) => `<span class="h1-line ${index === 0 ? 'h1-line--outline' : index === 1 ? 'h1-line--filled' : 'h1-line--italic'}">${escapeHtml(line)}</span>`).join(' ')}</h1>
    `;
    const heroImage = safeUrl(page.hero.image);
    const primaryHref = page.primaryCTA && safeUrl(page.primaryCTA.href, { sameOrigin: true });
    const secondaryHref = page.secondaryCTA && safeUrl(page.secondaryCTA.href);
    const breadcrumbs = renderBreadcrumbs(page.breadcrumbs);
    const faqMarkup = renderFaqs(page.faqs);
    const bookingPerks = Array.isArray(page.bookingPerks) ? page.bookingPerks : [
      'Confirm the selected vehicle and dates before travelling.',
      'Pickup and drop-off arrangements are confirmed during booking.',
      'Ask the team to confirm the deposit and rental conditions.'
    ];
    const vehicleSelectOptions = Array.isArray(page.vehicles) ? vehicleOptions : vehicleOptions || `
      <optgroup label="Economy Cars"><option value="Maruti Ignis Manual - ₹1,200/day">Maruti Ignis Manual - ₹1,200/day</option><option value="Maruti Swift Manual - ₹1,200/day">Maruti Swift Manual - ₹1,200/day</option></optgroup>
      <optgroup label="SUVs"><option value="Maruti Brezza Manual - ₹2,000/day">Maruti Brezza Manual - ₹2,000/day</option><option value="Hyundai Creta Manual - ₹2,500/day">Hyundai Creta Manual - ₹2,500/day</option></optgroup>
      <optgroup label="Luxury"><option value="Toyota Fortuner Automatic - ₹6,000/day">Toyota Fortuner Automatic - ₹6,000/day</option></optgroup>
    `;
    const calcOptions = Array.isArray(page.vehicles) ? calculatorOptions : calculatorOptions || `
      <option value="1200">Maruti Ignis — ₹1,200/day</option>
      <option value="1200">Maruti Swift — ₹1,200/day</option>
      <option value="2000">Maruti Brezza — ₹2,000/day</option>
      <option value="2500">Hyundai Creta — ₹2,500/day</option>
      <option value="6000">Toyota Fortuner — ₹6,000/day</option>
    `;
    const heroRight = heroImage
      ? `<img class="seo-hero-image" src="${escapeHtml(heroImage)}" alt="${escapeHtml(page.hero.imageAlt || page.hero.h1)}" width="1200" height="780" fetchpriority="high" decoding="async">`
      : `
        <div class="stat-stack">
          <div class="stat-item"><span class="stat-num">Cars</span><span class="stat-lbl">Self-drive options</span></div>
          <div class="stat-divider"></div>
          <div class="stat-item"><span class="stat-num">Goa</span><span class="stat-lbl">Rental enquiries</span></div>
          <div class="stat-divider"></div>
          <div class="stat-item"><span class="stat-num">NSZ</span><span class="stat-lbl">Local booking support</span></div>
        </div>
      `;

    return `
      <nav class="navbar" id="navbar" role="navigation" aria-label="Main navigation">
        <div class="nav-inner">
          <a class="logo" href="/">
            <img src="/image/logo.png" alt="NSZ Goa Ride" width="120" height="38">
          </a>
          <ul class="nav-menu" id="nav-menu">
            <li><a href="/">Home</a></li>
            <li><a href="/cars/">Cars</a></li>
            <li><a href="/bikes/">Bikes</a></li>
            <li><a href="/booking/">Book Now</a></li>
            <li><a href="/#features">Why Us</a></li>
            <li><a href="/#testimonials">Reviews</a></li>
            <li><a href="#faq">FAQ</a></li>
            <li class="nav-dropdown">
              <button class="nav-dropdown-toggle" type="button" aria-expanded="false" aria-controls="nav-more-menu">More <span aria-hidden="true">▾</span></button>
              <ul class="dropdown-menu" id="nav-more-menu">
                <li><a href="/car-rental-goa/">Car Rental Goa</a></li>
                <li><a href="/self-drive-car-goa/">Self Drive Cars</a></li>
                <li><a href="/goa-airport-taxi/">Airport Taxi</a></li>
                <li><a href="/bike-rental-goa/">Bike Rental</a></li>
                <li><a href="/luxury-car-rental-goa/">Luxury Cars</a></li>
                <li><a href="/gallery/">Gallery</a></li>
                <li><a href="/self-drive-car-rental-goa/">Self Drive</a></li>
                <li><a href="/goa-airport-car-rental/">Airport</a></li>
                <li><a href="/north-goa-car-rental/">North Goa</a></li>
                <li><a href="/south-goa-car-rental/">South Goa</a></li>
              </ul>
            </li>
            <li><a href="/contact/">Contact</a></li>
          </ul>
          <div class="nav-right">
            <button class="dark-mode-toggle" id="dark-mode-toggle" aria-label="Toggle dark mode"><i class="fas fa-moon"></i></button>
            <a id="nav-whatsapp-link" href="https://wa.me/918262812997?text=${encodeURIComponent('Hi! I would like to book a car in Goa.')}" class="nav-cta" target="_blank" rel="noopener"><i class="fab fa-whatsapp"></i><span>Chat</span></a>
            <button class="mobile-menu" id="mobile-menu" aria-label="Menu" aria-expanded="false" aria-controls="nav-menu"><span></span><span></span><span></span></button>
          </div>
        </div>
      </nav>

      <a class="sticky-booking-cta" href="/booking/" aria-label="Book a car rental in Goa">
        <span><i class="fab fa-whatsapp"></i> Book Now</span>
        <strong>${minimumDailyRate ? `From ₹${escapeHtml(minimumDailyRate.toLocaleString('en-IN'))}/day` : 'Check rates'}</strong>
      </a>

      ${breadcrumbs}

      <section id="home" class="hero seo-page-hero${heroImage ? ' seo-page-hero--with-image' : ''}" role="banner">
        <div class="hero-bg-image" aria-hidden="true"></div>
        <div class="hero-tint" aria-hidden="true"></div>
        <div class="hero-layout">
          <div class="hero-left">
            <div class="hero-tag"><span class="tag-dot"></span>${escapeHtml(page.hero.eyebrow || page.primaryKeyword)}</div>
            ${h1}
            <p class="hero-sub">${escapeHtml(page.hero.description)}</p>
            <div class="hero-actions">
              ${primaryHref ? `<a href="${escapeHtml(primaryHref)}" class="btn-hero-primary"><i class="fas fa-car"></i> ${escapeHtml(page.primaryCTA.label || 'Book Now')}</a>` : '<a href="/booking/" class="btn-hero-primary"><i class="fas fa-car"></i> Book Now</a>'}
              ${secondaryHref ? `<a href="${escapeHtml(secondaryHref)}" class="btn-hero-ghost" target="_blank" rel="noopener"><i class="fab fa-whatsapp"></i> ${escapeHtml(page.secondaryCTA.label || 'WhatsApp')}</a>` : '<a href="https://wa.me/918262812997" class="btn-hero-ghost" target="_blank" rel="noopener"><i class="fab fa-whatsapp"></i> WhatsApp</a>'}
            </div>
          </div>
          <div class="hero-right">${heroRight}</div>
        </div>
        <div class="hero-scroll-cue" aria-hidden="true"><span>SCROLL</span><i class="fas fa-chevron-down"></i></div>
      </section>

      ${renderFleetSection(page.fleet, vehicles)}

      ${renderGallery(page.gallery, page.hero.h1)}

      <section id="booking" class="section booking-section">
        <div class="container">
          <div class="booking-layout">
            <div class="booking-intro">
              <div class="masthead-label">03 — Reserve</div>
              <h2 class="booking-title">Book Your<br><em>Ride Now</em></h2>
              <p>Fill out the form and get instant confirmation via WhatsApp. Transparent pricing and quick support.</p>
              <div class="trip-calculator" data-scroll-reveal>
                <h3>Trip Cost Calculator</h3>
                <label for="calculator-vehicle">Choose your vehicle</label>
                <select id="calculator-vehicle">${calcOptions}</select>
                <label for="calculator-days">Rental days</label>
                <input id="calculator-days" type="number" min="1" max="30" value="3">
                <div id="calculator-output" class="calculator-output">Estimated total: ₹3,600</div>
              </div>
              ${bookingPerks.length ? `<ul class="booking-perks">${bookingPerks.map((perk) => `<li><i class="fas fa-check-circle"></i> ${escapeHtml(perk)}</li>`).join('')}</ul>` : ''}
            </div>
            <div class="booking-form-wrap">
              <div id="booking-messages"></div>
              <form id="booking-form" class="booking-form">
                <div class="form-grid">
                  <div class="form-group form-group--full"><label for="vehicle">Select Vehicle</label><select id="vehicle" required><option value="">Choose a vehicle...</option>${vehicleSelectOptions}</select></div>
                  <div class="form-group"><label for="name">Full Name</label><input type="text" id="name" placeholder="Your full name" required minlength="2" maxlength="50"></div>
                  <div class="form-group"><label for="phone">Phone Number</label><input type="tel" id="phone" placeholder="+91 98765 43210" required inputmode="numeric"></div>
                  <div class="form-group"><label for="email">Email Address</label><input type="email" id="email" placeholder="your@email.com" required></div>
                  <div class="form-group"><label for="pickup">Pickup Date</label><input type="date" id="pickup" required></div>
                  <div class="form-group"><label for="dropoff">Drop-off Date</label><input type="date" id="dropoff" required></div>
                  <div class="form-group form-group--full"><label for="location">Pickup Location</label><select id="location" required><option value="">Select location...</option>${pickupOptions}</select></div>
                  <div class="form-group form-group--full"><label for="requests">Special Requests <span class="label-opt">(Optional)</span></label><textarea id="requests" placeholder="Any special requirements..." rows="3"></textarea></div>
                </div>
                <button type="submit" class="btn-submit"><i class="fab fa-whatsapp"></i> Confirm via WhatsApp</button>
              </form>
            </div>
          </div>
        </div>
      </section>

      ${renderBenefits(page.benefits)}
      ${renderHighlights(page.highlights, page.hero.h1)}
      ${renderHowItWorks(page.howItWorks)}
      ${renderLocations(page.locations)}

      ${renderOptionalContent(page.introduction, 'introduction')}

      ${renderSections(page.sections)}

      ${renderOptionalContent(page.pickupInformation, 'pickup-information')}
      ${renderOptionalContent(page.travelInformation, 'travel-information')}
      ${renderPricing(page)}

      ${faqMarkup ? `<section id="faq" class="section faq-section">
        <div class="container">
          <div class="section-masthead">
            <div class="masthead-label">Questions</div>
            <h2 class="masthead-title">Frequently asked questions</h2>
          </div>
          ${faqMarkup}
        </div>
      </section>` : ''}

      ${relatedLinks ? `<section class="seo-related"><div class="container"><h2>Related pages</h2><p>${relatedLinks}</p></div></section>` : ''}
      ${renderFinalCta(page)}

      <footer id="contact" class="footer" role="contentinfo">
        <div class="footer-top-bar"></div>
        <div class="container">
          <div class="footer-grid">
            <div class="footer-col">
              <h3>NSZ Goa Ride</h3>
              <p>Your trusted partner for premium car and bike rentals in Goa. Explore the beauty of Goa with our well-maintained fleet.</p>
              <div class="social-row">
                <a href="https://wa.me/918262812997" target="_blank" rel="noopener" aria-label="WhatsApp"><i class="fab fa-whatsapp"></i></a>
                <a href="https://www.instagram.com/goaride" target="_blank" rel="noopener" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
                <a href="https://www.facebook.com/goaride" target="_blank" rel="noopener" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
              </div>
            </div>
            <div class="footer-col">
              <h3>Contact Us</h3>
              <a href="tel:+918262812997">📞 +91 8262812997</a>
              <a href="https://wa.me/918262812997" target="_blank" rel="noopener">💬 WhatsApp Chat</a>
              <a href="mailto:info@goaride.com">📧 info@goaride.com</a>
            </div>
            <div class="footer-col">
              <h3>Our Location</h3>
              <p>Near Madgaon Railway Station<br>Madgaon, Goa 403601, India</p>
              <p><strong>Service Areas:</strong><br>North &amp; South Goa · Dabolim Airport<br>Panaji · Vasco Da Gama</p>
            </div>
            <div class="footer-col">
              <h3>Hours</h3>
              <p><strong>Mon – Sun</strong><br>6:00 AM – 10:00 PM IST</p>
              <p><strong>24/7 WhatsApp Support</strong><br>Emergency Assistance</p>
            </div>
          </div>
          <div class="footer-bottom">
            <p>&copy; 2025 NSZ Goa Ride Car Rentals. All rights reserved. | <a href="/privacy-policy/">Privacy Policy</a> | <a href="/terms-and-conditions/">Terms of Service</a></p>
          </div>
        </div>
      </footer>

      <a id="fab-whatsapp-link" href="https://wa.me/918262812997" class="fab-whatsapp" target="_blank" rel="noopener" aria-label="WhatsApp booking"><i class="fab fa-whatsapp"></i></a>
      <a href="tel:+918262812997" class="fab-phone" aria-label="Call NSZ Goa Ride"><i class="fas fa-phone"></i></a>
    `;
  }

  function applyMeta(page) {
    const seo = page.seo || {};
    const fallbackUrl = `${SITE_BASE}${page.slug === '/' ? '/' : `${String(page.slug || '').replace(/\/+$/, '')}/`}`;
    const canonicalUrl = safeUrl(seo.canonical || fallbackUrl, { sameOrigin: true }) || fallbackUrl;
    const canonical = new URL(canonicalUrl, SITE_BASE);
    if (canonical.pathname !== '/' && !/\.[^/]+$/.test(canonical.pathname)) {
      canonical.pathname = `${canonical.pathname.replace(/\/+$/, '')}/`;
    }
    const canonicalHref = canonical.href;
    const description = seo.metaDescription || page.hero.description || '';
    const socialTitle = seo.ogTitle || seo.title || '';
    const socialDescription = seo.ogDescription || description;
    const socialImage = safeUrl(seo.ogImage) || safeUrl(page.hero.image) || `${SITE_BASE}/image/logo.png`;
    const metadata = [
      ['meta[name="description"]', 'name', 'description', description],
      ['meta[name="robots"]', 'name', 'robots', seo.robots || 'index, follow'],
      ['meta[property="og:title"]', 'property', 'og:title', socialTitle],
      ['meta[property="og:description"]', 'property', 'og:description', socialDescription],
      ['meta[property="og:url"]', 'property', 'og:url', canonicalHref],
      ['meta[property="og:type"]', 'property', 'og:type', seo.ogType || 'website'],
      ['meta[property="og:image"]', 'property', 'og:image', socialImage || ''],
      ['meta[name="twitter:card"]', 'name', 'twitter:card', seo.twitterCard || 'summary_large_image'],
      ['meta[name="twitter:title"]', 'name', 'twitter:title', socialTitle],
      ['meta[name="twitter:description"]', 'name', 'twitter:description', socialDescription],
      ['meta[name="twitter:image"]', 'name', 'twitter:image', socialImage || '']
    ];

    document.title = seo.title || page.hero.h1 || 'NSZ Goa Ride';
    metadata.forEach(([selector, key, value, content]) => {
      let element = document.head.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(key, value);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    });

    let canonicalLink = document.head.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalHref);
  }

  function renderSchema(page) {
    if (!page) return;

    const seo = page.seo || {};
    const canonical = safeUrl(seo.canonical || `${SITE_BASE}${page.slug || '/'}`, { sameOrigin: true }) || `${SITE_BASE}${page.slug || '/'}`;
    const pageUrl = new URL(canonical, SITE_BASE);
    if (pageUrl.pathname !== '/' && !/\.[^/]+$/.test(pageUrl.pathname)) {
      pageUrl.pathname = `${pageUrl.pathname.replace(/\/+$/, '')}/`;
    }
    const canonicalUrl = pageUrl.href;
    const pageTitle = seo.title || page.primaryKeyword || 'NSZ Goa Ride';
    const description = seo.metaDescription || page.hero?.description || 'NSZ Goa Ride car rental services in Goa.';
    const serviceName = page.primaryKeyword || pageTitle;
    const configuredBreadcrumbs = Array.isArray(page.breadcrumbs) && page.breadcrumbs.length
      ? page.breadcrumbs
      : [{ name: 'Home', url: '/' }, { name: pageTitle }];
    const schemaBreadcrumbs = configuredBreadcrumbs.map((item, index) => {
      const href = item.url && safeUrl(item.url, { sameOrigin: true });
      const itemUrl = href ? new URL(href, SITE_BASE).href : index === configuredBreadcrumbs.length - 1 ? canonicalUrl : null;
      return {
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        ...(itemUrl ? { item: itemUrl } : {})
      };
    });

    const webPageSchema = {
      '@type': 'WebPage',
      '@id': `${canonicalUrl}#webpage`,
      url: canonicalUrl,
      name: pageTitle,
      description,
      isPartOf: {
        '@type': 'WebSite',
        '@id': `${SITE_BASE}/#website`,
        url: SITE_BASE,
        name: 'NSZ Goa Ride'
      },
      breadcrumb: { '@id': `${canonicalUrl}#breadcrumb` }
    };

    const breadcrumbSchema = {
      '@type': 'BreadcrumbList',
      '@id': `${canonicalUrl}#breadcrumb`,
      itemListElement: schemaBreadcrumbs
    };
    const schemaData = page.schemaData || {};

    const serviceSchema = {
      '@type': 'Service',
      name: serviceName,
      serviceType: schemaData.serviceType || serviceName,
      description,
      url: canonicalUrl,
      provider: {
        '@type': 'Organization',
        name: 'NSZ Goa Ride',
        url: SITE_BASE,
        telephone: '+91 8262812997'
      },
      areaServed: schemaData.areaServed || 'Goa',
      category: 'Car Rental'
    };

    const faqSchema = schemaData.includeFAQ === true && Array.isArray(page.faqs) && page.faqs.length ? {
      '@type': 'FAQPage',
      mainEntity: page.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer
        }
      }))
    } : null;

    const schema = {
      '@context': 'https://schema.org',
      '@graph': [webPageSchema, breadcrumbSchema, serviceSchema]
    };
    if (faqSchema) schema['@graph'].push(faqSchema);

    const existingScripts = document.head.querySelectorAll('script[type="application/ld+json"]');
    existingScripts.forEach((script) => script.remove());

    const jsonLdScript = document.createElement('script');
    jsonLdScript.type = 'application/ld+json';
    jsonLdScript.setAttribute('data-nsz-schema', 'true');
    jsonLdScript.textContent = JSON.stringify(schema);
    document.head.appendChild(jsonLdScript);
  }

  function renderPageNotFound() {
    document.title = 'Page Not Found | NSZ Goa Ride';
    const root = document.getElementById('seo-page-root');
    if (!root) return;
    root.innerHTML = `
      <nav class="navbar" id="navbar"><div class="nav-inner"><a class="logo" href="/"><img src="/image/logo.png" alt="NSZ Goa Ride" width="120" height="38"></a><ul class="nav-menu" id="nav-menu"><li><a href="/">Home</a></li><li><a href="/self-drive-car-rental-goa/">Self Drive</a></li><li><a href="/goa-airport-car-rental/">Airport</a></li><li><a href="/contact/">Contact</a></li></ul><div class="nav-right"><a href="https://wa.me/918262812997" class="nav-cta" target="_blank" rel="noopener"><i class="fab fa-whatsapp"></i><span>Chat</span></a></div></div></nav>
      <section class="section features-section"><div class="container" style="padding:120px 0 60px; text-align:center;"><div class="masthead-label">404</div><h1 class="hero-heading" style="font-size:clamp(2.5rem,6vw,5rem);">Page Not Found</h1><p class="hero-sub">The page you requested is unavailable or has moved. Please return to the homepage to continue browsing NSZ Goa Ride.</p><div class="hero-actions"><a href="/" class="btn-hero-primary"><i class="fas fa-home"></i> Back to Home</a></div></div></section>
    `;
  }

  function renderSeoPage() {
    const page = getCurrentPage();
    const root = document.getElementById('seo-page-root');
    if (!root) return;

    if (!page) {
      renderPageNotFound();
      return;
    }

    applyMeta(page);
    renderSchema(page);
    root.innerHTML = renderSeoMarkup(page);
    renderPageActions(root);
  }

  document.addEventListener('DOMContentLoaded', renderSeoPage);
})();

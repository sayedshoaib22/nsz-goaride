(function () {
  const SITE_BASE = 'https://nszgoaride.com';

  function normalizePath(pathname) {
    if (!pathname) return '/';
    const withoutHtml = pathname.replace(/\/index\.html$/i, '/').replace(/\.html$/i, '');
    const cleaned = withoutHtml.replace(/\/+$/, '') || '/';
    return cleaned === '' ? '/' : cleaned;
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function getCurrentPage() {
    const pathname = normalizePath(window.location.pathname);
    const direct = window.seoPages && (window.seoPages[pathname] || window.seoPages[pathname + '/']);
    if (direct) return direct;
    const matchKey = Object.keys(window.seoPages || {}).find((key) => key.toLowerCase() === pathname.toLowerCase());
    return matchKey ? window.seoPages[matchKey] : null;
  }

  function renderFaqs(faqs) {
    if (!faqs || !faqs.length) return '<div class="faq-grid"><div class="faq-item"><h3 class="faq-q">No FAQs available yet.</h3><p class="faq-a">Please contact NSZ Goa Ride for booking support.</p></div></div>';
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
                ${item.url ? `<p><a href="${escapeHtml(item.url)}">Learn more</a></p>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    `;
  }

  function renderVehicleCards() {
    const cars = [
      { name: 'Maruti Ignis', category: 'budget', price: '1200', badge: 'Popular', photo: 'image/ignis.jpeg' },
      { name: 'Maruti Swift', category: 'budget', price: '1200', badge: 'Popular', photo: 'image/swift.png' },
      { name: 'Maruti Brezza', category: 'family', price: '2000', badge: 'SUV', photo: 'https://image2url.com/r2/default/images/1771080613820-4e08e3eb-6cf3-456d-af67-d620cf20afa2.jpeg' },
      { name: 'Hyundai Creta', category: 'family', price: '2500', badge: 'Premium SUV', photo: 'https://image2url.com/r2/default/images/1771082168034-3cea15fd-961e-441b-827a-e772f7a0db43.png' },
      { name: 'Toyota Innova Crysta', category: 'family', price: '3000', badge: 'Family', photo: 'https://image2url.com/r2/default/images/1771082409934-b12afb7d-7dfd-42d5-a583-c6b96ae3b097.jpeg' },
      { name: 'Toyota Fortuner', category: 'luxury', price: '6000', badge: 'Luxury', photo: 'https://image2url.com/r2/default/images/1771085163103-0cfc8bf6-b170-4f60-9be3-068e68b08592.jpeg' }
    ];

    return `
      <div class="vehicles-grid">
        ${cars.map((car, index) => `
          <div class="vehicle-card" data-category="${car.category}" data-price="${car.price}">
            <div class="vehicle-photo" style="background-image:url('${escapeHtml(car.photo)}');" role="img" aria-label="${escapeHtml(car.name)} rental Goa">
              <div class="vehicle-badge">${escapeHtml(car.badge)}</div>
              <div class="vehicle-photo-num" aria-hidden="true">${String(index + 1).padStart(2, '0')}</div>
            </div>
            <div class="vehicle-body">
              <h3 class="vehicle-name">${escapeHtml(car.name)}</h3>
              <ul class="vehicle-specs">
                <li><i class="fas fa-rupee-sign"></i>₹3,000 Deposit</li>
                <li><i class="fas fa-snowflake"></i>Air Conditioning</li>
                <li><i class="fas fa-users"></i>4–5 Seater</li>
                <li><i class="fas fa-gas-pump"></i>Fuel Efficient</li>
              </ul>
              <div class="price-table">
                <div class="price-row">
                  <span class="price-type">Manual</span>
                  <span class="price-amt">₹${escapeHtml(car.price)}<small>/day</small></span>
                </div>
                <div class="price-row">
                  <span class="price-type">Automatic</span>
                  <span class="price-amt">₹${Number(car.price) + 300}<small>/day</small></span>
                </div>
              </div>
              <div class="card-actions">
                <button class="btn-card btn-card--dark" onclick="gtag_report_conversion(); bookViaWhatsApp('${escapeHtml(car.name)}','Manual','₹${escapeHtml(car.price)}')"><i class="fab fa-whatsapp"></i> Manual</button>
                <button class="btn-card btn-card--orange" onclick="gtag_report_conversion(); bookViaWhatsApp('${escapeHtml(car.name)}','Automatic','₹${Number(car.price) + 300}')"><i class="fab fa-whatsapp"></i> Auto</button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderSeoMarkup(page) {
    const relatedLinks = (page.relatedPages || []).map((slug) => `<a href="${escapeHtml(slug)}">${escapeHtml(slug.replace('/', ''))}</a>`).join(' · ');

    return `
      <nav class="navbar" id="navbar" role="navigation" aria-label="Main navigation">
        <div class="nav-inner">
          <a class="logo" href="/">
            <img src="/image/logo.png" alt="NSZ Goa Ride" loading="lazy" width="120" height="38">
          </a>
          <ul class="nav-menu" id="nav-menu">
            <li><a href="/">Home</a></li>
            <li><a href="/self-drive-car-rental-goa">Self Drive</a></li>
            <li><a href="/goa-airport-car-rental">Airport</a></li>
            <li><a href="/north-goa-car-rental">North Goa</a></li>
            <li><a href="/south-goa-car-rental">South Goa</a></li>
            <li><a href="#booking">Book</a></li>
            <li><a href="#features">Why Us</a></li>
            <li><a href="#faq">FAQ</a></li>
            <li><a href="/gallery.html">Gallery</a></li>
            <li><a href="/contact.html">Contact</a></li>
          </ul>
          <div class="nav-right">
            <button class="dark-mode-toggle" id="dark-mode-toggle" aria-label="Toggle dark mode"><i class="fas fa-moon"></i></button>
            <a id="nav-whatsapp-link" href="https://wa.me/918262812997?text=${encodeURIComponent('Hi! I would like to book a car in Goa.')}" class="nav-cta" target="_blank" rel="noopener"><i class="fab fa-whatsapp"></i><span>Chat</span></a>
            <button class="mobile-menu" id="mobile-menu" aria-label="Menu"><span></span><span></span><span></span></button>
          </div>
        </div>
      </nav>

      <a class="sticky-booking-cta" href="#booking" aria-label="Book a car rental in Goa">
        <span><i class="fab fa-whatsapp"></i> Book Now</span>
        <strong>From ₹1,200/day</strong>
      </a>

      <section id="home" class="hero" role="banner">
        <div class="hero-bg-image" aria-hidden="true"></div>
        <div class="hero-tint" aria-hidden="true"></div>
        <div class="hero-layout">
          <div class="hero-left">
            <div class="hero-tag"><span class="tag-dot"></span>${escapeHtml(page.hero.eyebrow || page.primaryKeyword)}</div>
            <h1 class="hero-heading">
              <span class="h1-line h1-line--outline">${escapeHtml(page.hero.h1.split(' ').slice(0, 3).join(' ') || 'Self Drive')}</span>
              <span class="h1-line h1-line--filled">${escapeHtml(page.hero.h1.split(' ').slice(3, 6).join(' ') || 'Car Rental')}</span>
              <span class="h1-line h1-line--italic">${escapeHtml(page.hero.h1.split(' ').slice(6).join(' ') || 'in Goa')}</span>
            </h1>
            <p class="hero-sub">${escapeHtml(page.hero.description)}</p>
            <div class="hero-actions">
              <a href="#booking" class="btn-hero-primary"><i class="fas fa-car"></i> Book Now</a>
              <a href="https://wa.me/918262812997" class="btn-hero-ghost" target="_blank" rel="noopener"><i class="fab fa-whatsapp"></i> WhatsApp</a>
            </div>
          </div>
          <div class="hero-right">
            <div class="stat-stack">
              <div class="stat-item"><span class="stat-num">Cars</span><span class="stat-lbl">Self-drive options</span></div>
              <div class="stat-divider"></div>
              <div class="stat-item"><span class="stat-num">Goa</span><span class="stat-lbl">Airport & local pickup</span></div>
              <div class="stat-divider"></div>
              <div class="stat-item"><span class="stat-num">Clear</span><span class="stat-lbl">Upfront pricing</span></div>
            </div>
            <div class="hero-pill"><i class="fas fa-map-marker-alt"></i> Madgaon · Dabolim Airport · Pan-Goa</div>
          </div>
        </div>
        <div class="hero-scroll-cue" aria-hidden="true"><span>SCROLL</span><i class="fas fa-chevron-down"></i></div>
      </section>

      <section id="vehicles" class="section vehicles-section" data-section="vehicles">
        <div class="container">
          <div class="section-masthead">
            <div class="masthead-label">01 — Fleet</div>
            <h2 class="masthead-title">${escapeHtml(page.fleet.heading || 'Choose from Our Goa Self-Drive Fleet (Hatchbacks, Sedans, SUVs & Luxury)')}</h2>
            <p class="masthead-desc">${escapeHtml(page.fleet.description || 'Self-drive cars from ₹1,200/day with flexible airport and local pickups.')}</p>
          </div>
          <div class="fleet-controls" data-scroll-reveal>
            <label class="fleet-control-group" for="vehicle-filter"><span>Filter</span><select id="vehicle-filter" aria-label="Filter vehicles"><option value="all">All vehicles</option><option value="budget">Budget</option><option value="family">Family</option><option value="luxury">Luxury</option></select></label>
            <label class="fleet-control-group" for="vehicle-sort"><span>Sort by</span><select id="vehicle-sort" aria-label="Sort vehicles"><option value="price-asc">Price: Low to High</option><option value="price-desc">Price: High to Low</option><option value="name">Name</option></select></label>
          </div>
          ${renderVehicleCards()}
        </div>
      </section>

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
                <select id="calculator-vehicle"><option value="1200">Maruti Ignis — ₹1,200/day</option><option value="1500">Maruti Swift — ₹1,500/day</option><option value="2000">Maruti Brezza — ₹2,000/day</option><option value="3200">Hyundai Creta — ₹3,200/day</option><option value="6000">Toyota Fortuner — ₹6,000/day</option></select>
                <label for="calculator-days">Rental days</label>
                <input id="calculator-days" type="number" min="1" max="30" value="3">
                <div id="calculator-output" class="calculator-output">Estimated total: ₹3,600</div>
              </div>
              <ul class="booking-perks">
                <li><i class="fas fa-check-circle"></i> Free airport pickup</li>
                <li><i class="fas fa-check-circle"></i> Instant WhatsApp confirmation</li>
                <li><i class="fas fa-check-circle"></i> No hidden charges</li>
                <li><i class="fas fa-check-circle"></i> 24/7 local support</li>
              </ul>
            </div>
            <div class="booking-form-wrap">
              <div id="booking-messages"></div>
              <form id="booking-form" class="booking-form">
                <div class="form-grid">
                  <div class="form-group form-group--full"><label for="vehicle">Select Vehicle</label><select id="vehicle" required><option value="">Choose a vehicle...</option><optgroup label="Economy Cars"><option value="Maruti Ignis Manual - ₹1,200/day">Maruti Ignis Manual - ₹1,200/day</option><option value="Maruti Swift Manual - ₹1,200/day">Maruti Swift Manual - ₹1,200/day</option></optgroup><optgroup label="SUVs"><option value="Maruti Brezza Manual - ₹2,000/day">Maruti Brezza Manual - ₹2,000/day</option><option value="Hyundai Creta Manual - ₹2,500/day">Hyundai Creta Manual - ₹2,500/day</option></optgroup><optgroup label="Luxury"><option value="Toyota Fortuner Automatic - ₹6,000/day">Toyota Fortuner Automatic - ₹6,000/day</option></optgroup></select></div>
                  <div class="form-group"><label for="name">Full Name</label><input type="text" id="name" placeholder="Your full name" required minlength="2" maxlength="50"></div>
                  <div class="form-group"><label for="phone">Phone Number</label><input type="tel" id="phone" placeholder="+91 98765 43210" required inputmode="numeric"></div>
                  <div class="form-group"><label for="email">Email Address</label><input type="email" id="email" placeholder="your@email.com" required></div>
                  <div class="form-group"><label for="pickup">Pickup Date</label><input type="date" id="pickup" required></div>
                  <div class="form-group"><label for="dropoff">Drop-off Date</label><input type="date" id="dropoff" required></div>
                  <div class="form-group form-group--full"><label for="location">Pickup Location</label><select id="location" required><option value="">Select location...</option><option value="Dabolim Airport">Dabolim Airport</option><option value="Madgaon Railway Station">Madgaon Railway Station</option><option value="North Goa">North Goa</option><option value="South Goa">South Goa</option><option value="Hotel/Resort Pickup">Hotel / Resort Pickup</option></select></div>
                  <div class="form-group form-group--full"><label for="requests">Special Requests <span class="label-opt">(Optional)</span></label><textarea id="requests" placeholder="Any special requirements..." rows="3"></textarea></div>
                </div>
                <button type="submit" class="btn-submit"><i class="fab fa-whatsapp"></i> Confirm via WhatsApp</button>
              </form>
            </div>
          </div>
        </div>
      </section>

      ${renderBenefits(page.benefits)}
      ${renderHowItWorks(page.howItWorks)}
      ${renderLocations(page.locations)}

      <section class="section seo-section">
        <div class="container">
          <div class="section-masthead">
            <div class="masthead-label">SEO Content</div>
            <h2 class="masthead-title">${escapeHtml(page.introduction.heading)}</h2>
          </div>
          <div class="seo-content" data-scroll-reveal>
            ${(page.introduction.paragraphs || []).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}
          </div>
        </div>
      </section>

      ${renderSections(page.sections)}

      <section id="faq" class="section faq-section">
        <div class="container">
          <div class="section-masthead">
            <div class="masthead-label">06 — Help</div>
            <h2 class="masthead-title">Frequently Asked Questions About Renting a Self-Drive Car in Goa</h2>
          </div>
          ${renderFaqs(page.faqs)}
        </div>
      </section>

      <div class="container" style="padding-bottom:1rem;"><p style="font-size:.95rem;line-height:1.8;">Explore more: ${relatedLinks}</p></div>

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
            <p>&copy; 2025 NSZ Goa Ride Car Rentals. All rights reserved. | <a href="/privacy-policy.html">Privacy Policy</a> | <a href="/terms-and-conditions.html">Terms of Service</a></p>
          </div>
        </div>
      </footer>

      <a id="fab-whatsapp-link" href="https://wa.me/918262812997" class="fab-whatsapp" target="_blank" rel="noopener" aria-label="WhatsApp booking"><i class="fab fa-whatsapp"></i></a>
      <a href="tel:+918262812997" class="fab-phone" aria-label="Call NSZ Goa Ride"><i class="fas fa-phone"></i></a>
    `;
  }

  function applyMeta(page) {
    document.title = page.seo.title;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', page.seo.metaDescription);
    const robots = document.querySelector('meta[name="robots"]');
    if (robots) robots.setAttribute('content', page.seo.robots || 'index, follow');
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', page.seo.canonical || SITE_BASE + page.slug);
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', page.seo.ogTitle || page.seo.title);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', page.seo.ogDescription || page.seo.metaDescription);
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', page.seo.ogUrl || page.seo.canonical || SITE_BASE + page.slug);
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) twitterTitle.setAttribute('content', page.seo.ogTitle || page.seo.title);
    const twitterDesc = document.querySelector('meta[name="twitter:description"]');
    if (twitterDesc) twitterDesc.setAttribute('content', page.seo.ogDescription || page.seo.metaDescription);
  }

  function renderPageNotFound() {
    document.title = 'Page Not Found | NSZ Goa Ride';
    const root = document.getElementById('seo-page-root');
    if (!root) return;
    root.innerHTML = `
      <nav class="navbar" id="navbar"><div class="nav-inner"><a class="logo" href="/"><img src="/image/logo.png" alt="NSZ Goa Ride" loading="lazy" width="120" height="38"></a><ul class="nav-menu" id="nav-menu"><li><a href="/">Home</a></li><li><a href="/self-drive-car-rental-goa">Self Drive</a></li><li><a href="/goa-airport-car-rental">Airport</a></li><li><a href="/contact.html">Contact</a></li></ul><div class="nav-right"><a href="https://wa.me/918262812997" class="nav-cta" target="_blank" rel="noopener"><i class="fab fa-whatsapp"></i><span>Chat</span></a></div></div></nav>
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
    root.innerHTML = renderSeoMarkup(page);
    if (typeof window.initializePageInteractions === 'function') window.initializePageInteractions();
    if (typeof window.initDarkMode === 'function') window.initDarkMode();
    if (typeof window.initRouter === 'function') window.initRouter();
  }

  document.addEventListener('DOMContentLoaded', renderSeoPage);
})();

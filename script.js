// ===== Global Constants =====
const WHATSAPP_NUMBER = '918262812997';
const NAVBAR_OFFSET_MOBILE = 62;
const NAVBAR_OFFSET_DESKTOP = 70;
const BOOKING_MAP_CONFIG = Object.freeze({
    center: { lat: 15.2832, lng: 73.9862 },
    zoom: 14,
    selectedAddressZoom: 16
});
function getNavbarScrollOffset() {
    return window.innerWidth >= 1025 ? NAVBAR_OFFSET_DESKTOP : NAVBAR_OFFSET_MOBILE;
}

// ===== Global State =====
let currentSection = null;
let imagesLazyLoaded = false;
let selectedPickupAddress = null;

// ===== URL Router =====
// Maps URL path → section to show
const ROUTES = {
    '/': null,       // show all
    '/cars': 'vehicles',
    '/bikes': 'bikes',
};

/**
 * Called by navbar/button clicks.
 * Updates the URL to /cars or /bikes without a page reload,
 * then shows the right section.
 */
function navigate(section, event) {
    if (event) event.preventDefault();

    const path = section === 'vehicles' ? '/cars'
        : section === 'bikes' ? '/bikes'
            : '/';

    // Push clean URL into browser history
    history.pushState({ section }, '', path);

    // Show the section and scroll to it
    showSection(section);
}

/**
 * On back/forward browser navigation, re-apply the correct section.
 */
window.addEventListener('popstate', (e) => {
    const section = e.state?.section || resolveRouteFromPath(location.pathname);
    showSection(section);
});

/**
 * On first load, read the current URL path and show the right section.
 */
function resolveRouteFromPath(pathname) {
    return ROUTES[pathname] ?? null;
}

function initRouter() {
    const section = resolveRouteFromPath(location.pathname);
    // Replace the current history entry so popstate works correctly on first load
    history.replaceState({ section }, '', location.pathname);
    showSection(section, /* skipScroll */ true);
}

// ===== Section Visibility =====
function showSection(section, skipScroll = false) {
    currentSection = section;
    const vehiclesSection = document.getElementById('vehicles');
    const bikesSection = document.getElementById('bikes');

    if (!vehiclesSection || !bikesSection) return;

    if (section === 'vehicles') {
        vehiclesSection.style.display = 'block';
        bikesSection.style.display = 'none';
        vehiclesSection.classList.add('section-fade-in');
        if (!skipScroll) {
            setTimeout(() => {
                const top = vehiclesSection.getBoundingClientRect().top + window.scrollY - getNavbarScrollOffset();
                window.scrollTo({ top, behavior: 'smooth' });
            }, 100);
        }
    } else if (section === 'bikes') {
        vehiclesSection.style.display = 'none';
        bikesSection.style.display = 'block';
        bikesSection.classList.add('section-fade-in');
        if (!skipScroll) {
            setTimeout(() => {
                const top = bikesSection.getBoundingClientRect().top + window.scrollY - getNavbarScrollOffset();
                window.scrollTo({ top, behavior: 'smooth' });
            }, 100);
        }
    } else {
        // null → show all sections (home / default)
        vehiclesSection.style.display = 'block';
        bikesSection.style.display = 'block';
        vehiclesSection.classList.remove('section-fade-out');
        bikesSection.classList.remove('section-fade-out');
        currentSection = null;
    }

    // Close mobile menu
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenu?.classList.remove('active');
    mobileMenu?.setAttribute('aria-expanded', 'false');
    document.getElementById('nav-menu')?.classList.remove('mobile-active');
}

// ===== Lazy Loading =====
function initializeLazyLoading() {
    const lazyImages = Array.from(document.querySelectorAll('img[data-src], img[loading="lazy"]'));
    if (lazyImages.length === 0) { imagesLazyLoaded = true; return; }

    const loadImage = (img) => {
        const src = img.getAttribute('data-src');
        if (src) { img.src = src; img.removeAttribute('data-src'); }
        img.classList.add('loaded');
    };

    if ('IntersectionObserver' in window) {
        const obs = new IntersectionObserver((entries, o) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) { loadImage(entry.target); o.unobserve(entry.target); }
            });
        }, { rootMargin: '200px 0px' });
        lazyImages.forEach(img => obs.observe(img));
    } else {
        lazyImages.forEach(loadImage);
    }
    imagesLazyLoaded = true;
}

function deferNonCriticalResources() {
    if ('fonts' in document) {
        document.fonts.ready.then(() => document.body.classList.add('fonts-loaded'));
    }
}

// ===== WhatsApp Booking =====
function getVehicleDeposit(vehicleName, vehicleType) {
    if (vehicleType === 'bike' || vehicleType === 'scooter') return '₹1,000';
    if (vehicleName.includes('Maruti Ertiga') || vehicleName.includes('Toyota Innova Crysta') || vehicleName.includes('Toyota Innova Hycross')) {
        return 'Confirm with NSZ Goa Ride';
    }
    if (
        vehicleName.includes('Mercedes-Benz C300')
        || vehicleName === 'Audi'
        || vehicleName.startsWith('Audi Automatic -')
    ) return '₹50,000';
    if (vehicleName.includes('Mini Cooper')) return '₹10,000';
    return '₹3,000';
}

function bookViaWhatsApp(vehicleName, transmission, price) {
    if (!vehicleName || !price) return;
    const vehicleType = ['bike', 'scooter'].includes(String(transmission || '').toLowerCase())
        || /bike|scooter/i.test(vehicleName)
        ? 'bike'
        : 'car';
    if (vehicleType === 'car' && !transmission) return;

    const deposit = getVehicleDeposit(vehicleName, vehicleType);
    const formattedPrice = String(price).startsWith('₹') ? price : `₹${price}`;
    const message = vehicleType === 'car'
        ? `🚗 *Vehicle Booking Inquiry – NSZ Goa Ride*

Hello Team 👋, I'm interested in booking a car for exploring Goa.

🚘 *Vehicle:* ${vehicleName}
⚙️ *Transmission:* ${transmission}
💰 *Price:* ${formattedPrice}/day
🔒 *Refundable Security Deposit:* ${deposit}

Could you please help me with:

✅ Vehicle availability
✅ Booking process
✅ Pickup and drop-off locations
✅ Required documents and driving licence requirements
✅ Security deposit and refund policy

Looking forward to exploring Goa with NSZ Goa Ride! 🌴`
        : `🛵 *Vehicle Booking Inquiry – NSZ Goa Ride*

Hello Team 👋, I'm interested in booking a two-wheeler for exploring Goa.

🛵 *Vehicle:* ${vehicleName}
💰 *Price:* ${formattedPrice}/day
🔒 *Refundable Security Deposit:* ${deposit}

Could you please help me with:

✅ Two-wheeler availability
✅ Booking process
✅ Pickup and drop-off locations
✅ Required documents and driving licence requirements
✅ Security deposit payment and refund policy

Please let me know how I can confirm my booking.

Looking forward to exploring Goa with NSZ Goa Ride! 🌴`;

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
}

const GOOGLE_ADS_CONVERSION_SEND_TO = 'AW-17953205126/TCzkCKG-mZgcEIbX4PBC';

function sendGoogleAdsConversion() {
    if (typeof gtag === 'function') {
        gtag('event', 'conversion', {
            send_to: GOOGLE_ADS_CONVERSION_SEND_TO
        });
    }
}

function initializePhoneClickTracking() {
    document.querySelectorAll('a[href^="tel:"]').forEach(link => {
        link.addEventListener('click', () => {
            sendGoogleAdsConversion();
        });
    });
}

// ===== Booking Form =====
async function submitLead(payload) {
    try {
        const response = await fetch('/api/leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.warn('Lead capture failed, continuing with WhatsApp fallback.', error);
        return { ok: false };
    }
}

function setMapFeedback(message, isError = false) {
    const feedback = document.getElementById('map-feedback');
    if (!feedback) return;
    feedback.textContent = message;
    feedback.classList.toggle('is-error', isError);
}

function setPickupFeedback(message, isError = false) {
    const feedback = document.getElementById('location-feedback');
    if (!feedback) return;
    feedback.textContent = message;
    feedback.classList.toggle('is-error', isError);
    feedback.setAttribute('role', isError ? 'alert' : 'status');
}

function clearPickupAddress() {
    selectedPickupAddress = null;
    const locationInput = document.getElementById('location');
    if (locationInput) locationInput.value = '';
    document.getElementById('pickup-address-details')?.setAttribute('hidden', '');
    [
        'location-street',
        'location-sublocality',
        'location-city',
        'location-state',
        'location-postal-code',
        'location-country'
    ].forEach(id => {
        const field = document.getElementById(id);
        if (field) field.value = '';
    });
}

function loadGoogleMapsApi(apiKey) {
    if (window.google?.maps?.importLibrary) return Promise.resolve();

    return new Promise((resolve, reject) => {
        const callbackName = '__nszGoogleMapsLoaded';
        const script = document.createElement('script');
        let timeoutId;
        const finish = (error) => {
            window.clearTimeout(timeoutId);
            delete window[callbackName];
            if (error) reject(error);
            else resolve();
        };

        window[callbackName] = () => finish();
        timeoutId = window.setTimeout(
            () => finish(new Error('Google Maps API loading timed out.')),
            20000
        );
        script.async = true;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&v=weekly&loading=async&callback=${callbackName}`;
        script.onerror = () => finish(new Error('Google Maps API could not be loaded.'));
        document.head.appendChild(script);
    });
}

function initializeBookingMap() {
    const mapElement = document.getElementById('booking-map');
    const autocompleteContainer = document.getElementById('location-autocomplete');
    if (!mapElement || !autocompleteContainer) return;

    const apiKey = document.querySelector('meta[name="google-maps-api-key"]')?.content.trim();
    const mapId = document.querySelector('meta[name="google-maps-map-id"]')?.content.trim();
    if (!apiKey || !mapId) {
        const missing = [
            !apiKey && 'a browser-restricted Maps JavaScript API key',
            !mapId && 'a Google Maps map ID'
        ].filter(Boolean).join(' and ');
        const message = `Map and address search are unavailable until ${missing} is configured on this page.`;
        setMapFeedback(message, true);
        setPickupFeedback(message, true);
        return;
    }

    window.gm_authFailure = () => {
        const message = 'Google Maps authorization failed. Check the API key restrictions, enabled APIs, and billing configuration.';
        setMapFeedback(message, true);
        setPickupFeedback(message, true);
    };

    loadGoogleMapsApi(apiKey)
        .then(async () => {
            const [mapsLibrary, placesLibrary, markerLibrary] = await Promise.all([
                google.maps.importLibrary('maps'),
                google.maps.importLibrary('places'),
                google.maps.importLibrary('marker')
            ]);
            const map = new mapsLibrary.Map(mapElement, {
                center: BOOKING_MAP_CONFIG.center,
                zoom: BOOKING_MAP_CONFIG.zoom,
                mapId,
                fullscreenControl: true,
                zoomControl: true,
                streetViewControl: true
            });
            let marker = null;
            let tilesLoaded = false;
            const tileTimeout = window.setTimeout(() => {
                if (!tilesLoaded) {
                    setMapFeedback('Map tiles did not load. Check Maps JavaScript API enablement, billing, and network access.', true);
                }
            }, 15000);
            map.addListener('tilesloaded', () => {
                tilesLoaded = true;
                window.clearTimeout(tileTimeout);
                setMapFeedback('Map ready. Search for a pickup address in India and select a suggestion.');
            });

            const placeAutocomplete = new placesLibrary.PlaceAutocompleteElement();
            placeAutocomplete.includedRegionCodes = ['in'];
            placeAutocomplete.placeholder = 'Search an address in India…';
            placeAutocomplete.setAttribute('aria-label', 'Pickup address');
            autocompleteContainer.appendChild(placeAutocomplete);

            let selectionVersion = 0;
            placeAutocomplete.addEventListener('input', () => {
                selectionVersion += 1;
                clearPickupAddress();
                if (marker) {
                    marker.map = null;
                    marker = null;
                }
                setPickupFeedback('Select an address from the suggestions to confirm the pickup point.');
            });

            placeAutocomplete.addEventListener('gmp-select', async ({ placePrediction }) => {
                const currentVersion = ++selectionVersion;
                clearPickupAddress();
                if (marker) {
                    marker.map = null;
                    marker = null;
                }
                setPickupFeedback('Checking the selected address…');
                try {
                    const place = placePrediction.toPlace();
                    await place.fetchFields({
                        fields: ['addressComponents', 'formattedAddress', 'location']
                    });
                    if (currentVersion !== selectionVersion) return;

                    const components = place.addressComponents || [];
                    const component = (type, shortText = false) => {
                        const found = components.find(item => item.types?.includes(type));
                        return found ? (shortText ? found.shortText : found.longText) || found.shortText || '' : '';
                    };
                    const country = component('country');
                    const countryCode = component('country', true).toUpperCase();
                    const city = component('locality') || component('postal_town');
                    const state = component('administrative_area_level_1');
                    if (!place.location || !place.formattedAddress || !country
                        || (countryCode !== 'IN' && country.toLowerCase() !== 'india')
                        || (!city && !state)) {
                        setPickupFeedback(
                            'That suggestion does not include a complete Indian pickup address. Choose a more specific address from the suggestions.',
                            true
                        );
                        return;
                    }

                    const streetAddress = [
                        component('street_number'),
                        component('route')
                    ].filter(Boolean).join(' ');
                    const sublocality = component('neighborhood')
                        || component('sublocality_level_1')
                        || component('sublocality_level_2')
                        || component('sublocality');
                    selectedPickupAddress = {
                        formattedAddress: place.formattedAddress,
                        streetAddress,
                        sublocality,
                        city,
                        state,
                        postalCode: component('postal_code'),
                        country
                    };

                    const locationInput = document.getElementById('location');
                    if (locationInput) locationInput.value = place.formattedAddress;
                    const addressFields = {
                        'location-street': streetAddress,
                        'location-sublocality': sublocality,
                        'location-city': city,
                        'location-state': state,
                        'location-postal-code': selectedPickupAddress.postalCode,
                        'location-country': country
                    };
                    Object.entries(addressFields).forEach(([id, value]) => {
                        const field = document.getElementById(id);
                        if (field) field.value = value;
                    });
                    document.getElementById('pickup-address-details')?.removeAttribute('hidden');

                    const position = {
                        lat: place.location.lat(),
                        lng: place.location.lng()
                    };
                    if (!marker) {
                        marker = new markerLibrary.AdvancedMarkerElement({
                            map,
                            position,
                            title: place.formattedAddress
                        });
                    } else {
                        marker.position = position;
                        marker.map = map;
                        marker.title = place.formattedAddress;
                    }
                    map.setCenter(position);
                    map.setZoom(BOOKING_MAP_CONFIG.selectedAddressZoom);

                    const missingDetails = [
                        !city && 'city/locality',
                        !state && 'state',
                        !selectedPickupAddress.postalCode && 'postal code'
                    ].filter(Boolean);
                    setPickupFeedback(missingDetails.length
                        ? `Address selected. Google did not provide ${missingDetails.join(', ')}; please verify the pickup details.`
                        : 'Pickup address selected. You can edit the search to choose a different address.');
                } catch (error) {
                    console.error('Unable to retrieve the selected pickup address.', error);
                    setPickupFeedback('Google could not verify that address. Please select another suggestion or try again.', true);
                }
            });
        })
        .catch(error => {
            console.error('Google Maps failed to initialize.', error);
            const message = 'Google Maps could not be loaded. Check the API key, enabled APIs, billing, and network access.';
            setMapFeedback(message, true);
            setPickupFeedback(message, true);
        });
}

function submitBooking() {
    const vehicle = document.getElementById('vehicle')?.value || '';
    const name = document.getElementById('name')?.value || '';
    const phone = document.getElementById('phone')?.value || '';
    const email = document.getElementById('email')?.value || '';
    const pickup = document.getElementById('pickup')?.value || '';
    const dropoff = document.getElementById('dropoff')?.value || '';
    const location = document.getElementById('location')?.value || '';
    const requests = document.getElementById('requests')?.value || '';

    const errors = [];
    if (!name || name.length < 2) errors.push('Name must be at least 2 characters');
    if (!phone) errors.push('Phone number is required');
    if (!email || !email.includes('@')) errors.push('Valid email is required');
    if (!vehicle) errors.push('Please select a vehicle');
    if (!pickup) errors.push('Pickup date is required');
    if (!dropoff) errors.push('Drop-off date is required');
    if (!selectedPickupAddress || !location) errors.push('Select a valid pickup address from the Google suggestions');
    if (pickup && dropoff && dropoff <= pickup) errors.push('Drop-off date must be after the pickup date');

    const messagesDiv = document.getElementById('booking-messages');
    if (errors.length > 0) {
        if (messagesDiv) {
            messagesDiv.innerHTML = `
                <div style="background:#fed7d7;color:#c53030;padding:1rem;border-radius:10px;border-left:4px solid #e53e3e;">
                    <strong><i class="fas fa-exclamation-circle"></i> Please fix these errors:</strong>
                    <ul style="margin:.5rem 0 0 1rem;">${errors.map(e => `<li>${e}</li>`).join('')}</ul>
                </div>`;
            messagesDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
    }

    const days = Math.ceil((new Date(dropoff) - new Date(pickup)) / 86400000);
    const fmt = d => { const dt = new Date(d); return `${String(dt.getDate()).padStart(2, '0')}-${String(dt.getMonth() + 1).padStart(2, '0')}-${dt.getFullYear()}`; };

    const message = `🚗 *BOOKING REQUEST - NSZ Goa Ride*

*Customer Details:*
• Name: ${name}
• Phone: ${phone}
• Email: ${email}

*Rental Details:*
• Vehicle: ${vehicle}
• Pickup Date: ${fmt(pickup)}
• Drop-off Date: ${fmt(dropoff)}
• Duration: ${days} day${days > 1 ? 's' : ''}
• Pickup Location: ${location}
• City / Locality: ${selectedPickupAddress.city || 'Not provided'}
• State: ${selectedPickupAddress.state || 'Not provided'}
• Postal Code: ${selectedPickupAddress.postalCode || 'Not provided'}
• Country: ${selectedPickupAddress.country || 'Not provided'}
• Refundable Deposit: ${getVehicleDeposit(vehicle)}

${requests ? `*Special Requests:* ${requests}` : ''}

Please confirm availability and total cost. Thank you!`;

    const bookingReference = `NSZ-${Date.now().toString().slice(-6)}`;
    const leadPayload = {
        name,
        phone,
        email,
        vehicle,
        pickup,
        dropoff,
        location,
        pickupAddress: selectedPickupAddress,
        requests,
        source: 'booking-form',
        bookingReference
    };

    if (messagesDiv) {
        messagesDiv.innerHTML = `<div style="background:#c6f6d5;color:#22543d;padding:1rem;border-radius:10px;border-left:4px solid #38a169;"><i class="fas fa-check-circle"></i> Saving your request and redirecting to WhatsApp...</div>`;
    }

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    const whatsappWindow = window.open(whatsappUrl, '_blank');

    submitLead(leadPayload).finally(() => {
        setTimeout(() => {
            document.getElementById('booking-form')?.reset();
            if (messagesDiv) messagesDiv.innerHTML = '';
            if (!whatsappWindow) window.location.href = whatsappUrl;
            else window.location.href = `/thank-you/?ref=${encodeURIComponent(bookingReference)}`;
        }, 500);
    });
}

// ===== Dark Mode =====
function initDarkMode() {
    const saved = localStorage.getItem('darkMode');
    if (saved === 'true' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.body.classList.add('dark-mode');
        updateDarkModeIcon(true);
    }
}

function updateDarkModeIcon(isDark) {
    const icon = document.querySelector('#dark-mode-toggle i');
    if (!icon) return;
    icon.classList.toggle('fa-moon', !isDark);
    icon.classList.toggle('fa-sun', isDark);
}

// ===== WhatsApp Links =====
function initializeWhatsAppLinks() {
    const msg = encodeURIComponent("Hi! I'm interested in renting a car for my Goa trip.");
    const base = `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
    document.getElementById('nav-whatsapp-link')?.setAttribute('href', base);
    document.getElementById('hero-whatsapp-btn')?.setAttribute('href', base);
    document.getElementById('whatsapp-booking-btn')?.setAttribute('href', base);
    document.getElementById('fab-whatsapp-link')?.setAttribute('href', base);
    document.getElementById('footer-whatsapp-link')?.setAttribute('href', `https://wa.me/${WHATSAPP_NUMBER}`);
}

// ===== DOMContentLoaded =====
document.addEventListener('DOMContentLoaded', () => {
    // SEO pages render their interactive markup in a separate DOMContentLoaded listener.
    setTimeout(() => {
    deferNonCriticalResources();
    initializeLazyLoading();
    initDarkMode();
    initializeWhatsAppLinks();
    initializePhoneClickTracking();

    // Run router — reads current URL path on load
    initRouter();

    // Dark mode toggle
    document.getElementById('dark-mode-toggle')?.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDark);
        updateDarkModeIcon(isDark);
    });

    // Mobile menu toggle
    const mobileMenu = document.getElementById('mobile-menu');
    const navMenu = document.getElementById('nav-menu');
    if (mobileMenu && navMenu) {
        mobileMenu.addEventListener('click', () => {
            const isExpanded = mobileMenu.classList.toggle('active');
            navMenu.classList.toggle('mobile-active', isExpanded);
            mobileMenu.setAttribute('aria-expanded', String(isExpanded));
        });
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                navMenu.classList.remove('mobile-active');
                mobileMenu.setAttribute('aria-expanded', 'false');
                navMenu.querySelectorAll('.nav-dropdown').forEach(dropdown => {
                    dropdown.classList.remove('dropdown-open');
                    dropdown.querySelector('.nav-dropdown-toggle')?.setAttribute('aria-expanded', 'false');
                });
            }, 0);
        });
    }

    document.querySelectorAll('.nav-dropdown-toggle').forEach(toggle => {
        toggle.addEventListener('click', () => {
            const dropdown = toggle.closest('.nav-dropdown');
            if (!dropdown) return;
            const isExpanded = dropdown.classList.toggle('dropdown-open');
            toggle.setAttribute('aria-expanded', String(isExpanded));
        });
    });

    document.addEventListener('click', event => {
        if (event.target instanceof Element && event.target.closest('.nav-dropdown')) return;
        document.querySelectorAll('.nav-dropdown.dropdown-open').forEach(dropdown => {
            dropdown.classList.remove('dropdown-open');
            dropdown.querySelector('.nav-dropdown-toggle')?.setAttribute('aria-expanded', 'false');
        });
    });

    document.addEventListener('keydown', event => {
        if (event.key !== 'Escape') return;
        document.querySelectorAll('.nav-dropdown.dropdown-open').forEach(dropdown => {
            dropdown.classList.remove('dropdown-open');
            dropdown.querySelector('.nav-dropdown-toggle')?.setAttribute('aria-expanded', 'false');
        });
    });

    // Booking form
    initializeBookingMap();
    document.getElementById('booking-form')?.addEventListener('submit', e => {
        e.preventDefault();
        submitBooking();
    });

    // Phone formatting
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            let v = e.target.value.replace(/\D/g, '').substring(0, 13);
            if (v.length === 10 && /^[6789]/.test(v)) v = '91' + v;
            if (v.length > 0) {
                v = v.startsWith('91')
                    ? '+91 ' + v.substring(2, 7) + ' ' + v.substring(7)
                    : '+' + v.substring(0, 3) + ' ' + v.substring(3);
            }
            e.target.value = v.trim();
        });
        phoneInput.addEventListener('blur', (e) => {
            const clean = e.target.value.replace(/\D/g, '');
            const valid = clean.length === 12 && clean.startsWith('91');
            e.target.style.borderColor = (clean.length > 0 && !valid) ? '#e53e3e' : '';
            e.target.style.boxShadow = (clean.length > 0 && !valid) ? '0 0 0 3px rgba(229,62,62,.1)' : '';
        });
    }

    // Date validation
    const pickupInput = document.getElementById('pickup');
    const dropoffInput = document.getElementById('dropoff');
    if (pickupInput && dropoffInput) {
        const today = new Date().toISOString().split('T')[0];
        pickupInput.min = dropoffInput.min = today;
        pickupInput.addEventListener('change', () => {
            dropoffInput.min = pickupInput.value;
            if (dropoffInput.value && dropoffInput.value <= pickupInput.value) dropoffInput.value = '';
        });
        [pickupInput, dropoffInput].forEach(inp => {
            inp.addEventListener('change', () => {
                const bad = pickupInput.value && dropoffInput.value && dropoffInput.value <= pickupInput.value;
                dropoffInput.style.borderColor = bad ? '#e53e3e' : '';
            });
        });
    }

    // Smooth scroll for plain anchor links (non-routed)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && document.querySelector(href)) {
                e.preventDefault();
                const top = document.querySelector(href).getBoundingClientRect().top + window.scrollY - getNavbarScrollOffset();
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // Vehicle list filter & sort
    const vehicleFilter = document.getElementById('vehicle-filter');
    const vehicleSort = document.getElementById('vehicle-sort');
    const vehicleCards = Array.from(document.querySelectorAll('.vehicle-card'));
    const applyVehicleControls = () => {
        if (!vehicleFilter || !vehicleSort || vehicleCards.length === 0) return;
        const filterValue = vehicleFilter.value;
        const sortValue = vehicleSort.value;
        const visibleCards = vehicleCards.filter(card => {
            const category = card.getAttribute('data-category') || 'budget';
            return filterValue === 'all' || category === filterValue;
        });
        const sortedCards = [...visibleCards].sort((a, b) => {
            const priceA = parseInt(a.getAttribute('data-price') || '0', 10);
            const priceB = parseInt(b.getAttribute('data-price') || '0', 10);
            if (sortValue === 'price-desc') return priceB - priceA;
            if (sortValue === 'name') return a.querySelector('.vehicle-name')?.textContent.localeCompare(b.querySelector('.vehicle-name')?.textContent || '') || 0;
            return priceA - priceB;
        });
        vehicleCards.forEach(card => card.style.display = 'none');
        sortedCards.forEach(card => card.style.display = 'block');
    };
    vehicleFilter?.addEventListener('change', applyVehicleControls);
    vehicleSort?.addEventListener('change', applyVehicleControls);
    applyVehicleControls();

    // Trip calculator
    const calculatorVehicle = document.getElementById('calculator-vehicle');
    const calculatorDays = document.getElementById('calculator-days');
    const calculatorOutput = document.getElementById('calculator-output');
    const updateCalculator = () => {
        if (!calculatorVehicle || !calculatorDays || !calculatorOutput) return;
        const rate = parseInt(calculatorVehicle.value, 10) || 1200;
        const days = Math.max(1, parseInt(calculatorDays.value, 10) || 1);
        calculatorOutput.textContent = `Estimated total: ₹${(rate * days).toLocaleString('en-IN')}`;
    };
    calculatorVehicle?.addEventListener('change', updateCalculator);
    calculatorDays?.addEventListener('input', updateCalculator);
    updateCalculator();

    // Scroll reveal
    const revealObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                revealObs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('[data-scroll-reveal]').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity .6s ease, transform .6s ease';
        revealObs.observe(el);
    });

    // Navbar scroll shadow
    window.addEventListener('scroll', () => {
        const navbar = document.getElementById('navbar');
        if (navbar) navbar.style.boxShadow = window.scrollY > 100 ? '0 2px 10px rgba(0,0,0,0.1)' : 'none';
    });

    console.log('NSZ Goa Ride website loaded successfully! ✅');
    }, 0);
});

// ===== Skeleton Loader =====
function hideSkeletonLoader() {
    document.getElementById('skeleton-loader')?.classList.add('hidden');
}
window.addEventListener('load', hideSkeletonLoader);
setTimeout(hideSkeletonLoader, 2500);

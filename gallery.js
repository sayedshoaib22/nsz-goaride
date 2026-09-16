const galleryPhotoNames = Array.from({ length: 129 }, (_, index) => index)
    .filter((index) => index !== 116)
    .map((index) => `IMG-20260901-WA${String(index).padStart(4, '0')}.jpg`);

const bikePhotoNames = ['bike1.jpeg', 'bike2.avif', 'bike3.avif', 'bike4.png', 'bike5.webp', 'bike6.webp'];

const carGalleryData = galleryPhotoNames.map((filename, index) => {
    const photoNumber = String(index + 1).padStart(3, '0');
    return {
        id: index + 1,
        category: 'cars',
        title: `NSZ Goa Ride car photo ${photoNumber}`,
        src: `assets/images/gallery/${filename}`,
        thumb: `assets/images/gallery/${filename}`,
        alt: `NSZ Goa Ride car rental photo in Madgaon Goa, photo ${photoNumber}`,
        tag: 'Cars & SUVs'
    };
});

const bikeGalleryData = bikePhotoNames.map((filename, index) => ({
    id: carGalleryData.length + index + 1,
    category: 'bikes',
    title: `NSZ Goa Ride bike and scooter photo ${index + 1}`,
    src: `assets/images/gallery/${filename}`,
    thumb: `assets/images/gallery/${filename}`,
    alt: `NSZ Goa Ride bike and scooter rental photo in Madgaon Goa, photo ${index + 1}`,
    tag: 'Bikes & Scooters'
}));

const fleetGalleryData = [...carGalleryData, ...bikeGalleryData];
const galleryState = { filter: 'all', visible: 20, items: [], activeIndex: 0 };
const grid = document.getElementById('gallery-grid');
const status = document.getElementById('gallery-status');
const empty = document.getElementById('gallery-empty');
const loadMore = document.getElementById('gallery-load-more');
const lightbox = document.getElementById('gallery-lightbox');
const lightboxImage = document.getElementById('lightbox-image');
const lightboxTitle = document.getElementById('lightbox-title');
const lightboxTag = document.getElementById('lightbox-tag');
const lightboxBook = document.getElementById('lightbox-book');

function getFilteredItems() {
    return galleryState.filter === 'all'
        ? fleetGalleryData
        : fleetGalleryData.filter((item) => item.category === galleryState.filter);
}

function renderGallery() {
    galleryState.items = getFilteredItems();
    const visibleItems = galleryState.items.slice(0, galleryState.visible);
    grid.innerHTML = '';
    visibleItems.forEach((item, index) => {
        const card = document.createElement('article');
        card.className = 'gallery-card';
        card.dataset.id = item.id;
        card.style.setProperty('--card-index', index);
        card.innerHTML = `<button class="gallery-card__button" type="button" aria-label="Open ${item.title}">
            <span class="gallery-card__image-wrap"><img src="${item.thumb}" data-full-src="${item.src}" alt="${item.alt}" loading="lazy" decoding="async"><span class="gallery-card__zoom" aria-hidden="true">&#8599;</span></span>
            <span class="gallery-card__copy"><strong>${item.title}</strong><small>${item.tag}</small></span>
        </button>`;
        const image = card.querySelector('img');
        image.addEventListener('error', () => {
            card.remove();
            updateStatus();
        }, { once: true });
        card.querySelector('button').addEventListener('click', () => openLightbox(item));
        grid.appendChild(card);
    });
    updateStatus();
}

function updateStatus() {
    const shown = grid.querySelectorAll('.gallery-card').length;
    const total = galleryState.items.length;
    status.textContent = `${shown} of ${total} gallery slots shown`;
    empty.hidden = shown > 0;
    loadMore.hidden = galleryState.visible >= total;
}

function setFilter(filter) {
    galleryState.filter = filter;
    galleryState.visible = 20;
    document.querySelectorAll('.gallery-filter__button').forEach((button) => {
        button.classList.toggle('is-active', button.dataset.filter === filter);
    });
    renderGallery();
}

function openLightbox(item) {
    const available = galleryState.items.filter((candidate) => document.querySelector(`[data-id="${candidate.id}"]`));
    galleryState.items = available.length ? available : galleryState.items;
    galleryState.activeIndex = Math.max(0, galleryState.items.findIndex((candidate) => candidate.id === item.id));
    updateLightbox();
    lightbox.hidden = false;
    document.body.classList.add('lightbox-open');
    document.querySelector('.gallery-lightbox__close').focus();
}

function updateLightbox() {
    const item = galleryState.items[galleryState.activeIndex];
    if (!item) return;
    lightboxImage.src = item.src;
    lightboxImage.alt = item.alt;
    lightboxTitle.textContent = item.title;
    lightboxTag.textContent = item.tag;
    lightboxBook.href = `https://wa.me/918262812997?text=${encodeURIComponent(`Hi NSZ Goa Ride, I saw this vehicle in your gallery and want to check availability: ${item.title}.`)}`;
}

function closeLightbox() {
    lightbox.hidden = true;
    document.body.classList.remove('lightbox-open');
}

function moveLightbox(direction) {
    if (!galleryState.items.length) return;
    galleryState.activeIndex = (galleryState.activeIndex + direction + galleryState.items.length) % galleryState.items.length;
    updateLightbox();
}

document.querySelectorAll('.gallery-filter__button').forEach((button) => {
    button.addEventListener('click', () => setFilter(button.dataset.filter));
});
loadMore.addEventListener('click', () => {
    galleryState.visible += 20;
    renderGallery();
});
document.querySelectorAll('[data-lightbox-close]').forEach((element) => element.addEventListener('click', closeLightbox));
document.getElementById('lightbox-previous').addEventListener('click', () => moveLightbox(-1));
document.getElementById('lightbox-next').addEventListener('click', () => moveLightbox(1));
document.addEventListener('keydown', (event) => {
    if (lightbox.hidden) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') moveLightbox(-1);
    if (event.key === 'ArrowRight') moveLightbox(1);
});

let touchStartX = 0;
lightbox.addEventListener('touchstart', (event) => { touchStartX = event.changedTouches[0].screenX; }, { passive: true });
lightbox.addEventListener('touchend', (event) => {
    const distance = event.changedTouches[0].screenX - touchStartX;
    if (Math.abs(distance) > 45) moveLightbox(distance > 0 ? -1 : 1);
}, { passive: true });

renderGallery();

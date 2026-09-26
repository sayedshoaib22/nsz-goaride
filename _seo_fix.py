from pathlib import Path
import json
import re

root = Path(r"c:\xampp\nsz-goaride")
ignore = {"naver43756a38e66ca409b20ced3963689004.html", "yandex_51fd73c55b9266b3.html"}

BASE = "https://nszgoaride.com"
SITE_NAME = "NSZ Goa Ride"
LOGO = "https://nszgoaride.com/image/logo.png"
PHONE = "+91 8262812997"
EMAIL = "info@goaride.com"

TITLE_MAP = {
    "index.html": "Self Drive Cars in Goa from ₹1200/day | NSZ Goa Ride",
    "404/index.html": "404 Page Not Found | NSZ Goa Ride",
    "cars/index.html": "Self Drive Cars in Goa | NSZ Goa Ride",
    "bikes/index.html": "Bike Rental in Goa | NSZ Goa Ride",
    "contact/index.html": "Contact NSZ Goa Ride | Car Rental Enquiry in Goa",
    "gallery/index.html": "Fleet Gallery | Self Drive Cars & Bikes in Goa | NSZ Goa Ride",
    "privacy-policy/index.html": "Privacy Policy | NSZ Goa Ride",
    "terms-and-conditions/index.html": "Terms & Conditions | NSZ Goa Ride",
    "thank-you/index.html": "Booking Confirmed | NSZ Goa Ride",
    "car-rental-goa/index.html": "Car Rental in Goa | NSZ Goa Ride",
    "self-drive-car-goa/index.html": "Self Drive Car Goa | NSZ Goa Ride",
    "goa-airport-taxi/index.html": "Goa Airport Taxi | NSZ Goa Ride",
    "bike-rental-goa/index.html": "Bike Rental in Goa | NSZ Goa Ride",
    "luxury-car-rental-goa/index.html": "Luxury Car Rental Goa | NSZ Goa Ride",
    "automatic-car-rental-goa/index.html": "Automatic Car Rental in Goa | NSZ Goa Ride",
    "cheap-car-rental-goa/index.html": "Cheap Car Rental in Goa | NSZ Goa Ride",
    "7-seater-car-rental-goa/index.html": "7 Seater Car Rental in Goa | NSZ Goa Ride",
    "best-self-drive-cars-goa/index.html": "Best Self Drive Cars in Goa | NSZ Goa Ride",
    "goa-airport-car-rental/index.html": "Goa Airport Car Rental | NSZ Goa Ride",
    "mopa-airport-car-rental/index.html": "Mopa Airport Car Rental | NSZ Goa Ride",
    "dabolim-airport-car-rental/index.html": "Dabolim Airport Car Rental | NSZ Goa Ride",
    "north-goa-car-rental/index.html": "Car Rental in North Goa | NSZ Goa Ride",
    "south-goa-car-rental/index.html": "Car Rental in South Goa | NSZ Goa Ride",
    "calangute-car-rental/index.html": "Car Rental in Calangute | NSZ Goa Ride",
    "baga-car-rental/index.html": "Car Rental in Baga Goa | NSZ Goa Ride",
    "candolim-car-rental/index.html": "Car Rental in Candolim | NSZ Goa Ride",
    "panjim-car-rental/index.html": "Car Rental in Panjim | NSZ Goa Ride",
    "madgaon-car-rental/index.html": "Car Rental in Madgaon | NSZ Goa Ride",
    "palolem-car-rental/index.html": "Car Rental in Palolem | NSZ Goa Ride",
    "self-drive-car-rental-goa/index.html": "Self Drive Car Rental in Goa | NSZ Goa Ride",
    "car-rental-madgaon-railway-station/index.html": "Self-Drive Car & Bike Rental at Madgaon Railway Station | NSZ Goa Ride",
}

DESC_MAP = {
    "index.html": "Rent self-drive cars in Goa with doorstep delivery at Dabolim, Mopa Airport and Madgaon. Zero hidden fees, automatic and manual fleet. Book now!",
    "404/index.html": "The page you are looking for is not available. Browse NSZ Goa Ride for car rentals, bike rentals, and airport travel in Goa.",
    "cars/index.html": "Explore self-drive cars in Goa with airport pickup, flexible daily rentals, and reliable local support for beach trips and sightseeing.",
    "bikes/index.html": "Rent bikes and scooters in Goa for beach hopping, airport travel, and easy local sightseeing across North and South Goa.",
    "contact/index.html": "Contact NSZ Goa Ride for car rental bookings in Goa. Call +91 8262812997, WhatsApp us, or email info@goaride.com for quick pickup support.",
    "gallery/index.html": "Explore photos of our clean self-drive car and bike rental fleet in Madgaon, Goa. View available vehicles ready for rental.",
    "privacy-policy/index.html": "Read the privacy policy for NSZ Goa Ride car rental and bike rental services in Goa. Learn how booking details and customer data are handled.",
    "terms-and-conditions/index.html": "Read the rental terms and conditions for NSZ Goa Ride car rental and bike rental services in Goa before booking your vehicle.",
    "thank-you/index.html": "Thank you for your booking request with NSZ Goa Ride. We will confirm your car rental, bike rental, or airport transfer details shortly.",
    "car-rental-goa/index.html": "Self-drive car rental in Goa with direct WhatsApp booking and flexible pickup options for airport arrivals, beaches, and local travel.",
    "self-drive-car-goa/index.html": "Self-drive cars in Goa, booked directly with a local team for beach travel, city driving, and airport pick-up convenience.",
    "goa-airport-taxi/index.html": "Arrange your airport pickup and local transfer support in Goa directly with NSZ Goa Ride.",
    "bike-rental-goa/index.html": "Bike and scooter rental in Goa with local support for beach trips, sightseeing, and flexible daily bookings.",
    "luxury-car-rental-goa/index.html": "Luxury car rental in Goa for memorable stays, premium travel, and special occasions with direct booking support.",
    "automatic-car-rental-goa/index.html": "Book an automatic car rental in Goa for comfortable city driving, beach trips, and easier airport travel.",
    "cheap-car-rental-goa/index.html": "Find affordable car rental options in Goa with flexible pickup and clear pricing from NSZ Goa Ride.",
    "7-seater-car-rental-goa/index.html": "Book a 7 seater car rental in Goa for family travel, luggage space, and comfortable trips across the state.",
    "best-self-drive-cars-goa/index.html": "Compare the best self drive cars in Goa from NSZ Goa Ride, including compact, family, and automatic options.",
    "goa-airport-car-rental/index.html": "Book a Goa Airport car rental with NSZ Goa Ride for convenient pickup, airport arrivals, and flexible local travel.",
    "mopa-airport-car-rental/index.html": "Rent a car near Mopa Airport in Goa with NSZ Goa Ride for convenient airport arrivals and local sightseeing.",
    "dabolim-airport-car-rental/index.html": "Book a Dabolim Airport car rental in Goa with NSZ Goa Ride for flexible pickup and easy onward travel.",
    "north-goa-car-rental/index.html": "Book a car rental in North Goa for Calangute, Baga, Candolim, Anjuna, and Vagator with flexible pickup and clear pricing.",
    "south-goa-car-rental/index.html": "Rent a car in South Goa for Palolem, Colva, Madgaon, and nearby areas with easy pickup and transparent pricing.",
    "calangute-car-rental/index.html": "Book a car rental in Calangute for beach travel, North Goa trips, and airport transfers with flexible pickup and simple pricing.",
    "baga-car-rental/index.html": "Book a car rental in Baga Goa for easy beach travel, local sightseeing, and flexible North Goa pickup options.",
    "candolim-car-rental/index.html": "Book a car rental in Candolim for North Goa beach trips, family travel, and flexible airport pickup with transparent pricing.",
    "panjim-car-rental/index.html": "Book a car rental in Panjim with NSZ Goa Ride for city travel, beach access, and easy movement across Goa.",
    "madgaon-car-rental/index.html": "Book a car rental in Madgaon for railway station access, South Goa travel, and smooth onward travel across Goa.",
    "palolem-car-rental/index.html": "Book a car rental in Palolem for scenic South Goa travel and hassle-free beach-side trips across the region.",
    "self-drive-car-rental-goa/index.html": "Book self drive cars in Goa with NSZ Goa Ride. Explore Goa at your own pace with reliable rentals, airport pickup, and flexible booking options.",
    "car-rental-madgaon-railway-station/index.html": "Step off your train and rent a clean self-drive car or bike near Madgaon Railway Station with quick pickup and flexible South Goa travel support.",
}


def slug_from_rel(rel: str) -> str:
    if rel == "index.html":
        return ""
    if rel.endswith("/index.html"):
        rel = rel[:-len("/index.html")]
    elif rel.endswith(".html"):
        rel = rel[:-len(".html")]
    return rel


def canonical_for(rel: str) -> str:
    slug = slug_from_rel(rel)
    if rel == "404/index.html":
        return BASE + "/404/"
    if not slug:
        return BASE + "/"
    return BASE + "/" + slug + "/"


def build_title(rel: str) -> str:
    if rel in TITLE_MAP:
        return TITLE_MAP[rel]
    slug = slug_from_rel(rel)
    if slug:
        label = slug.replace("-", " ").title()
        return f"{label} | NSZ Goa Ride"
    return "NSZ Goa Ride"


def build_description(rel: str) -> str:
    if rel in DESC_MAP:
        return DESC_MAP[rel]
    return "Self-drive car and bike rental service in Goa with airport pickup and flexible local support."


def strip_existing_seo(raw: str) -> str:
    patterns = [
        r'(?is)\s*<title>.*?</title>\s*',
        r'(?is)\s*<meta\s+name=["\']description["\'][^>]*>\s*',
        r'(?is)\s*<meta\s+name=["\']robots["\'][^>]*>\s*',
        r'(?is)\s*<link\s+rel=["\']canonical["\'][^>]*>\s*',
        r'(?is)\s*<meta\s+property=["\']og:title["\'][^>]*>\s*',
        r'(?is)\s*<meta\s+property=["\']og:description["\'][^>]*>\s*',
        r'(?is)\s*<meta\s+property=["\']og:url["\'][^>]*>\s*',
        r'(?is)\s*<meta\s+property=["\']og:type["\'][^>]*>\s*',
        r'(?is)\s*<meta\s+property=["\']og:image["\'][^>]*>\s*',
        r'(?is)\s*<meta\s+property=["\']og:site_name["\'][^>]*>\s*',
        r'(?is)\s*<meta\s+name=["\']twitter:card["\'][^>]*>\s*',
        r'(?is)\s*<meta\s+name=["\']twitter:title["\'][^>]*>\s*',
        r'(?is)\s*<meta\s+name=["\']twitter:description["\'][^>]*>\s*',
        r'(?is)\s*<meta\s+name=["\']twitter:image["\'][^>]*>\s*',
        r'(?is)\s*<script\s+type=["\']application/ld\+json["\'][^>]*>.*?</script>\s*',
    ]
    for pattern in patterns:
        raw = re.sub(pattern, "", raw)
    return raw


def build_schema(rel: str, title: str, desc: str, canonical: str):
    page = rel
    if page == "index.html":
        return {
            "@context": "https://schema.org",
            "@graph": [
                {"@type": "WebSite", "@id": BASE + "/#website", "url": BASE + "/", "name": SITE_NAME, "description": desc, "potentialAction": {"@type": "SearchAction", "target": BASE + "/?s={search_term_string}", "query-input": "required name=search_term_string"}},
                {"@type": "LocalBusiness", "@id": BASE + "/#business", "name": SITE_NAME, "url": BASE + "/", "logo": LOGO, "telephone": PHONE, "email": EMAIL, "address": {"@type": "PostalAddress", "streetAddress": "Sanscar Society, Madgaon", "addressLocality": "Madgaon", "addressRegion": "Goa", "postalCode": "403601", "addressCountry": "IN"}, "priceRange": "₹1,200 - ₹20,000", "description": desc, "areaServed": ["Goa", "North Goa", "South Goa", "Dabolim Airport", "Mopa Airport", "Madgaon"], "sameAs": ["https://www.instagram.com/goaride", "https://www.facebook.com/goaride"]},
                {"@type": "WebPage", "@id": BASE + "/#webpage", "url": BASE + "/", "name": title, "isPartOf": {"@id": BASE + "/#website"}, "about": {"@id": BASE + "/#business"}, "breadcrumb": {"@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": BASE + "/"}]}},
                {"@type": "FAQPage", "@id": BASE + "/#faq", "mainEntity": [{"@type": "Question", "name": "What is the cheapest car rental option near Dabolim Airport?", "acceptedAnswer": {"@type": "Answer", "text": "Our Maruti Ignis and Swift models are the most affordable options starting at ₹1,200 per day."}}, {"@type": "Question", "name": "How do I book a car rental in Goa with NSZ Goa Ride?", "acceptedAnswer": {"@type": "Answer", "text": "Book through our website or by calling or WhatsApp messaging +91 8262812997."}}]}
            ]
        }
    if page == "contact/index.html":
        return {
            "@context": "https://schema.org",
            "@graph": [
                {"@type": "ContactPage", "@id": canonical + "#contactpage", "url": canonical, "name": title, "description": desc, "isPartOf": {"@id": BASE + "/#website"}, "breadcrumb": {"@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": BASE + "/"}, {"@type": "ListItem", "position": 2, "name": "Contact", "item": canonical}]}},
                {"@type": "LocalBusiness", "@id": BASE + "/#business", "name": SITE_NAME, "telephone": PHONE, "email": EMAIL, "url": BASE + "/", "address": {"@type": "PostalAddress", "streetAddress": "Sanscar Society, Madgaon", "addressLocality": "Madgaon", "addressRegion": "Goa", "postalCode": "403601", "addressCountry": "IN"}}
            ]
        }
    if page == "gallery/index.html":
        return {"@context": "https://schema.org", "@type": "ImageGallery", "name": "NSZ Goa Ride Fleet Gallery", "description": desc, "url": canonical, "publisher": {"@type": "Organization", "name": SITE_NAME}}
    if page == "404/index.html":
        return {"@context": "https://schema.org", "@type": "WebPage", "name": "404 Page Not Found", "description": desc, "url": canonical, "isPartOf": {"@id": BASE + "/#website"}}

    return {
        "@context": "https://schema.org",
        "@graph": [
            {"@type": "WebPage", "@id": canonical + "#webpage", "url": canonical, "name": title, "description": desc, "isPartOf": {"@id": BASE + "/#website"}, "breadcrumb": {"@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": BASE + "/"}, {"@type": "ListItem", "position": 2, "name": title, "item": canonical}]}},
            {"@type": "Service", "name": title, "provider": {"@id": BASE + "/#business"}, "serviceType": "Car rental and airport transfer service in Goa", "areaServed": "Goa", "url": canonical}
        ]
    }


for html in sorted(root.rglob("*.html")):
    if html.name in ignore:
        continue
    rel = html.relative_to(root).as_posix()
    raw = html.read_text(encoding="utf-8", errors="ignore")
    title = build_title(rel)
    desc = build_description(rel)
    canonical = canonical_for(rel)
    raw = strip_existing_seo(raw)
    head_idx = raw.lower().find("</head>")
    if head_idx == -1:
        continue
    if "<title>" not in raw.lower():
        raw = raw[:head_idx] + f"    <title>{title}</title>\n" + raw[head_idx:]
    meta_block = [
        f'    <meta name="description" content="{desc}">',
        '    <meta name="robots" content="index, follow">',
        f'    <link rel="canonical" href="{canonical}">',
        f'    <meta property="og:title" content="{title}">',
        f'    <meta property="og:description" content="{desc}">',
        f'    <meta property="og:url" content="{canonical}">',
        '    <meta property="og:type" content="website">',
        f'    <meta property="og:image" content="{LOGO}">',
        '    <meta property="og:site_name" content="NSZ Goa Ride">',
        '    <meta name="twitter:card" content="summary_large_image">',
        f'    <meta name="twitter:title" content="{title}">',
        f'    <meta name="twitter:description" content="{desc}">',
        f'    <meta name="twitter:image" content="{LOGO}">',
    ]
    schema = build_schema(rel, title, desc, canonical)
    schema_script = "    <script type=\"application/ld+json\">" + json.dumps(schema, ensure_ascii=False) + "</script>"
    insert = "\n".join(meta_block) + "\n" + schema_script + "\n"
    raw = raw[:head_idx] + insert + raw[head_idx:]
    raw = re.sub(r'(?is)<title>.*?</title>', f'<title>{title}</title>', raw, count=1)
    html.write_text(raw, encoding="utf-8")

print(f"Finished SEO metadata update across {len(list(root.rglob('*.html')))} HTML pages.")

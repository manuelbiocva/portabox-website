# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML, CSS and vanilla JavaScript — no build step, no framework, no runtime dependency. Three files: `index.html`, `assets/css/portabox.css`, `assets/js/portabox.js`.

The user first chose Next.js + Tailwind + Framer Motion, then changed the target mid-build: the site will be built on **WordPress**, with the static HTML wanted first as the design deliverable. The stack was rebuilt to suit that, because plain HTML/CSS/JS ports into a WordPress theme mechanically while a React build does not. `WORDPRESS.md` holds the conversion path. A partial Next.js draft from the first direction is parked in `_nextjs-draft/` and can be deleted.

## Users

Primary: Australian householders mid-transition — moving between homes, renovating, downsizing, or between leases — who need somewhere to put the contents of a 1–3 bedroom home for weeks to months. They are cost-sensitive, comparing quotes, and usually under time pressure from a settlement or lease date.

Secondary: small businesses storing inventory, stock overflow, or site equipment.

Both arrive with a postcode and a rough volume in mind, and leave if they cannot get a price quickly.

## Product Purpose

Portabox delivers a portable storage container to the customer's own address, leaves it there for them to load at their own pace, and then either leaves it on site or takes it away to a secure facility — or moves it interstate. Success is a booked container: the visitor gets a price they trust and books, or calls 1800 467 637.

The product removes the self-storage trip entirely. Nothing is carried twice, nothing is driven across town, and the customer keeps the only keys.

## Positioning

Three claims a competitor could not truthfully copy:

1. **EARL hydraulic lift.** The container is lowered and raised level, on hydraulics, rather than tilted off the back of a tray truck. Tilting slides and topples loaded contents; level placement does not. This is the mechanism the whole brand rests on.
2. **Priced per cubic metre, not per footprint.** Portabox states its containers are 20–30% larger than competitors' and that it is the cheapest per cubic metre. The Large at $279/month over 25 m³ is $8.76/m³ against the Small's $20.90/m³ — the per-m³ number is the actual argument, and no competitor publishes it.
3. **Sole key custody.** The customer holds the only keys, including while the container is stored at a Portabox facility.

Supporting: discreet white containers designed not to look like a construction skid, so they can sit in a suburban driveway without a neighbour complaint.

## Operating Context

Evaluation happens on a phone, often mid-move, while the visitor is also getting quotes from Kennards, National Storage, and TAXIBOX. The comparison is made on price and on whether a container fits in the driveway. Clearance dimensions and whether the truck can access the site are real blockers, not trivia — a visitor who cannot confirm the box fits will not book.

Delivery runs from four hubs, each with a 150–200 km radius: Brisbane, Sydney, Melbourne, Adelaide. Anywhere outside that is quoted by phone as a "Regional Solution".

## Capabilities and Constraints

Three container sizes, priced monthly:

| Size | Volume | From | Per m³ | Suits |
|---|---|---|---|---|
| Small | 10 m³ | $209/mo | $20.90 | Apartments and units |
| Medium | 19 m³ | $259/mo | $11.00 | 2-bedroom homes |
| Large | 25 m³ | $279/mo | $8.76 | 3-bedroom homes |

Three service modes: store at your place (24/7 access), store with Portabox (secure facility, 48 hours notice for access, 24-hour monitoring), and moving/regional (door-to-door interstate).

Container build: flat interior walls, weather-proof, discreet white exterior.

Commercial commitments: a price-match guarantee that undertakes to beat a competitor's written quote, not just match it. Prices are "from" rates and vary by location and term.

Contact: 1800 467 637, sales@portabox.au. Self-service portal exists.

**Undecided / not supplied:** exact container external and internal dimensions in millimetres, required truck clearance figures, years in operation, total deliveries, Google review count and average. These must not be fabricated.

## Brand Commitments

Name: Portabox. Domain portabox.au. Existing customer-facing line: "Storage That Stays at Your Place". Existing containers are white — the product's discretion is a stated selling point, so the physical product's whiteness is a fact the design must respect.

Socials: facebook.com/portabox.au, instagram.com/portabox.au, linkedin.com/company/portabox-au.

The user asked for a bold reinvention of the current look, explicitly rejecting the portabox.netlify.app sample as generic, static, and structurally wrong. The current site's visual language is therefore evidence, not authority.

## Evidence on Hand

Three named testimonials carried over from the live site, real and usable:

- Bridget, Adelaide — worked out roughly 40% cheaper per cubic metre than the alternative she priced.
- Dean, Sydney to Brisbane — credits the hydraulic system with arriving without furniture damage; praised staff responsiveness.
- Steve, Melbourne — valued holding the only key and sorting through belongings in his own front yard over time.

**Absent, must not be invented:** star rating and review counts, delivery totals, years trading, named business customers, press coverage, certifications, insurance underwriter. Photography of real containers and real deliveries is not in this repository; any imagery shipped in the build is a labelled placeholder for the client to replace.

## Product Principles

1. **A price, fast.** The visitor's first question is "what will this cost me at my address". Never make them scroll for it, and never make a form the only path to a number.
2. **The per-cubic-metre number is the argument.** Any pricing presentation that hides it has thrown away the one comparison Portabox wins.
3. **Show the mechanism, don't assert it.** EARL is a physical claim about level versus tilt. It has to be demonstrated, because "advanced hydraulic system" is what every competitor also writes.
4. **Fit before feelings.** Dimensions, clearance, and access are conversion-critical content, not a spec-sheet afterthought.
5. **Say what is not known.** The business has real numbers it has not supplied; the site states what is true and leaves the rest out rather than padding with invented proof.

## Accessibility & Inclusion

No client-specified standard on record. Build to WCAG 2.1 AA as the working floor: 4.5:1 body contrast, visible keyboard focus, 44px minimum touch targets, and full `prefers-reduced-motion` support — the last is non-negotiable given the motion-led direction.

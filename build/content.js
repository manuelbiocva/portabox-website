/* =================================================================
   Portabox — site content.
   Every commercial fact here comes from portabox.au. Nothing about
   ratings, review counts, years trading or delivery totals appears,
   because the business has not published those. Container linear
   dimensions are marked indicative wherever they are shown.
   ================================================================= */

const CONTACT = {
  phone: "1800 467 637",
  tel: "tel:1800467637",
  email: "sales@portabox.au",
  mailto: "mailto:sales@portabox.au",
  quote: "instant-quote.html",            // every "Instant Quote" CTA lands here
  quoteForm: "https://portabox.au/get-a-quote/",  // the live form the page hands off to
  book: "https://app.smartsheet.com/b/form/356f960443654f9fb2ca37f45c4e8ff6",
  priceMatch: "https://app.smartsheet.com/b/form/35c0f3d1f2ab4ddcb16f717266fd86c0",
  contact: "https://portabox.au/contact/",
  social: [
    ["Facebook", "https://www.facebook.com/portabox.au"],
    ["Instagram", "https://www.instagram.com/portabox.au"],
    ["LinkedIn", "https://www.linkedin.com/company/portabox-au"],
  ],
};

const SIZES = [
  { id:"small",  name:"Small",  vol:10, rate:209, per:"20.90", suits:"Apartments and units",
    img:"size-small.jpg", holds:"A one-bedroom flat, or a single room plus whitegoods." },
  { id:"medium", name:"Medium", vol:19, rate:259, per:"11.00", suits:"Two-bedroom homes", flag:"Price drop",
    img:"size-medium.jpg", holds:"Two bedrooms, a lounge, a full kitchen and the garage overflow." },
  { id:"large",  name:"Large",  vol:25, rate:279, per:"8.76",  suits:"Three-bedroom homes", flag:"Best value", best:true,
    img:"size-large.jpg", holds:"A whole three-bedroom house, including the shed and the bikes." },
];

const TESTIMONIALS = [
  { q:"Finally, a storage company that doesn't rip you off. When I actually did the sums it worked out about 40% cheaper per cubic metre than the quote I had.",
    n:"Bridget", p:"Adelaide", img:"person-bridget.png" },
  { q:"The hydraulic system is the reason nothing arrived damaged. Everything stayed where I packed it. The staff answered every time I rang, which is not something I can say about the last mob.",
    n:"Dean", p:"Sydney to Brisbane", img:"person-dean.png" },
  { q:"Having the only key mattered more than I expected. It sat in the front yard and I sorted through it a box at a time instead of doing the whole lot in one weekend.",
    n:"Steve", p:"Melbourne", img:"person-steve.png" },
];

/* ---- Navigation ------------------------------------------------- */

const STORAGE_SERVICES = [
  { slug:"storage-at-your-place", title:"Storage at Your Place",
    blurb:"The container is delivered to your address and stays there. Access it whenever you like.", img:"doorstep-delivery.jpg" },
  { slug:"store-with-us", title:"Store With Us",
    blurb:"We collect the loaded container and keep it in a monitored facility. You still hold the only keys.", img:"store-with-us.jpg" },
  { slug:"business-storage", title:"Business & Inventory Storage",
    blurb:"Stock overflow, site equipment and seasonal inventory, stored at your premises or ours.", img:"facility-lot.png" },
  { slug:"renovation-storage", title:"Renovation Storage",
    blurb:"Clear a room or a whole house while the trades work, without anything leaving your property.", img:"hybrid-choice.jpg" },
];

const MOVING_SERVICES = [
  { slug:"local-moves", title:"Local Moves",
    blurb:"Door to door within your metro area. Load once, at your own pace, with no removalist clock running.", img:"man-with-customer.png" },
  { slug:"interstate-moves", title:"Interstate Moves",
    blurb:"Brisbane, Sydney, Melbourne and Adelaide, door to door. It travels sealed and it travels level.", img:"two-containers.jpeg" },
  { slug:"regional-remote", title:"Regional & Remote",
    blurb:"Anywhere in Australia, quoted individually. Give us the two postcodes and we will price the run.", img:"truck-outback.png" },
];

const LOCATIONS = [
  { slug:"south-east-queensland", title:"South East Queensland", hub:"Brisbane",
    sats:["Gold Coast","Sunshine Coast","Toowoomba","Ipswich","Byron Bay"], img:"truck-coastal.png",
    intro:"Our Brisbane depot covers the whole of South East Queensland, from the Sunshine Coast down across the border to Byron Bay, and west to Toowoomba." },
  { slug:"greater-sydney", title:"Greater Sydney", hub:"Sydney",
    sats:["Newcastle","Blue Mountains","Wollongong"], img:"two-containers.jpeg",
    intro:"Our Sydney depot runs the length of the coast from Newcastle to Wollongong, and west over the range into the Blue Mountains." },
  { slug:"victoria", title:"Victoria", hub:"Melbourne",
    sats:["Geelong","Mornington Peninsula","Ballarat","Morwell","Seymour"], img:"hero-customer.jpg",
    intro:"Our Melbourne depot covers the metro area and reaches out to Geelong, the Mornington Peninsula, Ballarat, Morwell and Seymour." },
  { slug:"south-australia", title:"South Australia", hub:"Adelaide",
    sats:["Victor Harbor","Murray Bridge","Barossa","Gawler","Adelaide Hills"], img:"doorstep-delivery.jpg",
    intro:"Our Adelaide depot covers the metro area, the Hills, the Barossa, and south to Victor Harbor." },
  { slug:"regional-australia", title:"Regional Australia", hub:"Anywhere", regional:true,
    sats:["Western Australia","Tasmania","Northern Territory","Far North Queensland","Outback NSW & SA"], img:"truck-outback.png",
    intro:"Outside the four depot radii we quote every job individually — and we still go. Tell us the two postcodes and we will price the run." },
];

/* `short` is the label in the top nav bar; `title` is still used for the mega
   menu heading and the drawer ("All storage services"). The bar has to carry
   seven links plus two CTAs, and the full titles no longer fit on a laptop. */
const NAV = [
  { title:"Storage Services", short:"Storage",   href:"storage-services.html", items:STORAGE_SERVICES },
  { title:"Moving Services",  short:"Moving",    href:"moving-services.html",  items:MOVING_SERVICES },
  { title:"Locations",        short:"Locations", href:"locations.html",        items:LOCATIONS },
];

/* ---- Shared section fragments ----------------------------------- */

const WHY = [
  { ico:"lift",  t:"It lowers level, it never tips",
    b:"A tilt tray slides your load down an incline to get it off the deck. The EARL hydraulic frame lowers the whole container flat to the ground and lifts it flat again." },
  { ico:"cube",  t:"Priced by volume, not by footprint",
    b:"Self-storage sells you a floor area and lets you guess the rest. We publish cubic metres and the rate per cubic metre, so the comparison is arithmetic." },
  { ico:"key",   t:"You hold the only keys",
    b:"Including while the container sits in one of our facilities. Nobody at Portabox keeps a spare, and nobody opens it without you." },
  { ico:"wall",  t:"Flat interior walls",
    b:"No ribs, no wheel arches, nothing to pack around. A flat wall is the difference between stacking cleanly to the ceiling and losing room on every side." },
  { ico:"house", t:"Plain white, by design",
    b:"Built to sit in a suburban driveway for a month without becoming the thing the neighbours talk about. No livery, no hoarding, no site-yellow." },
  { ico:"globe", t:"Four depots, and well past them",
    b:"Standard delivery runs 150–200 km out from Brisbane, Sydney, Melbourne and Adelaide. Past that we quote it as a regional job, and we still go." },
];

const FAQ_GENERAL = [
  ["Do I need to be home for delivery?",
   "Not for a standard placement. We need clear access to the spot and somewhere level to set the container down — a driveway, a hardstand or firm ground. We confirm the details with you before the truck leaves."],
  ["How much notice do you need?",
   "Give us as much as you can, especially around settlement dates and end of month when everyone moves at once. Ring the depot and we will tell you honestly what is available."],
  ["What if it does not all fit?",
   "Take a second container. Because you are charged by the cubic metre rather than by the unit, two Smalls and one Large are simple to compare on price — and our team will help you size it before you book."],
  ["Is my stuff insured?",
   "Contents insurance is arranged separately. Talk to us when you book and we will point you at the right cover for what you are storing."],
  ["Can I change from storing to moving later?",
   "Yes. That is the main advantage of the container staying sealed — if your plans change, we move the same container rather than making you repack."],
];

const FAQ_PRICE = [
  ["What does 'from' pricing mean?",
   "Rates start at $209, $259 and $279 a month for the Small, Medium and Large. The final figure depends on your location and how long you need it. We give you the number before you commit."],
  ["Do you really beat a cheaper quote?",
   "Yes — not just match it. Send us a written quote with the container volume on it and we will beat the per-cubic-metre rate. That comparison is the whole reason we publish ours."],
  ["Is there a minimum term?",
   "Talk to your depot. Terms vary by location, and we would rather tell you the truth on the phone than print a number that does not apply to you."],
];

module.exports = {
  CONTACT, SIZES, TESTIMONIALS, NAV,
  STORAGE_SERVICES, MOVING_SERVICES, LOCATIONS,
  WHY, FAQ_GENERAL, FAQ_PRICE,
};

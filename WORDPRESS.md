# Taking this into WordPress

Written for: whoever builds the Portabox WordPress site — you, or a developer you hand this to.

The static build is deliberately structured so the port is mechanical rather than a rewrite. Three files, no build step, no framework:

```
index.html                  the page
assets/css/portabox.css     the whole design system
assets/js/portabox.js       drawing generator + interactions
```

Nothing is compiled. There is no Node dependency at runtime, no Tailwind, no React. That is the reason this ports cleanly.

---

## Pick your route

| Route | Use when | Effort | Fidelity |
|---|---|---|---|
| **A. Custom classic theme** | You want the design exactly as drawn and the client edits text only | Medium | 100% |
| **B. Block theme (FSE)** | The client needs to rearrange sections themselves | High | ~90% |
| **C. Elementor / Divi HTML widget** | A builder site already exists and you just need this page in it | Low | ~95% |
| **D. Custom HTML block** | One-off landing page, no theme work | Lowest | ~95% |

**Recommended: A.** This design leans on a fixed sheet rail, a sticky scroll-scrub section, and a JS-drawn SVG. Page builders wrap content in extra containers that fight `position: sticky` and the `100dvh` hero. A classic theme gives you full control of the markup for about a day of work.

---

## Route A — custom classic theme

### 1. Theme skeleton

```
wp-content/themes/portabox/
├── style.css          theme header only; real CSS stays in assets/
├── functions.php      enqueues
├── header.php         <head>, nav, sheet rail
├── footer.php         footer + wp_footer()
├── front-page.php     the homepage sections
├── page.php           inner pages
└── assets/
    ├── css/portabox.css     (copied as-is)
    └── js/portabox.js       (copied as-is)
```

### 2. `style.css`

```css
/*
Theme Name: Portabox
Author: <you>
Version: 1.0.0
Text Domain: portabox
*/
/* Real styles are enqueued from assets/css/portabox.css */
```

### 3. `functions.php`

```php
<?php
function portabox_assets() {
    $v = wp_get_theme()->get( 'Version' );

    // Fonts: Cabinet Grotesk + Satoshi (Fontshare), Geist Mono (Google).
    wp_enqueue_style(
        'portabox-fontshare',
        'https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@700,800,900&f[]=satoshi@400,500,700&display=swap',
        array(), null
    );
    wp_enqueue_style(
        'portabox-geistmono',
        'https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500&display=swap',
        array(), null
    );

    wp_enqueue_style( 'portabox', get_template_directory_uri() . '/assets/css/portabox.css', array(), $v );
    wp_enqueue_script( 'portabox', get_template_directory_uri() . '/assets/js/portabox.js', array(), $v, true );

    // Hand the postcode lookup a real endpoint.
    wp_localize_script( 'portabox', 'PORTABOX', array(
        'ajax'  => admin_url( 'admin-ajax.php' ),
        'nonce' => wp_create_nonce( 'portabox_quote' ),
    ) );
}
add_action( 'wp_enqueue_scripts', 'portabox_assets' );

function portabox_setup() {
    add_theme_support( 'title-tag' );
    add_theme_support( 'html5', array( 'style', 'script' ) );
    register_nav_menus( array( 'primary' => 'Primary' ) );
}
add_action( 'after_setup_theme', 'portabox_setup' );
```

### 4. Splitting `index.html`

The file is already commented with the split points. Cut on these markers:

| Marker in `index.html` | Goes to |
|---|---|
| `<!DOCTYPE>` → end of `<header class="nav">` | `header.php` |
| `<main id="main">` → `</main>` | `front-page.php` |
| `<footer class="foot">` → `</html>` | `footer.php` |

In `header.php`, replace the `<head>` block with:

```php
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1">
<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
```

Keep the `<meta name="theme-color" content="#15181A">` — add it via `wp_head` or leave it inline.

In `footer.php`, before `</body>`:

```php
<?php wp_footer(); ?>
```

Then delete the `<script src="assets/js/portabox.js">` tag — `functions.php` enqueues it.

### 5. Make the copy editable

Two sane options:

**ACF (or ACF-free with `the_field` equivalents).** Register a field group on the front page for: hero headline, hero lede, the four "grievance" pairs, the three step sets, testimonials, and the region list. Then swap the static markup for `the_field()` calls.

**Or leave it hardcoded.** For a marketing homepage that changes twice a year, hardcoded copy in `front-page.php` is defensible and much faster. Prices are the exception — see below.

### 6. Prices must be editable

Rates appear in **four** places and must never disagree:

1. `assets/js/portabox.js` → the `SIZES` array (drives the drawing + readout)
2. `index.html` hero → `$8.76` and the `25 m³ for $279` line
3. `index.html` → the three `.size-row` blocks
4. `index.html` → the Capacity spec tab

Wire them to one source. In `functions.php`:

```php
function portabox_sizes() {
    return array(
        array( 'id'=>'small',  'name'=>'Small',  'volume'=>10, 'rate'=>209, 'perM3'=>20.90, 'lengthM'=>1.90 ),
        array( 'id'=>'medium', 'name'=>'Medium', 'volume'=>19, 'rate'=>259, 'perM3'=>11.00, 'lengthM'=>3.60 ),
        array( 'id'=>'large',  'name'=>'Large',  'volume'=>25, 'rate'=>279, 'perM3'=>8.76,  'lengthM'=>4.73 ),
    );
}
```

Pass it into JS via the existing `wp_localize_script` call, and in `portabox.js` change the top of the IIFE to:

```js
var SIZES = (window.PORTABOX && window.PORTABOX.sizes) || [ /* existing fallback array */ ];
```

`perM3` is `rate / volume` — have PHP compute it so it can never drift from the rate.

### 7. The quote form

Right now `portabox.js` fakes the lookup with a 650 ms timer and a postcode-range table. Replace `initQuoteForms`'s `setTimeout` with a real call:

```js
fetch(window.PORTABOX.ajax, {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    action: 'portabox_quote',
    nonce: window.PORTABOX.nonce,
    postcode: v
  })
}).then(r => r.json()).then(data => { /* render data.hub / data.regional */ });
```

And in `functions.php`:

```php
add_action( 'wp_ajax_portabox_quote', 'portabox_quote' );
add_action( 'wp_ajax_nopriv_portabox_quote', 'portabox_quote' );

function portabox_quote() {
    check_ajax_referer( 'portabox_quote', 'nonce' );
    $pc = preg_replace( '/\D/', '', $_POST['postcode'] ?? '' );
    if ( strlen( $pc ) !== 4 ) {
        wp_send_json_error( array( 'message' => 'Four digits, please.' ), 400 );
    }
    // Look the postcode up, log the lead, then:
    wp_send_json_success( array( 'hub' => 'Melbourne', 'regional' => false ) );
}
```

The postcode-to-depot ranges in `depotFor()` are real Australian state ranges and can move to PHP as-is. They tell you the *state*, not whether the address is inside a depot's 150–200 km radius — if you want true coverage you need a distance check against depot coordinates.

### 8. Gotchas specific to this design

- **`position: sticky` breaks under `overflow: hidden`.** Some themes and most builders put `overflow-x: hidden` on a wrapper. The EARL section and the sizes drawing both depend on sticky. This build deliberately does *not* set it on `body`; don't add it back.
- **The hero is `min-height: 100dvh`.** If your theme injects an admin bar or a sticky announcement bar, subtract it or the hero will push the fold.
- **The SVG is generated at runtime**, so it inherits whatever `--ink`/`--film` values are live. If a builder overrides CSS custom properties on a wrapper, the drawing recolours with it. That is usually what you want.
- **IDs matter.** `portabox.js` looks for `#hero-drawing`, `#size-drawing`, `#earl-track`, `#tilt-box`, `#tilt-load`, `#level-box`, `#earl-bar`, `#readout-perm3`, `#readout-volume`, `#readout-rate`. Page builders love to rewrite IDs. Check them after import.
- **Don't let a minifier touch the SVG strings** in `portabox.js`. Some aggressive JS minifiers mangle the template concatenation.

---

## Route C / D — builder or HTML block, quickly

1. Upload `assets/` to `wp-content/uploads/portabox/`.
2. Enqueue both files from a child theme's `functions.php` (same snippet as above, with the uploads URL).
3. Paste everything between `<main id="main">` and `</main>` into an Elementor **HTML widget** or a **Custom HTML block**.
4. Add the nav and footer as a theme header/footer, or paste those too.
5. Set the page template to **full width / no container** — otherwise the builder's max-width wrapper will fight the `100dvh` hero and the sticky sections.

This gets you ~95% fidelity in under an hour. You lose clean editability, and the sheet rail may need `z-index` nudging above the builder's own fixed elements.

---

## Before it goes live

- [ ] Replace the indicative dimensions. `4.73 × 2.20 × 2.40 m` is **derived** from the published 25 m³ against an assumed cross-section — it is not surveyed. Same for the Small and Medium lengths in the `SIZES` array. Get the real external and internal dimensions from Portabox and update `lengthM` plus the `CROSS` constant.
- [ ] Get the real overhead-clearance and truck-access figures for the Clearance tab. The current copy deliberately says "confirmed by your depot" rather than inventing a number.
- [ ] Decide on review proof. There are no star ratings, review counts, delivery totals or years-trading anywhere in this build, because none were supplied. If Portabox has Google reviews, add them — it is the one piece of missing social proof.
- [ ] Point the three legal links (Terms, Disclaimer, Privacy) at real pages.
- [ ] Self-host the fonts if you want to drop the two external requests. Cabinet Grotesk and Satoshi are free from Fontshare; Geist Mono from Google Fonts. Self-hosting also removes a GDPR question about Google Fonts.
- [ ] Add analytics and a lead destination for the quote form — right now a successful lookup shows the depot but does not capture anything.

"""Convert the last of the plain .btn CTAs to trace buttons, with a hover line each."""
import io, re

b = 'build/build.js'
t = io.open(b, encoding='utf-8').read()
hits, misses = [], []

def sub(old, new):
    global t
    if old in t:
        t = t.replace(old, new)
        hits.append(old[:58].replace('\n', ' '))
    else:
        misses.append(old[:58].replace('\n', ' '))

# --- ctaBand: always use the trace button ---
sub('''          ${o.trace
            ? traceBtn(C.CONTACT.tel, "Call the depot", C.CONTACT.phone, o.cyan ? "oncyan" : "dark")
            : `<a class="btn btn--ghost" href="${C.CONTACT.tel}">${ICON.phone}${C.CONTACT.phone}</a>`}''',
    '''          ${traceBtn(C.CONTACT.tel, "Call the depot", C.CONTACT.phone, o.cyan ? "oncyan" : "dark")}''')

# --- hero CTAs on the hub pages ---
sub('`<a class="btn btn--primary" href="${C.CONTACT.quote}">Instant Quote</a><a class="btn btn--ghost" href="pricing.html">See pricing</a>`',
    'traceBtn(C.CONTACT.quote, "Instant Quote", "One field", "primary") + traceBtn("pricing.html", "See pricing", "From $209", "dark")')

sub('`<a class="btn btn--primary" href="${C.CONTACT.quote}">Instant Quote</a><a class="btn btn--ghost" href="locations.html">Where we go</a>`',
    'traceBtn(C.CONTACT.quote, "Instant Quote", "One field", "primary") + traceBtn("locations.html", "Where we go", "Four depots", "dark")')

sub('`<a class="btn btn--primary" href="${C.CONTACT.quote}">Check my postcode</a>`',
    'traceBtn(C.CONTACT.quote, "Check my postcode", "Four digits", "primary")')

sub('`<a class="btn btn--primary" href="${C.CONTACT.quote}">Instant Quote</a><a class="btn btn--ghost" href="${C.CONTACT.priceMatch}">Get a price match</a>`',
    'traceBtn(C.CONTACT.quote, "Instant Quote", "One field", "primary") + traceBtn(C.CONTACT.priceMatch, "Get a price match", "We\\u2019ll beat it", "dark")')

sub('`<a class="btn btn--primary" href="${C.CONTACT.quote}">Instant Quote</a>`',
    'traceBtn(C.CONTACT.quote, "Instant Quote", "One field", "primary")')

sub('`<a class="btn btn--primary" href="${C.CONTACT.quote}">Instant Quote</a><a class="btn btn--ghost" href="${C.CONTACT.tel}">${C.CONTACT.phone}</a>`',
    'traceBtn(C.CONTACT.quote, "Instant Quote", "One field", "primary") + traceBtn(C.CONTACT.tel, "Call the depot", C.CONTACT.phone, "dark")')

# --- statement() CTAs ---
sub('btns: `<a class="btn btn--primary" href="${C.CONTACT.quote}">Get a price</a>`,',
    'btns: traceBtn(C.CONTACT.quote, "Get a price", "Let\\u2019s go", "primary"),')

sub('btns: `<a class="btn btn--primary" href="${C.CONTACT.tel}">Call ${C.CONTACT.phone}</a>`,',
    'btns: traceBtn(C.CONTACT.tel, "Call the depot", C.CONTACT.phone, "primary"),')

# --- split() CTAs ---
sub('btns: `<a class="btn btn--outline" href="pricing.html">See pricing</a>`,',
    'btns: traceBtn("pricing.html", "See pricing", "From $209", "outline"),')

sub('btns: `<a class="btn btn--outline" href="${C.CONTACT.tel}">Ask the depot</a>`,',
    'btns: traceBtn(C.CONTACT.tel, "Ask the depot", C.CONTACT.phone, "outline"),')

sub('btns: `<a class="btn btn--primary" href="${C.CONTACT.quote}">Get a price</a><a class="btn btn--outline" href="${C.CONTACT.tel}">${C.CONTACT.phone}</a>`,',
    'btns: traceBtn(C.CONTACT.quote, "Get a price", "Let\\u2019s go", "primary") + traceBtn(C.CONTACT.tel, "Call the depot", C.CONTACT.phone, "outline"),')

# --- sizes section link on the inner pricing block ---
sub('<a class="btn btn--outline" href="#final-cta">Get a price for my postcode</a>',
    '${traceBtn("#final-cta", "Get a price", "Four digits", "outline")}')

io.open(b, 'w', encoding='utf-8').write(t)
print('converted:')
for h in hits: print('   +', h)
if misses:
    print('not found (may already be converted):')
    for m in misses: print('   -', m)

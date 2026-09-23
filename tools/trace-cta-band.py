"""Let ctaBand() opt into the trace button, and switch the homepage's call to it.
Inner pages call ctaBand() with no argument, so they are unaffected."""
import io

b = 'build/build.js'
s = io.open(b, encoding='utf-8').read()

old = '''        <div class="btn-row" style="margin-top:1.75rem">
          <a class="btn btn--ghost" href="${C.CONTACT.tel}">${ICON.phone}${C.CONTACT.phone}</a>
        </div>'''
new = '''        <div class="btn-row" style="margin-top:1.75rem">
          ${o.trace
            ? traceBtn(C.CONTACT.tel, "Call the depot", C.CONTACT.phone, "dark")
            : `<a class="btn btn--ghost" href="${C.CONTACT.tel}">${ICON.phone}${C.CONTACT.phone}</a>`}
        </div>'''

if old in s:
    s = s.replace(old, new)
    print('build.js: ctaBand() can now take trace:true')
elif 'o.trace' in s:
    print('build.js: ctaBand already updated')
else:
    raise SystemExit('ctaBand button block not found')

# The homepage is the last ctaBand() call in the file, inside the homepage push.
marker = '    locationList({ band: "cream" }),\n    faq(C.FAQ_GENERAL, "Before you book", "cream"),\n    ctaBand(),'
if marker in s:
    s = s.replace(marker, marker.replace('ctaBand(),', 'ctaBand({ trace: true }),'))
    print('build.js: homepage CTA band -> trace button')
else:
    print('build.js: homepage ctaBand marker not found')

io.open(b, 'w', encoding='utf-8').write(s)

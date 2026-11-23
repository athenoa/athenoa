# Regenerates src/components/Signature.astro from trace.svg (the traced ink) and pen.json (the pen's way).
# Run from this folder: python3 generate.py
import json,re,math
pts=json.load(open('pen.json'))
svg=open('trace.svg').read()
ds=[re.sub(r'\s+',' ',d).strip() for d in re.findall(r'<path d="([^"]+)"',svg)]
def cr(p):
    if len(p)<3: return 'M%g %g L%g %g'%(*p[0],*p[1])
    d='M%g %g'%tuple(p[0])
    for i in range(len(p)-1):
        p0=p[max(i-1,0)];p1=p[i];p2=p[i+1];p3=p[min(i+2,len(p)-1)]
        d+=' C%.1f %.1f %.1f %.1f %g %g'%(p1[0]+(p2[0]-p0[0])/6,p1[1]+(p2[1]-p0[1])/6,p2[0]-(p3[0]-p1[0])/6,p2[1]-(p3[1]-p1[1])/6,*p2)
    return d
L=lambda s: sum(math.dist(s[i],s[i+1]) for i in range(len(s)-1))
letters=pts[:-4]; star=pts[-4:]
t=0.15; strokes=[]
for s in letters:
    d=max(L(s)/550,0.06); strokes.append((cr(s),t,d)); t+=d+0.05
t+=0.18
for s in star:
    d=max(L(s)/400,0.1); strokes.append((cr(s),t,d)); t+=d+0.04
total=t
mask='\n'.join(f'        <path d="{d}" pathLength="1" style="--t:{t0:.2f}s;--d:{du:.2f}s" />' for d,t0,du in strokes)
ink='\n'.join(f'        <path d="{d}" />' for d in ds)
comp=f'''---
// Athena's signature (Maria, 23 November 2026), traced from her own hand: src/assets/signature/source.png.
// It writes itself the first time it comes into view, as if signed there and then: the letters stroke by
// stroke, then the star above them. The ink is the traced outline; a mask of pen strokes along the writing
// (src/assets/signature/pen.json, in the source image's pixels) uncovers it, and when the pen is done the
// whole signature, unmasked, settles over it, so no part of a letter is ever left out (the bottom of the θ
// once was). Without motion the whole signature is simply there.
interface Props {{
  class?: string;
  /** what a screen reader hears */
  label?: string;
}}
const {{ class: className, label = 'Αθηνά' }} = Astro.props;
const id = `sig-${{Math.random().toString(36).slice(2, 8)}}`;
---

<span class:list={{['signature', className]}} data-reveal="fade" role="img" aria-label={{label}} style="--done:{total:.2f}s">
  <svg viewBox="22 40 388 166" aria-hidden="true" focusable="false">
    <defs>
      <mask id={{`${{id}}-pen`}} maskUnits="userSpaceOnUse" x="0" y="0" width="454" height="220">
        <g fill="none" stroke="#fff" stroke-width="22" stroke-linecap="round" stroke-linejoin="round">
{mask}
        </g>
      </mask>
      <g id={{`${{id}}-ink`}} transform="matrix(0.025 0 0 -0.025 0 220)" fill="currentColor">
{ink}
      </g>
    </defs>
    <!-- the pen's way: what it has written so far -->
    <use class="signature__written" href={{`#${{id}}-ink`}} mask={{`url(#${{id}}-pen)`}} />
    <!-- the whole signature, once the pen is done -->
    <use class="signature__whole" href={{`#${{id}}-ink`}} />
  </svg>
</span>

<style>
  .signature {{
    display: inline-block;
    width: 9rem;
    color: inherit;
    line-height: 0;
  }}
  .signature svg {{
    display: block;
    width: 100%;
    height: auto;
    overflow: visible;
  }}
  /* No sliding in: the hand does the arriving */
  :global(html.motion) .signature[data-reveal] {{
    transform: none;
    opacity: 1;
  }}
  /* Each stroke waits its turn (--t) and takes as long as the pen does (--d); the whole signature takes
     about {total:.1f}s (--done), then the complete one settles over what the pen wrote */
  :global(html.motion) .signature mask path {{
    stroke-dasharray: 1 1;
    stroke-dashoffset: 1;
  }}
  :global(html.motion) .signature.is-in mask path {{
    stroke-dashoffset: 0;
    transition: stroke-dashoffset var(--d) cubic-bezier(0.35, 0.05, 0.55, 0.95) var(--t);
  }}
  :global(html.motion) .signature .signature__whole {{
    opacity: 0;
  }}
  :global(html.motion) .signature.is-in .signature__whole {{
    opacity: 1;
    transition: opacity 0.35s ease var(--done);
  }}
</style>
'''
open('../../components/Signature.astro','w').write(comp)
print('total',round(total,2))

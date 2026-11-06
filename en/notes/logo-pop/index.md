# A canvas becomes twice as large on Retina: inset:0 does not stretch it (a bug in a logo that bursts when you tap it)

> Burst particles appeared in the wrong place on high-DPI screens. A canvas with only inset:0 keeps its pixel size, so it was 2x larger in CSS on Retina.

- URL: https://koshinstudio.com/en/notes/logo-pop/
- Original (Japanese): https://koshinstudio.com/notes/logo-pop/
- Published: 2026-10-09
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/logo-pop/)

Development log of Koshin Studio / October 2026

  The top of this site has a large logo. When you tap a letter, it pops and particles scatter. After I rebuilt the logo with my own typeface, I was told “the particles come out of a strange place, not from the letter” and “it is still shifted to the right.” It took three stages to fix. Here are the cause and how I found it, with measured numbers.

## Rebuilding the logo with my own typeface

  The old logo was set in Latin letters built on a Mincho skeleton. I replaced it with my own typeface, Koshin Pop (rounded Latin letterforms drawn from scratch). The font is under the SIL Open Font License 1.1, which allows use in a logo.

  I extract the outlines of the nine letters K O S H I N T U D from the font file and turn them into SVG paths (tools/logotype_pop.py). The logo is delivered as a picture, so the site does not ship the font file. The font has several shapes for the same letter (base, pop1, pop2), so I lined up three combinations and picked the one with the best rhythm.

## Stage 1: after a tap, the letter did not return to its place

  I recorded positions over time after a tap. The letters did not return to where they started.

    Letter | Center before | 2 s after

    K (top left) | (327, 306) | (320, 313)

    S (bottom left) | (331, 442) | (323, 435)

  That is about 7 px off. A matrix(1, 0, 0, 1, -46, -42) was left over: the scale was back to 1 but the position offset stayed.

  Cause: the animation library (GSAP) rewrote the position that was already set on the letter’s SVG <g> (transform="translate(x,0)") using its own calculation, and part of that correction remained afterward.

  Fix: I split the element into a layer that holds the position (outer <g transform>) and a layer that moves (inner <g class="ks-ch">), and switched the motion to the browser’s Web Animations (when it ends, the effect disappears and the original state returns). I checked all 12 letters: the centers did not move, and the transform after the animation went back to none.

## Stage 2: “it is still to the right”

  After that fix I was still told the animation sat to the right. My measurement said particles started within 2 to 13 px of the letter’s center. What I measured and what was seen disagreed.

  I had measured on a 1x display, counting particle positions in screen coordinates. When I measured on 2x (Retina) and 3x (phone) displays, the CSS size of the particle canvas (#burst) was wrong.

    Display | Viewport width | Canvas width (before) | (after)

    1280 px, 1x | 1280 | 1280 | 1280

    1440 px, 2x | 1440 | 2880 | 1440

    390 px, 3x (phone) | 390 | 780 | 390

  Cause: I positioned the canvas with inset:0 in CSS, but a replaced element such as a canvas does not stretch to fill with inset:0 alone. It keeps its intrinsic size (its pixel count). On a 2x display the pixel count is doubled, so the CSS size doubled too, and particles appeared at twice the coordinates (toward the lower right). On a 1x display the sizes are equal, so you cannot notice.

  Fix: set width and height to 100% explicitly. After the fix, the canvas matched the viewport on every pixel ratio.

## Stage 3: emit from the letter itself

  Finally I was asked whether particles could come from the letter itself. Until then they came from the center of the letter’s box, so for a letter with an empty middle like “O” they seemed to come from nowhere.

  I now pick points along the outline of the letter’s path (getPointAtLength), take their on-screen positions, and send particles outward from the letter’s center with some scatter. The bottom row is drawn as “letter = mask”, so I look up the path inside the mask that the rect refers to. In the captures, “O” emits from around its ring and “U” along its shape.

## What I learned

> When measured numbers and what people see disagree, suspect the conditions of the measurement.

- The viewer’s screen is not yours. I measured only on a 1x display and judged “the offset is small.” On a 2x display the particles came out at twice the position.

- Measure in the space people look at. I counted logical coordinates, so the on-screen offset was never visible to me.

- Measure the state after an animation ends, too. That letters did not return was invisible while I only watched the motion.

- Keep position and motion on different layers. If one element holds both, one overwrites the other.

  The numbers come from operating this site’s top page in a real browser (Chrome) on October 8, 2026. I have not confirmed the fix on an actual Retina device; I reproduced 2x and 3x pixel ratios with browser settings.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/logo-pop/).

  More in English

- All English pages (https://koshinstudio.com/en/)

# How bullet-hell patterns work: ring, aimed, rain, spiral and homing, with formulas and live demos

> The exact math behind ring, aimed (odd vs even), rain, spiral and homing bullet-hell patterns, from a real danmaku game, with live demos.

- URL: https://koshinstudio.com/en/notes/danmaku-patterns/
- Original (Japanese): https://koshinstudio.com/notes/danmaku-patterns/
- Published: 2026-11-07
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/danmaku-patterns/)

Development log of Danmaku Maker / November 2026

  However complex a bullet-hell (danmaku) pattern looks, each piece is a short formula. This article writes out the formulas my danmaku game Danmaku Maker (https://koshinstudio.com/en/works/danmaku-maker/) actually uses, with live demos so you can check them. It is for anyone who wants to design bullet patterns, or build them into a game.

  The formulas are copied from the app’s bullet code (Simulation.swift and AdPatterns.swift in DanmakuCore). The demos are those formulas ported to JavaScript; the ship follows your finger or mouse (there is no hit detection). The small white circle on the ship is the size of the game’s hitbox.

## A pattern is an emitter and four numbers

  In Danmaku Maker the thing that fires is an emitter; a stage can have up to 8. Each emitter mainly sets four numbers:

    Symbol | Meaning | Unit

      i | Interval between shots | seconds (0.05–2)

      c | Bullets per shot | count (1–36)

      v | Bullet speed | ×60 px/s (1–5)

      r | Angle (rotation, spread or swing, depending on the pattern) | degrees

  The field is computed at 360×540 and stepped every 1/120 s. On shot number k, bullet j (0 to c−1) leaves at angle θ with speed v × 60, and after that it simply flies straight (except for homing and a few others). The shape of a pattern is decided almost entirely by how the angle is chosen at the moment of firing.

## Ring: evenly spaced around a circle

  The most basic pattern: c bullets in directions that divide the circle evenly.

  θ = 2π × j ÷ c + k × r°

  With r = 0 every shot goes the same way, so rings spread as concentric circles. The demo fires 16 bullets every second.

    Bullets
    Ring (16 bullets, no rotation)

  Slipping between rings is the basic way to dodge. More bullets mean narrower gaps.

## A rotating ring is not a real spiral

  Set the ring’s r to something other than 0 and the whole ring turns by r degrees each shot. With a short interval (0.12 s) and few bullets (3), the trails look like the arms of a spiral.

    Rotation
    Rotating ring (3 bullets, every 0.12 s, turning 11°)

  But every bullet flies straight. It only looks like a spiral because the firing direction shifts a little each time. Danmaku Maker originally called this “spiral” too.

  Later I added a real spiral where the bullets themselves curve: for 8 seconds after firing, each one turns 30° per second in the same direction.

    Real spiral (bullets curve 30° per second)

  Compare them: the rotating ring’s arms straighten out as they travel, while the real spiral’s arms keep winding. Dodging differs too: with the rotating ring you step into the gap between arms; with the real spiral the arms sweep around toward you.

  Changing the old “spiral” math would change the behavior of stages already published. So the old calculation stays as it is, hidden from the editor, and the real spiral was added as a separate pattern.

## Aimed shots: odd and even counts need opposite dodges

  Aim at where the player is at the moment of firing, and open a fan of r degrees around that direction.

  b = atan2(player y − emitter y, player x − emitter x)
θ = b + (j ÷ (c−1) − 0.5) × r°

  Whether the count is odd or even flips how it behaves:

- Odd (e.g. 5): the middle bullet (j = (c−1)÷2) has angle exactly b, so it flies straight at where you are now. Standing still gets you hit; keep drifting sideways.

- Even (e.g. 6): there is no middle bullet, so where you are now is exactly a gap. Standing still dodges it; panicking into a move gets you hit.

    Aimed, odd (5 bullets)

    Aimed, even (6 bullets)

  Hold the ship still in the demos to see the difference. Mixing odd and even aimed shots in one stage forces the player to choose between moving and staying.

## Rain: scattered from the top of the screen

  Rain ignores the emitter’s position: bullets start at a random x along the top edge and head almost straight down, varying by only ±0.15 radians (about ±8.6°).

  x = random × 360, y = −8, θ = 90° + (random − 0.5) × 0.3

    Rain (2 bullets every 0.25 s)

  It looks random, but the random numbers come from a seed fixed per stage (mulberry32), so the same stage rains the same way for everyone. Otherwise luck would decide the rankings.

## Sweeping fan: swinging around straight down

  Centered on straight down (90°), the fan swings left and right on a sine wave from shot to shot. Its width is fixed at 0.5 radians (about 29°).

  center = 90° + sin(0.25 × k) × r°

    Swing
    Sweeping fan (swing 60°)

  Raising the 0.25 in 0.25 × k swings faster; raising r swings wider. The band of bullets ripples, so you dodge by reading the side it is coming back to.

## Homing: it only turns for the first 2.5 seconds

  Each frame, a homing bullet turns toward the player, but the turn per second is capped (max(25°, 2 × |r|°)), and it only homes for 2.5 seconds after firing. After that it flies straight.

    Homing (3 bullets)

  If homing never stopped, bullets would circle the player until they hit. An undodgeable bullet is not hard, just unfair. “It follows you, but if you lure it in and sidestep, it misses” was the line where it still works as play.

## The hitbox is smaller than it looks

  In Danmaku Maker you are hit when the distance between a bullet’s center and the ship’s center is under 5.5 px (in code, distance squared under 30.25). Bullets are drawn with a 6 px colored radius, so a visual graze does not count. Making the hitbox smaller than the sprite is standard in bullet-hell games, and it is what makes squeezing through gaps fun.

  The screen also holds at most 1,600 bullets; anything beyond that is not fired. Phones keep up at that count, and it still nearly fills the screen.

## Summary: tips for designing patterns

- Shape comes from the firing angle. Ring, aimed and sweep are each a one-line formula.

- A rotating ring and curving bullets are different. Both look like a spiral, but you dodge them differently.

- Use odd and even aimed shots on purpose. Odd says “move,” even says “stay.”

- Randomness from a fixed seed. Same stage, same bullets.

- Give homing a time limit. Do not make bullets that cannot be dodged.

## Try building one

  Ring, aimed and rain can be built straight away in the free browser version of Danmaku Maker (https://koshinstudio.com/en/works/danmaku-maker/try/) (no sign-up). Clear your own stage and you can send it to a friend by link. Spiral, sweeping fan and homing, plus flower, star, lasers, mines and many more, are in the iPhone and iPad app (https://koshinstudio.com/en/works/danmaku-maker/).

  Build bullet patterns in your browser (https://koshinstudio.com/en/works/danmaku-maker/try/)

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/danmaku-patterns/).

  More in English

- All English pages (https://koshinstudio.com/en/)

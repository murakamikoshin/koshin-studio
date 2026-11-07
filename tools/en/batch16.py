# 2026-11-07：弾幕パターンの作り方（動く見本つき）
def _demo(key, label, sliders=()):
    sl = ''.join(f'<label style="display:flex;gap:8px;align-items:center;font-size:13px">{lab}<input type="range" id="d-{key}-{k}" data-k="{k}" min="{a}" max="{b}" step="{st}" style="flex:1"><output for="d-{key}-{k}"></output></label>' for k, lab, a, b, st in sliders)
    return f'''  <figure class="rv" style="flex:1 1 140px;max-width:300px;margin:18px auto">
    <canvas data-demo="{key}" data-label="{label}" width="360" height="540" style="width:100%;aspect-ratio:2/3;border-radius:8px;display:block;touch-action:none"></canvas>
    {sl}
    <figcaption>{label}</figcaption>
  </figure>
'''
pairs.append({**make('danmaku-patterns',
 'How bullet-hell patterns work: ring, aimed, rain, spiral and homing, with formulas and live demos',
 'Bullet-hell patterns are short formulas. The exact math my danmaku game Danmaku Maker uses for ring, aimed (odd vs even), rain, spiral and homing bullets, with live demos.',
 'How bullet-hell patterns work',
 'Development log of Danmaku Maker / November 2026',
 f'''  <p>However complex a bullet-hell (danmaku) pattern looks, each piece is a <strong>short formula</strong>. This article writes out the formulas my danmaku game <a href="/en/works/danmaku-maker/" hreflang="en" lang="en">Danmaku Maker</a> actually uses, with live demos so you can check them. It is for anyone who wants to design bullet patterns, or build them into a game.</p>
  <p class="note">The formulas are copied from the app’s bullet code (<code>Simulation.swift</code> and <code>AdPatterns.swift</code> in DanmakuCore). The demos are those formulas ported to JavaScript; the ship follows your finger or mouse (there is no hit detection). The small white circle on the ship is the size of the game’s hitbox.</p>

  <h2 class="rv" id="s1">A pattern is an emitter and four numbers</h2>
  <p>In Danmaku Maker the thing that fires is an <strong>emitter</strong>; a stage can have up to 8. Each emitter mainly sets four numbers:</p>
  <div class="scroll rv"><table>
    <thead><tr><th>Symbol</th><th>Meaning</th><th>Unit</th></tr></thead>
    <tbody>
      <tr><td><code>i</code></td><td>Interval between shots</td><td>seconds (0.05–2)</td></tr>
      <tr><td><code>c</code></td><td>Bullets per shot</td><td>count (1–36)</td></tr>
      <tr><td><code>v</code></td><td>Bullet speed</td><td>×60 px/s (1–5)</td></tr>
      <tr><td><code>r</code></td><td>Angle (rotation, spread or swing, depending on the pattern)</td><td>degrees</td></tr>
    </tbody>
  </table></div>
  <p>The field is computed at 360×540 and stepped every 1/120 s. On shot number <code>k</code>, bullet <code>j</code> (0 to <code>c−1</code>) leaves at angle <code>θ</code> with speed <code>v × 60</code>, and after that it simply flies straight (except for homing and a few others). <strong>The shape of a pattern is decided almost entirely by how the angle is chosen at the moment of firing.</strong></p>

  <h2 class="rv" id="s2">Ring: evenly spaced around a circle</h2>
  <p>The most basic pattern: <code>c</code> bullets in directions that divide the circle evenly.</p>
  <p><code>θ = 2π × j ÷ c + k × r°</code></p>
  <p>With <code>r = 0</code> every shot goes the same way, so rings spread as concentric circles. The demo fires 16 bullets every second.</p>
{_demo('ring', 'Ring (16 bullets, no rotation)', [('c', 'Bullets', 1, 36, 1)])}
  <p>Slipping between rings is the basic way to dodge. More bullets mean narrower gaps.</p>

  <h2 class="rv" id="s3">A rotating ring is not a real spiral</h2>
  <p>Set the ring’s <code>r</code> to something other than 0 and the whole ring turns by <code>r</code> degrees each shot. With a short interval (0.12 s) and few bullets (3), the trails look like the arms of a spiral.</p>
{_demo('rotate', 'Rotating ring (3 bullets, every 0.12 s, turning 11°)', [('r', 'Rotation', -30, 30, 1)])}
  <p>But <strong>every bullet flies straight.</strong> It only looks like a spiral because the firing direction shifts a little each time. Danmaku Maker originally called this “spiral” too.</p>
  <p>Later I added a real spiral where the bullets themselves curve: for 8 seconds after firing, each one turns 30° per second in the same direction.</p>
{_demo('swirl', 'Real spiral (bullets curve 30° per second)')}
  <p>Compare them: the rotating ring’s arms straighten out as they travel, while the real spiral’s arms keep winding. Dodging differs too: with the rotating ring you step into the gap between arms; with the real spiral the arms sweep around toward you.</p>
  <p class="note">Changing the old “spiral” math would change the behavior of stages already published. So the old calculation stays as it is, hidden from the editor, and the real spiral was added as a separate pattern.</p>

  <h2 class="rv" id="s4">Aimed shots: odd and even counts need opposite dodges</h2>
  <p>Aim at where the player is at the moment of firing, and open a fan of <code>r</code> degrees around that direction.</p>
  <p><code>b = atan2(player y − emitter y, player x − emitter x)</code><br><code>θ = b + (j ÷ (c−1) − 0.5) × r°</code></p>
  <p>Whether the count is <strong>odd</strong> or <strong>even</strong> flips how it behaves:</p>
  <ul>
    <li><strong>Odd (e.g. 5)</strong>: the middle bullet (<code>j = (c−1)÷2</code>) has angle exactly <code>b</code>, so it flies <strong>straight at where you are now</strong>. Standing still gets you hit; keep drifting sideways.</li>
    <li><strong>Even (e.g. 6)</strong>: there is no middle bullet, so <strong>where you are now is exactly a gap</strong>. Standing still dodges it; panicking into a move gets you hit.</li>
  </ul>
  <div class="rv" style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center;align-items:flex-start">
{_demo('aimOdd', 'Aimed, odd (5 bullets)')}{_demo('aimEven', 'Aimed, even (6 bullets)')}  </div>
  <p>Hold the ship still in the demos to see the difference. Mixing odd and even aimed shots in one stage forces the player to choose between moving and staying.</p>

  <h2 class="rv" id="s5">Rain: scattered from the top of the screen</h2>
  <p>Rain ignores the emitter’s position: bullets start at a random x along the top edge and head almost straight down, varying by only <code>±0.15</code> radians (about ±8.6°).</p>
  <p><code>x = random × 360, y = −8, θ = 90° + (random − 0.5) × 0.3</code></p>
{_demo('rain', 'Rain (2 bullets every 0.25 s)')}
  <p>It looks random, but the random numbers come from <strong>a seed fixed per stage</strong> (mulberry32), so the same stage rains the same way for everyone. Otherwise luck would decide the rankings.</p>

  <h2 class="rv" id="s6">Sweeping fan: swinging around straight down</h2>
  <p>Centered on straight down (90°), the fan swings left and right on a sine wave from shot to shot. Its width is fixed at 0.5 radians (about 29°).</p>
  <p><code>center = 90° + sin(0.25 × k) × r°</code></p>
{_demo('sweep', 'Sweeping fan (swing 60°)', [('r', 'Swing', 0, 90, 1)])}
  <p>Raising the 0.25 in <code>0.25 × k</code> swings faster; raising <code>r</code> swings wider. The band of bullets ripples, so you dodge by reading the side it is coming back to.</p>

  <h2 class="rv" id="s7">Homing: it only turns for the first 2.5 seconds</h2>
  <p>Each frame, a homing bullet turns toward the player, but the turn per second is capped (<code>max(25°, 2 × |r|°)</code>), and it <strong>only homes for 2.5 seconds</strong> after firing. After that it flies straight.</p>
{_demo('homing', 'Homing (3 bullets)')}
  <p>If homing never stopped, bullets would circle the player until they hit. An undodgeable bullet is not hard, just unfair. “It follows you, but if you lure it in and sidestep, it misses” was the line where it still works as play.</p>

  <h2 class="rv" id="s8">The hitbox is smaller than it looks</h2>
  <p>In Danmaku Maker you are hit when <strong>the distance between a bullet’s center and the ship’s center is under 5.5 px</strong> (in code, distance squared under 30.25). Bullets are drawn with a 6 px colored radius, so a visual graze does not count. Making the hitbox smaller than the sprite is standard in bullet-hell games, and it is what makes squeezing through gaps fun.</p>
  <p>The screen also holds at most 1,600 bullets; anything beyond that is not fired. Phones keep up at that count, and it still nearly fills the screen.</p>

  <h2 class="rv" id="s9">Summary: tips for designing patterns</h2>
  <ul>
    <li><strong>Shape comes from the firing angle.</strong> Ring, aimed and sweep are each a one-line formula.</li>
    <li><strong>A rotating ring and curving bullets are different.</strong> Both look like a spiral, but you dodge them differently.</li>
    <li><strong>Use odd and even aimed shots on purpose.</strong> Odd says “move,” even says “stay.”</li>
    <li><strong>Randomness from a fixed seed.</strong> Same stage, same bullets.</li>
    <li><strong>Give homing a time limit.</strong> Do not make bullets that cannot be dodged.</li>
  </ul>

  <h2 class="rv" id="s10">Try building one</h2>
  <p>Ring, aimed and rain can be built straight away in <a href="/en/works/danmaku-maker/try/" hreflang="en" lang="en">the free browser version of Danmaku Maker</a> (no sign-up). Clear your own stage and you can send it to a friend by link. Spiral, sweeping fan and homing, plus flower, star, lasers, mines and many more, are in the <a href="/en/works/danmaku-maker/" hreflang="en" lang="en">iPhone and iPad app</a>.</p>
  <p><a class="btn" href="/en/works/danmaku-maker/try/" hreflang="en" lang="en">Build bullet patterns in your browser</a></p>
'''), 'date': '2026-11-07'})

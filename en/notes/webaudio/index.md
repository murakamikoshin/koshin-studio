# I could not listen, so I measured the waveform: building Japanese instruments with WebAudio for Sushi Stack

> A browser game with no audio files: koto, taiko and gong synthesized with WebAudio. I could not listen, so I set volume by measuring waveform peaks.

- URL: https://koshinstudio.com/en/notes/webaudio/
- Original (Japanese): https://koshinstudio.com/notes/webaudio/
- Published: 2026-10-09
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/webaudio/)

Development log of Sushi Stack / October 2026

  The sound of Sushi Stack (https://koshinstudio.com/en/works/) uses not a single audio file. Japanese instruments are synthesized on the spot with the browser’s audio feature (WebAudio). The problem was that I had no way to listen while I was building it. So I measured the waveform and adjusted the volume. This is written with the numbers left in my commits.

## Why no audio files

  Using external libraries or audio files would break the form where the game is delivered as one file (and works offline). So I synthesized the koto (plucked), taiko, hyoshigi (wooden clappers) and kane (gong) from WebAudio parts and composed the music in the yo scale (a Japanese scale).

- BGM: played by a look-ahead scheduler built on eighth notes. Its thickness changes in four steps with how full the tub is; the more dangerous it gets, the more taiko drums are added.

- Sound effects: the number and weight of sounds stack up in this order: merge, chain, otoro, spiny lobster / golden, golden with golden.

- I added a celebratory phrase for ranking up and for beating a personal best. There is a sound on/off button, and the setting stays on the device.

## I cannot listen, so I measure the waveform

  The balance of volume is something you would normally decide by ear. But in this work I could not listen. So I swapped the same synthesis functions onto a render-only audio part (OfflineAudioContext), wrote the sound out as a waveform, and measured the maximum amplitude (peak).

  The initial state was this:

- The jackpot sound peaked at 1.18. Above 1.0 the sound clips and distorts.

- The merge sound was 0.072. It was buried in the BGM and could not be heard.

  After adjusting, the sound effects lined up like stairs below the BGM peak of 0.179.

    Sound | Peak

    BGM (reference) | 0.179

    Merge | 0.16

    3-chain | 0.48

    Otoro | 0.49

    Golden | 0.85

    Jackpot | 0.81

  The distortion is gone, and I can confirm with numbers the order “the more rewarding the sound, the louder.” But whether it sounds pleasant to the ear cannot be told by this method.

## I re-drew the ranks from measurements, too

  The same day I reviewed the rank thresholds. I ran auto-play 12 times and took the score distribution:

    Mode | Score range | Moves placed

    Omakase | 12,532 to 22,413 | 172 to 267

    Menu | 20,992 to 46,395 | 171 to 306

  With the earlier criterion (legend = 30,000 points), an auto-play with no strategy reached the top rank. So I moved the thresholds above that (0 / 4,000 / 10,000 / 18,000 / 30,000 / 50,000 / 85,000). Menu scores come out about 1.8 times higher, so I stretched them by the same ratio. Both auto-plays now stop at “journeyman,” and from head chef up, it depends on skill.

  The next day I ran 120 games and measured the distribution (apprentice 6%, journeyman 32%, head chef 40%, master 14%, legend 8%). Auto-play is better than people, so it does not fall into the bottom two ranks. Those two are a layout meant to matter when humans play.

## I also changed how chains are shown

- I added the chain bonus to Omakase as well. Under the same conditions, the score nearly doubles.

- A 3-chain happened more than 20 times in a game and had no value. I now show the center-screen notice from 4-chain (2- and 3-chains only get floating text and sound).

## What I learned

> Even if you cannot listen, you can measure.

- Decide with numbers what you cannot decide by feel. Both the audio balance and the ranks were built on measurements.

- Being measurable is different from being verified. A waveform tells me whether there is distortion and the order of loudness. It does not tell me whether it is pleasant.

- Test a “criterion” against something that should break it. A criterion that let a strategy-less auto-play reach the top rank was not working as a criterion.

  The numbers in this article come from my commit record (September 7 and 8, 2026). The sizes of the pieces changed after those days (the conger eel article (https://koshinstudio.com/notes/anago/), in Japanese), so the current score ranges and thresholds differ from what is written here.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/webaudio/).

  More in English

- All English pages (https://koshinstudio.com/en/)

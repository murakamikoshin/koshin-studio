# Japanese text garbled in the CrazyGames preview: the file was correct, the cause was never found, so I escaped to ASCII

> One character broke in a game portal’s preview though the file bytes were correct. How I made the game immune without finding the cause.

- URL: https://koshinstudio.com/en/notes/ascii-text/
- Original (Japanese): https://koshinstudio.com/notes/ascii-text/
- Published: 2026-10-09
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/ascii-text/)

Development log of Sushi Stack / October 2026

  When I opened Sushi Stack (https://koshinstudio.com/en/works/) in a game portal’s preview, a report said that only the character 連 in “大連鎖！” (Big Chain!) appeared broken. I checked the file and the character was stored correctly. This is how I moved on, without knowing the cause, by making it a form that does not matter if it breaks, from my commit record.

## Only one character breaks

  The report came from the CrazyGames preview. When a chain happens in the game, “大連鎖！” appears on screen. That one character, 連, was rendered broken. The other characters were fine.

  I first checked the game file itself. The byte sequence was correct. So the file on my side was not broken. It had to break somewhere in the hand-off before it reached the portal, or somewhere in how the portal read it. The commit does not say where. I have not identified the cause.

## How to fix something whose cause you cannot find

  If the cause is outside my hands, I decided to make a form that does not matter wherever it breaks.

- Replace displayed text with ASCII-only notation. Do not write Japanese characters directly in the file. In scripts use \uXXXX, in HTML text and attributes use &#xXXXX;. Even if multi-byte characters get corrupted midway, ASCII has nothing to corrupt.

- Leave the replacement to a tool (tools/asciify.mjs). I write in Japanese, then run the tool. It gives the same result no matter how many times I run it. Comments stay in Japanese so they stay readable (they never appear on screen).

- Add a font that has the kanji to the end of the font stack. That also closes the path where a font lacks the character and it does not show.

## Two other problems found in the same check

- Emoji do not show on some devices. The globe and mobile-phone emoji are missing on some devices. I redrew them as SVG shapes.

- Floating text during a chain overlaps and cannot be read. Text that appears at nearby positions now moves upward to avoid overlap.

## The next day: do 14 languages fit in their boxes?

  The game supports 14 languages. Translations are often longer than the Japanese and overflow easily in the side column on PC (192 px wide) and inside cards. I added a tool that switches through the languages in turn and counts anything that sticks out of its parent box or scrolls sideways.

  The result: no overflow in 14 languages × 2 screen sizes. As with broken characters, “nothing overflows” is more reliable counted than eyeballed.

## What I learned

> When you do not know the cause, stop depending on the place where the cause is.

- A correct file does not mean a correct screen. The hand-off and the portal’s reading are things I cannot fix.

- Write down what you do not know. I still do not know why 連 broke. ASCII escaping did not fix the cause. It only made the game unaffected by it.

- Have a machine count visual breakage. Checking 14 languages by eye is not realistic.

  This article is written from my commit record (September 7 and 8, 2026). The cause of the broken character is not in the record, so it is not written here.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/ascii-text/).

  More in English

- All English pages (https://koshinstudio.com/en/)

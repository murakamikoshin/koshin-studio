# The same report for the third time: a SwiftUI button responded only on its text, and my two earlier “fixes” did nothing

> The “Won” and “Lost” buttons responded only on the text. Two earlier fixes (modifier order) did not work; I built the look inside a ButtonStyle and replaced six places. A mail-order article with coordinates had the same kind of root.

- URL: https://koshinstudio.com/en/notes/swiftui-hit-area/
- Original (Japanese): https://koshinstudio.com/notes/swiftui-hit-area/
- Published: 2026-10-17
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/swiftui-hit-area/)

Development log of the Toreca Dash app / August 2026

  The application-record screen of my app Toreca Dash has “Won” and “Lost” buttons. A report came: “the buttons only respond on the text; hard to use”.

  This was the third time I got that report (20 July, 1 August and 27 August). I had thought I had fixed it twice. The code said “fix”. And yet it had never been fixed.

  Written from my work log of 27 August 2026.

## The first two fixes did not work

  The first two times I “added .contentShape” and “moved .buttonStyle(.plain)”. The real issue was the order of the modifiers, and I had not got the order right.

  SwiftUI’s Button("Won") { … } has a label that is only text. Adding .frame().padding().background() outside to make it look bigger still leaves only the text responding to taps. The visible size and the tappable area were different things.

## The fix: build the look inside a ButtonStyle

  If you build the button’s look inside a ButtonStyle (the mechanism that defines a button’s appearance), the result is exactly the tappable area. Build it inside, not outside. I created an ActionButtonStyle and replaced six places (Won, Lost, Applied, enter announcement date, and “Apply” in two filters).

## Two similar items the same day

  Other reports that day had the same root.

- “Let me switch status in the deadline calendar.” I made the badge I had added earlier switch between “Applied” and “Not yet” on tap. But the row itself was a Button, so a button inside it did not respond. I changed the row to a tap gesture (contentShape + onTapGesture). Also Won and Lost are not switched, since they are “records”: a mis-tap that erases one cannot be undone.

- “Mailed, yet it has a location.” An article for Rakuten Books (mail order only) had coordinates in Shizuoka. I had judged mail order only by the site prefix, so aggregator-derived articles (a different prefix) slipped through. I now judge by store name too. Another cause: even after switching it to delivery, I had not cleared the coordinates and prefecture. If the prefecture remains, area filtering stops the article showing to users in other prefectures (mailed, yet shown only to people in Shizuoka).

## What I learned

> Before writing “fixed”, search for the same shape elsewhere.

- When the same report comes twice, doubt the fix. Even if the code says “fix”, it may not work.

- Visible size and responsive area are different things. Building inside a ButtonStyle makes them match.

- Look for the same shape on every screen. grep every place that is written the same way and fix them.

- Make irreversible records safe from mis-taps. Only “Applied” switches.

- When you correct a value, correct its related values. If you change to delivery, clear coordinates and prefecture too.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/swiftui-hit-area/).

  More in English

- All English pages (https://koshinstudio.com/en/)

- Toreca Dash (https://koshinstudio.com/en/works/torecadash/)

# If you throw failure away, the screen lies: a calendar that said “registered” with none added, a frozen OCR, a notification without a store name

> try? discarded failures, so the calendar showed “registered N events” with 0 added and could never register again, OCR failure froze the screen, and the notification buffer forgot the store name.

- URL: https://koshinstudio.com/en/notes/swallowed-failure/
- Original (Japanese): https://koshinstudio.com/notes/swallowed-failure/
- Published: 2026-10-17
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/swallowed-failure/)

Development log of the Toreca Dash app / August 2026

  In developing my app Toreca Dash, bugs of one kind appeared in a row: failures I had swallowed made the app show a false success. This article records three.

  Written from my work log of 25 August 2026.

## 1. “Registered N events” while none reached the calendar

  The app can export lottery deadlines to the iPhone calendar. A build warning (result of 'try?' is unused) led me to review it. try? is a Swift way of discarding a failure. The feature called save with try? store.save(...) and try? store.commit(), throwing failures away.

  As a result:

- Nothing reached the calendar, yet it said “Registered N events”.

- Only the “exported” record remained.

- Pressing again said “no new items to register”, so they could never be registered.

  The fix: return failures to the caller and count only successes. Devices with no default calendar are detected first and told. The messages are split by cause; before, every failure said “access is not allowed”.

## 2. When text recognition fails, the screen freezes

  The feature that reads text from an application image (OCR) also discarded failure with try? handler.perform([request]). If recognition failed, the callback was never called. The “reading…” spinner never stopped, and the only way out was to close the screen.

  The fix: on failure too, return to a “finished recognising (found nothing)” state.

  The build warning result of 'try?' is unused is a sign of swallowing. Run the build and read the warnings regularly.

## 3. A notification without the store name: forgotten in the buffer

  A different story with the same shape. A report said “the notification has no store name”. The article had the store name (sellerName) correctly. The notification did not show it.

  Lottery and reservation notifications are put in a buffer and sent in batches (to hold them in quiet hours and to limit the rate). But the store name was not carried into the buffer. When sending, looking for the store name found no information, and only the category (“LivePocket”) remained.

  This was partly surfaced by the earlier fix. When I fixed “the notification arrives under the name LivePocket”, I made it return null when the store name is unknown. That forgotten carry-over changed its symptom from “wrong store name” to “no store name”.

  The same gap existed in both buffers (by genre and by product), so I fixed both. For the 5 already buffered I filled in the store name from the article and confirmed it appears when sent.

  The same gap had happened on 17 August with another field (product names). The lesson: when putting something in a buffer, carry every field that will be used at send time. The other two buffers, which store the finished wording as is, do not have this problem.

## What I learned

> If you throw failure away, the screen lies.

- Return failures to the caller. Discarding them makes the display differ from reality.

- On failure too, return to a “finished” state. If a callback is never called, the screen freezes.

- Record success only on success. If it stays after a failure, you cannot retry.

- Read the build warnings. A try? warning is a sign of swallowing.

- Put every field used at send time into the buffer. The same gap shows up later in another field.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/swallowed-failure/).

  More in English

- All English pages (https://koshinstudio.com/en/)

- Toreca Dash (https://koshinstudio.com/en/works/torecadash/)

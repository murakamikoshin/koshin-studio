# The streaming buttons were shown even for titles you could not watch: making the quiz result screen true

> The anime quiz showed the same two streaming buttons for every title; about 29% were wrong. How I narrowed buttons by availability and fixed image problems.

- URL: https://koshinstudio.com/en/notes/result-screen/
- Original (Japanese): https://koshinstudio.com/notes/result-screen/
- Published: 2026-10-09
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/result-screen/)

Development log of the Anime Type Diagnosis / October 2026

  The result screen of the Hardcore Anime Type Diagnosis (https://koshinstudio.com/en/works/shindananime/) shows the cover of your title of fate and “where to watch” buttons. When I first built it, both the buttons and the images showed things that differed from reality. I recounted with my own data how large the difference was, and I am writing it down.

## The streaming buttons were the same two for every title

  In the first version, the streaming buttons on the result screen were only DMM TV and U-NEXT, the same two for any title. Pressing a button goes to that service’s search page. But the title is not necessarily available there.

  The quiz data includes, for each title, “which services stream it” (Filmarks streaming information). Of 6,091 titles, 4,489 (73.7%) have this. Counting whether the two buttons of that time really pointed to a place where you can watch, for these 4,489:

    The two buttons of that time | Titles | Share

    Both point to a place you can watch | 3,192 | 71.1%

    At least one points to a place you cannot watch | 1,297 | 28.9%

      of which both are places you cannot watch | 295 | 6.6%

  For one title in three or four, pressing the button did not find the title. It ended in “page not found.”

## The fix: narrow by real availability

- I increased the services from 2 to 12 (Netflix, Prime Video, Disney+, U-NEXT, Hulu, DMM TV, ABEMA, d Anime Store, FOD, TELASA, Lemino, Bandai Channel). I opened the search URLs in a browser to check them.

- Buttons are made only for services in that title’s availability.

- But showing all of them would stretch the result card too tall. I sort by major services first (priority Netflix, Prime Video, Disney+, U-NEXT, Hulu) and show only the top 3.

- For titles with unknown availability (the remaining 26.3%), there is no way to check, so I show the top 3 by popularity as before.

  Along the way I noticed that DMM TV’s search URL returned 404 (I changed /vod/search/ to /vod/list/).

  Availability is as of the time the data was collected. Streaming changes, so a title may not still be there when you press the button.

## The same thing was happening with images

  Some cover images were wrong or did not appear.

- http images do not appear. The quiz is served over https. If an image URL is http://, the browser blocks it as mixed content. (One official site had no certificate at all.) I treat http images as “none” and fill from an https image that comes later.

- Placeholder pictures were shown as real. “No image” placeholders and generic images shared by an official site are not the actual art. I now reject them.

- Logos got mixed in. Filmarks’ sharing image is a 240×240 square, and if the poster is not square, the company’s logo is put in the margin. I changed it to prefer another image embedded in the page (260×364, kept in the poster ratio). After re-fetching all 7,247 entries, the number using a poster-ratio image rose to 4,477 (89 are still in the old shape).

- No image at all. Most of the cause was that Annict and Filmarks split titles differently, so matching titles failed. By filling from images of the same series, the share with an image went from 77% to 86%.

  In the end, 92.5% of the 6,091 titles used by the quiz have an image.

## What I learned

> On a result screen, trust is decided less by looks than by “what happens when I press it.”

- Showing the same thing to everyone is easy, but wrong nearly 3 times in 10. Look at the real situation (availability) and narrow.

- Decide what to show when you “don’t know.” For the 26.3% with unknown availability, I fell back to the normal top 3.

- Reject what is not the real thing. Placeholders, generic images and images with a logo are worse than a blank, I decided.

  The shares in this article were counted on the quiz data (6,091 titles) as of October 8, 2026. The image counts come from the commit record (September 25, 2026).

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/result-screen/).

  More in English

- All English pages (https://koshinstudio.com/en/)

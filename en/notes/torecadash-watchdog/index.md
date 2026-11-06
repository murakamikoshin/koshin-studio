# iOS app freezes and is killed (0x8BADF00D): a SwiftUI computed property ran on every redraw

> An iOS app was force-quit by the watchdog (0x8BADF00D). A SwiftUI computed property re-filtered and re-sorted 951 articles on the main thread every body evaluation.

- URL: https://koshinstudio.com/en/notes/torecadash-watchdog/
- Original (Japanese): https://koshinstudio.com/notes/torecadash-watchdog/
- Published: 2026-10-09
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/torecadash-watchdog/)

Development log of Torecadash / October 2026

  For my iOS app, Torecadash, I received a report: “the app crashes a lot.” Reading the device log, I found that the app froze and was force-quit by the OS. The cause was that it recounted 951 articles every time the screen was redrawn. This is written from my commit history.

## What the log showed

  The hang log from the device had the exit code 0x8BADF00D and the line Failed to terminate gracefully after 5.0s. It means the OS (the watchdog) killed an app that did not respond within 5 seconds. The main thread was stuck in processing that went through NSKeyedArchiver. The device was also hot (Thermal State: serious), so work that normally finishes instantly took more than 5 seconds.

## The real cause

  What froze was the list of product articles in the “Following” tab, in a case with 951 articles.

  The article list (articles) was just a computed property. SwiftUI evaluates the view (body) many times, even when the article data has not changed. Each time, it redid four filters, a transformation and a sort over 951 articles on the main thread.

  Normally this finishes instantly, so you do not notice. Only when the device slows down from heat does it exceed 5 seconds and get killed.

## The fix

  I changed it to recompute on a background thread only when something actually changes: the article data, the receive mode, or the sort option. The result goes into a state for display (displayArticles, @State), so the main thread is no longer blocked.

  // (Illustration only. Not the actual code.)
// Before: every time body is evaluated
var articles: [Article] { fetched.filter…filter…map…sorted }

// After: compute in the background only on change, and keep the result
@State var displayArticles: [Article] = []
// recompute when fetchedArticles / receiveMode / sortOption change

## What I have not verified

  The only verification recorded in the commit is that xcodebuild succeeded (BUILD SUCCEEDED). There is no record that the freeze is gone on a real device. A hot device is hard to reproduce, so it is not easy to check. In this article I write “I identified the cause and changed the approach,” not “I fixed it.”

## What I learned

> Work that is instant on a normal day stops the app on a slow day.
  Computed properties are easy to write. But if you put one where it runs on every redraw, it gets slower in proportion to the amount of data. 951 items is not a small number. The obvious lesson, “decide where to put things by how often they are called,” came from a real device log.

  This article was written from the commit record (October 5, 2026).

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/torecadash-watchdog/).

  More in English

- All English pages (https://koshinstudio.com/en/)

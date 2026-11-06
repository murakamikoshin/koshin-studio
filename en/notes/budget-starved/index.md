# Checks that logged “deferred to next run” had never run: three time budgets counted from the same start

> A process had three stages whose time budgets were counted from the same start time, so the rotating 25 checks ran 0 times each run. “Deferred 18 items” meant all of them. I allocated from the job’s time limit and logged each step’s time.

- URL: https://koshinstudio.com/en/notes/budget-starved/
- Original (Japanese): https://koshinstudio.com/notes/budget-starved/
- Published: 2026-10-17
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/budget-starved/)

Development log of the Toreca Dash app / September 2026

  Behind my app Toreca Dash is a process that checks and fixes articles’ “sale type”. Inside it was a part that ran “25 checks in rotation”.

  On 11 September 2026, after adding a meter that times each stage, I learned that those 25 checks had never run once. The log kept saying “deferred 18 items to the next run for the time budget”. That “18” meant not some of them but all.

  Numbers come from my work log of 11 September 2026.

## Three budgets were counted from the same start time

  The process had three stages, each with a time budget.

    Stage | Budget | Measured

      ① Main loop | 420 s | uses all 425 s

      ② Always-run slot | 780 s (total) | only 360 s really usable; ends at 861 s

      ③ Rotating 25 checks | 700 s (total) | ② overruns 700 s, so 0 checks every time

  The three budgets were counted from the same start time: ① 420 seconds, ② 780 in total, ③ 700 in total. It looks as if each stage has room. But ② can only use 360 seconds of its 780 after ① used 425, and when ② ended (861 seconds), ③’s “700 in total” was long gone. ③ was judged “out of budget” before it started, every time: 0 checks.

  The log’s “deferred 18 items to the next run” meant sending everything to the next run, every time. “Next run” never came.

## The fix: do not widen by feel; allocate from the job’s time limit

  I stopped widening the numbers by feel. Instead I allocate from the job’s own time limit. The limit is written in one place (REPAIR_SALE_TYPES_TIMEOUT_SEC) and each stage’s deadline is that times a ratio.

    Stage | Deadline (share of the limit)

      ① Main | 23%

      ② Always-run slot | 67%

      ③ Rotation | 93%

  The limit became 1,800 seconds. Since each deadline is a share of the whole rather than a continuation of the previous stage, later stages keep their budget even if an earlier stage uses everything.

## Add a meter: which stage was heavy was invisible

  Another cause: I had widened the limit without knowing which of the 12 was heavy. So I log the seconds each step takes. Heaviest first as measured:

    Step | Time

      Attach replacement articles to hidden, already-notified ones | 119 s

      Find the application link from the QR in the announcement image | 102 s

      Fix the unit of the reference price | 48 s

      Copy the reference price | 46 s

      Fix articles with neither a link nor an application method | 41 s

## What I learned

> “Next run” only means something if a next run is certain.

- Counting budgets from the same start starves the later stages. If an earlier one uses it all, the later one has 0.

- Count the “deferred” log lines. If everything is deferred every time, it has never run.

- Allocate from the job’s total limit, not by feel.

- Measure each stage first. Widening limits without knowing what is heavy does not help.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/budget-starved/).

  More in English

- All English pages (https://koshinstudio.com/en/)

- Toreca Dash (https://koshinstudio.com/en/works/torecadash/)

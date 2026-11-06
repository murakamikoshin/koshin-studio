# Every deploy re-ran the daily jobs: 477 runs in 48 hours, 46.6% of that day’s Gemini cost

> A once-a-day job ran 43 times and used 46.6% of a day’s Gemini cost. Timed-out runs never wrote their last-run time, so every restart treated them as missed. A deploy at 08:00 also swallowed the digest.

- URL: https://koshinstudio.com/en/notes/rerun-on-deploy/
- Original (Japanese): https://koshinstudio.com/notes/rerun-on-deploy/
- Published: 2026-10-17
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/rerun-on-deploy/)

Development log of the Toreca Dash app / September 2026

  The back end of my app Toreca Dash runs many scheduled jobs. One of them was supposed to run once a day. Counting the logs for one day, it had run 43 times.

  This article is about the bug that turned up: every deploy (replacing the code and restarting) re-ran the daily jobs from scratch.

  Numbers come from my work log of 1 September 2026.

## 477 catch-up runs in 48 hours

  Jobs are triggered by cron. A restart loses any run scheduled at that moment, so on startup I look for jobs whose last run is too old and catch them up. The rule was “last run older than 1.05 × the interval”.

  Counting 48 hours, there were 477 catch-up runs. A daily job that repairs product links ran 43 times in a day and accounted for 46.6% of that day’s Gemini cost, 1,295 calls. It was pricing the same articles with the AI again and getting nothing new.

## The cause: the “it finished” record was not written

  A job that exceeds its time limit (540 seconds) is recorded as “timed out”. But JavaScript cannot stop a running job, so the job keeps running to the end after “timed out” is recorded.

  The problem was that the “last run time” was written only on success. If the job timed out, even if the body finished, no run time was written. On each restart the logic concluded:

- This job has no (or an old) last-run record.

- It is older than 1.05 × the interval, so it was missed.

- Run it now.

  A daily job re-ran on every restart. A few deploys a day make 43 runs.

## The fix: “recorded a timeout” and “did not run” are different things

  Even if a timeout was recorded, if the body finished, I now record the run as having happened. Only when it failed do I not record it.

  This fix had to come together with lowering the time limit. Lowering the limit alone does not stop the catch-ups if the run time is never recorded.

## The opposite problem: chasing too much, or too little

  The catch-up had the opposite flaw too. On 31 August my deploy landed exactly on 08:00. Cron fires only at that instant, so the 08:00 digest notification was never sent.

  The digest runs five times a day (6, 8, 12, 18, 21 h), an average of 4.8 hours apart, below the 6-hour minimum for catch-up, so it was treated as “wait for the next one”. But for users who chose that time, a whole day’s worth was lost.

  The fix: only for jobs that deliver something to users, check at startup whether the last 55 minutes of schedule were missed, and run once. Until 10 minutes after the scheduled time it waits, since it may just not have run yet.

  Do not extend this to all jobs. When I counted on real data, 33 jobs looked missed on every restart, and most had just been interrupted by it. Chasing them all would waste scraping and API limits. The rule for adding a job: if it misses a run, does something a user was owed disappear?

## What I learned

> “No record” does not always mean “did not run”.

- Write the run record after every outcome. Writing it only on success makes timed-out runs look unrun.

- Catch-up fails both ways. Chase deliveries; for the rest, wait for the next run.

- Count what runs at each deploy. The 477 in 48 hours was invisible until counted.

- Repeating the same work burns money. 46.6% of that day’s cost was calls that produced nothing.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/rerun-on-deploy/).

  More in English

- All English pages (https://koshinstudio.com/en/)

- Toreca Dash (https://koshinstudio.com/en/works/torecadash/)

# Measuring Qiita’s “posting too frequently” limit: a new account could not create another article for about 30 minutes

> After publishing, a new Qiita account could not create the next article. Checking the editor every 5 minutes, two measurements gave about 30 minutes; one was lost.

- URL: https://koshinstudio.com/en/notes/qiita-post-interval/
- Original (Japanese): https://koshinstudio.com/notes/qiita-post-interval/
- Published: 2026-10-09
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/qiita-post-interval/)

This site / October 2026

  I published summaries of this site’s articles on Qiita. But when I tried to create a second one right after the first, the new-article screen would not open and said “posting too frequently.” How long you have to wait did not seem to be written officially, so I measured it.

  I measured only this one new account (registered on October 8, 2026). This does not mean it is a general specification of Qiita.

## How I measured

- I record the time an article was published (for the first one, “14:19” from Qiita’s notification, which is only to the minute).

- Then about every 5 minutes, I open the “new article” screen in a logged-in browser. If it opens it is “allowed”; if I am redirected to the trend page it is “blocked.” I record this with the time.

- When it opens, I publish the next article right away and take the same record again.

- I did not do anything like slipping past the limit by posting. I only checked whether the screen opens.

## Results

    Interval | Previous article published at | Last blocked check | First allowed check | Publish until it opens

    1st → 2nd | 14:19 | 14:46:34 (blocked) | 14:51:50 (allowed) | about 27.6 to 32.8 min

    2nd → 3rd | 14:52:36 | 15:19:03 (blocked) | 15:24:18 (allowed) | about 26.5 to 31.7 min

    3rd → 4th | 15:24:59 | 15:30:29 (blocked) | 16:10:02 (allowed) | 5.5 to 45.1 min (unknown)

- The first and second were both around 30 minutes. The range exists because I only checked every 5 minutes. “It opened” somewhere between the last block and the first allow.

- The third is unusable data. The next check after 15:30:29 is not in the record until 16:10:02. The checks were not running for about 40 minutes (I have not confirmed why; the computer may have been asleep). The opening time is somewhere in there, and the interval is unknown.

- The wording “posting too frequently” could not be captured by the automatic check (I was only sent back to the trend page, and no message appeared). It is the wording I saw on my own screen.

## What I know and what I do not

> On this new account, I could not create the next article for about 30 minutes after publishing.

- Two measurements agreed at about 30 minutes. But it is only two. It is not a number that lets me say “exactly 30 minutes.”

- A personal blog from 2018 reported “you cannot post or edit for about 30 minutes after posting.” It is close to this measurement. But it is another person’s report from another time, and I do not know whether it is the same mechanism.

- I do not know whether it is a limit only for newly registered accounts or applies to ordinary ones too. I measured only one account.

- I also do not know whether the limit changes with the number of posts (from which post it gets longer), because the third was lost.

## Reflections on the measurement

- The check interval was 5 minutes. A 5-minute range was left each time. Checking every minute would shrink it.

- I did not notice that the checks had stopped. I needed a mechanism to warn me when there is no check record for a set time.

- The first publish time was only to the minute. I could take seconds only from the second onward, where I recorded the time myself.

## What I could not confirm

- Qiita’s official rule on posting interval (I looked, but found no public description).

- The interval for the third (the record is missing).

- The same measurement on other accounts.

- Whether the limit changes with the age of the account or the number of posts.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/qiita-post-interval/).

  More in English

- All English pages (https://koshinstudio.com/en/)

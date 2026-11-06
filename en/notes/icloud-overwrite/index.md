# A function named “load from iCloud if newer” compared nothing: a 20-record history could become 1

> The iCloud sync function never checked whether data was newer and replaced everything. A fresh device with an empty state could overwrite another device’s 20 records with 1. I added update-time comparison and never overwrite with empty.

- URL: https://koshinstudio.com/en/notes/icloud-overwrite/
- Original (Japanese): https://koshinstudio.com/notes/icloud-overwrite/
- Published: 2026-10-17
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/icloud-overwrite/)

Development log of the Toreca Dash app / August 2026

  My iPhone app Toreca Dash has a record of applications that users build up themselves: which lotteries they entered and how they turned out. It is a personal record built by hand, and once lost it cannot be recovered.

  On 23 August 2026 I read a file I had not yet reviewed (1,076 lines) and found a path where this record could vanish entirely. It began with trusting a function’s name.

  Written from my work log of 23 August 2026.

## The name says “if newer”; the body compares nothing

  The function that syncs with iCloud was named loadFromICloudIfNewer: “load from iCloud if it is newer”. But the body never checked whether anything was newer; whenever iCloud changed, it replaced everything with that content.

  What can happen:

- Device A has 20 records (and so does iCloud).

- Device B is installed fresh. iCloud’s first sync is asynchronous, so just after launch the records may be empty.

- On device B, one record is added, and saving overwrites iCloud with [1 record].

- Device A receives the change notice and goes from 20 records to 1 (19 lost).

  The code had an export/import feature, described as being “to prevent all data vanishing when you change phones”. The author knew this area was fragile.

## The fix: compare update times, and never overwrite with empty

- Store an update time (entriesUpdatedAt) on both device and iCloud, and import only when the other side is newer, so the function does what its name says.

- Even for old data with no time yet, always prevent overwriting with empty content.

- On the first restore on a new device, inherit iCloud’s time.

## What I learned

> A function’s name may state the spec, but the body may not match.

- Do not trust names; read the body. “IfNewer” compared nothing.

- Be extra suspicious of writes to data that cannot be recovered. A record built by hand does not come back.

- “Empty” is a dangerous value. Make “never overwrite with empty” the last line of defence.

- First sync is asynchronous. Empty right after launch does not mean no data.

- Read the unreviewed files. Large, old files hide the most.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/icloud-overwrite/).

  More in English

- All English pages (https://koshinstudio.com/en/)

- Toreca Dash (https://koshinstudio.com/en/works/torecadash/)

# Python splitlines() breaks JSONL: the culprit was U+2028, an invisible line separator

> Python splitlines() broke a JSONL file because 2 of 7,247 records contained U+2028 (LINE SEPARATOR). Why it happens and the one-line fix: split on the newline only.

- URL: https://koshinstudio.com/en/notes/u2028/
- Original (Japanese): https://koshinstudio.com/notes/u2028/
- Published: 2026-10-09
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/u2028/)

Development log of the Anime Type Quiz / October 2026

  While building the data for the Anime Type Quiz (https://koshinstudio.com/en/works/shindananime/), I fixed a bug where the JSON broke. The cause was splitlines(), a perfectly ordinary function.

## What broke

  The quiz data comes from Filmarks and is stored in data/filmarks_works.jsonl. JSONL puts one JSON object per line, and you read it by splitting into lines and passing each one to json.loads. In Python I had first written:

  for line in path.read_text(encoding='utf-8').splitlines():
    r = json.loads(line)
  But when a synopsis contained U+2028 (LINE SEPARATOR), that line was split in the middle, and json.loads was handed JSON that ended inside a string, and failed.

## What U+2028 is

  U+2028 is a Unicode character meaning “line separator.” It looks almost like a newline. In JSON, it is valid to put it raw inside a string, and the writing side (json.dumps(..., ensure_ascii=False)) outputs it as is.

  The problem was on the reading side. Python’s str.splitlines() splits not only on \n but also on Unicode line boundaries such as U+2028. split('\n') splits only on \n.

  s = json.dumps({"a": "x\u2028y"}, ensure_ascii=False)
len(s.splitlines())   # 2  (one line splits in two)
len(s.split('\n'))    # 1
  Passing each half to json.loads raises Unterminated string. The short example above reproduces exactly that.

## The numbers in the real data

  I recounted both ways on the current data file.

    How it is split | Number of lines

    split('\n') (real newlines only) | 7,247

    splitlines() | 7,255

  The difference is 8. Counting U+2028 in the file gave exactly 8, in the lines of 2 works. Two works out of 7,247, under 0.03%, were enough to make the whole file unreadable.

## The fix

  One line:

  - for line in path.read_text(encoding='utf-8').splitlines():
+ for line in path.read_text(encoding='utf-8').split('\n'):
  I left the reason in a comment so that my future self would not be puzzled: when making JSONL, the only line separator is \n, so reading should split on \n only.

## Why it is hard to notice

- You cannot see it. Depending on the editor, U+2028 looks like a newline or a space. Staring at the synopsis will not find it.

- It is rare. 2 of 7,247 works. While you test with a small sample, it may never show up. It is the kind of bug that appears only once you have fetched everything.

- The writer is correct. Nothing written is wrong as JSON. What broke it was the reader’s assumption about what a “line” is.

## One more fix from the same day

  The same commit fixed another bug caused by characters that look alike but are different. When matching titles, Annict’s ＜物語＞ (full-width angle brackets) and Filmarks’s 〈物語〉 (Japanese angle brackets) did not match even though they were the same work. NFKC normalization turns the full-width ＜＞ into half-width, but 〈〉 stays as it is, so I removed both from the comparison string.

  Both are the same lesson: characters are not always what they look like.

## What I learned

> A function I used “for newlines” had a wider idea of newlines than I assumed.
  When reading JSONL, do not use splitlines(). Split on the character the writer used as the separator (\n), or use for line in f:, which splits only on \n. I am writing it here for the next time the data grows.

  The numbers in this article come from recounting the data file on October 7, 2026.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/u2028/).

  More in English

- All English pages (https://koshinstudio.com/en/)

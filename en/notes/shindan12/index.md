# What changes when an anime quiz goes from 50 questions to 12?

> A 50-question anime quiz now gives a result after 12. Measured with 1,000 synthetic respondents: the type mostly matches, but the single recommended title changes a lot.

- URL: https://koshinstudio.com/en/notes/shindan12/
- Original (Japanese): https://koshinstudio.com/notes/shindan12/
- Published: 2026-10-09
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/shindan12/)

Development log of the Anime Type Diagnosis / October 2026

  The Hardcore Anime Type Diagnosis (https://koshinstudio.com/en/works/shindananime/) has 50 questions in total. People said it was long, so I made it possible to get a result from just the first 12 questions. The remaining 38 are for those who want to answer them.

  But the result must change a bit by being shorter. I wanted to know how much with numbers, not feelings.

## How the 12 were chosen

  The quiz measures taste on 6 axes (worldview, aftertaste, structure, subtaste, visuals, viewing style). The 12-question version takes 2 questions from each axis, 12 in total. The calculation that produces the result is the same as with 50; unanswered questions are simply not counted.

  The 50 questions are 18 on the 6 axes, 2 on image quality and era, and 30 on taste elements (romance, horror, robots and so on). The 12-question version does not ask the last two (era and taste elements), so they do not affect the ordering of titles.

## How I measured: 1,000 synthetic respondents

  I cannot quickly have real people answer both 12 and 50 questions. So I used synthetic respondents. I say this up front: the numbers below are not the results of real people.

- For each respondent, I draw a “true taste” as a random number from −1 to +1 for the 6 axes, era, and 30 taste elements.

- Each answer is that “true taste” plus noise, rounded to 5 levels (leans A, slightly A, neither, slightly B, leans B).

- These answers are run through the same calculation as the real app (logic.js), once using only 12 questions and once using all 50.

  I do not know the size of the noise. People’s answers wobble even in the same mood, so I measured with three values: small (0.3), medium (0.5) and large (0.8). The titles used are the 6,074 with enough clues on the axes.

## The type mostly matches even with 12

  First, whether the type code (6 letters) is the same with 12 and 50 questions.

    Answer noise | All 6 letters match | Match per letter

    Small (0.3) | 75.6% | 94.7 to 96.1%

    Medium (0.5) | 60.8% | 90.9 to 93.7%

    Large (0.8) | 43.2% | 85.5 to 87.6%

  Looking letter by letter, even with medium noise more than 90% fall on the same side. Matching all 6 letters gets harder because you have to be right six times in a row. Even with 90% per letter, six in a row is a little over half.

## The single “title of fate” changes a lot

  Next, the “title of fate” the quiz shows at the end. It is one pick out of 6,074 titles, so the situation is different.

    Answer noise | Same single title | Any of the top 3 in common

    Small (0.3) | 21.7% | 63.4%

    Medium (0.5) | 15.7% | 52.7%

    Large (0.8) | 12.4% | 39.9%

  The title shown with 12 questions comes first with 50 questions for about 1 person in 5 to 8. With medium noise, about half have something in common in the top 3.

## At which stage does it change?

  I checked whether the reason is only “the 30 taste-element questions.” Between 12 and 50, I inserted 18 questions on the 6 axes only (no taste elements or era) and compared the single title (medium noise, 600 respondents).

    Compared | Same single title

    12 and 18 (axes only) | 33.8%

    18 and 50 | 27.5%

    12 and 50 | 15.0%

  Even just adding 6 axis questions before adding taste elements changes the single title for 2 in 3 people. When choosing one out of 6,000, a small difference in input reshuffles the order. It was not that “taste elements are doing harm.”

## Is 50 questions really closer to the right answer?

  In this setup I know the “true taste,” so the one title chosen from it can be treated as the correct answer. Do 12 and 50 get closer to it (medium noise)?

     | Same as the correct title | In the correct top 3

    12 questions | 8.2% | 14.9%

    50 questions | 14.3% | 28.5%

  50 questions is about 1.7 to 1.9 times closer to the correct answer. With small noise, the difference is 17.9% to 29.0% (single title) and 29.0% to 52.6% (top 3). The remaining 38 questions were not wasted. But even with 50, hitting the exact single title is a little over one in ten.

## Weak points of this measurement

- The respondents are synthetic. Real people’s tastes are not scattered like random numbers, and they are noisy in different ways.

- The noise size is a placeholder. That is why I measured with three values; I do not know the true one.

- The “correct answer” is correct on the quiz’s own yardstick. Whether it is something a person would really love is not measured.

- What I measured is “is it the same,” not “is it fun.”

## What I learned

> The type is set even when short. The single title of fate wobbles each time you add questions.
  The current design of giving a result at 12 questions and making the rest optional does not contradict these numbers. If you only want to know your type, 12 questions are enough, and only those who want a more accurate single title need continue. I think the result screen should say it that way.

  What I really want to check is real people’s answers: showing the same person the 12-question and the 50-question result and asking which feels right. If I get that far, I will write it in the next record.

  The measuring script is in the quiz’s repository (random numbers are fixed, so the same numbers can be reproduced).

  Take the quiz (https://koshinstudio.com/app/shindananime/en/)About the quiz (https://koshinstudio.com/en/works/shindananime/)

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/shindan12/).

  More in English

- All English pages (https://koshinstudio.com/en/)

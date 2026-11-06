# “80% was chosen over 82%”: the quiz’s match percentage disagreed with its ranking

> An anime quiz’s match percentage used a different yardstick from its ranking. With the old display, 35 to 40% of 1,000 synthetic respondents saw a reversed top 3.

- URL: https://koshinstudio.com/en/notes/match-percent/
- Original (Japanese): https://koshinstudio.com/notes/match-percent/
- Published: 2026-10-09
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/match-percent/)

Development log of the Anime Type Diagnosis / October 2026

  At the end, the Hardcore Anime Type Diagnosis (https://koshinstudio.com/en/works/shindananime/) shows “the one anime of fate” and two runners-up. Each has a number like “match 82%.” At one point this number disagreed with the ranking: “a title at 80% was chosen over a title at 82%.” I have re-measured how large the disagreement was, and I am writing it down.

## The number and the ranking used different yardsticks

  The quiz measures taste on 6 axes and computes a “closeness” (cosine similarity) for each title. But the final order is not decided by closeness alone. It is ordered by closeness × 0.82 plus the title’s rating (stars), popularity, era and taste elements (total).

  However, the match percentage on screen was built from closeness alone. The order was by the total and the display by closeness: two yardsticks. A title could rank first by total but have a lower closeness than second place. Then the screen showed “1st 80%, 2nd 82%.”

## The fix

  I changed it so the percentage comes from the same total as the order (September 25, 2026). The same day I fixed another contradiction in the display. Even when an axis bar’s value was exactly 0, it showed “leans X 50%.” It said it leaned when it did not. I made the minimum 51%.

## How big was the disagreement? Measure it

  The commit of the time does not keep the proportion. So I measured with the same 1,000 synthetic respondents (answering all 50 questions) as in the 12-question article (https://koshinstudio.com/notes/shindan12/) (in Japanese). For the top 3 titles, I compare how the screen display would look in three ways.

- Old: integer % computed from closeness.

- Middle: integer % computed from total.

- Now: % to one decimal place computed from total.

  I counted two things. “Reversal” is when the 1st place % is lower than the 2nd or 3rd place %. “Tie” is when 1st and 2nd look like the same %. Answer noise is small (0.3), medium (0.5) and large (0.8).

    Display | Answer noise | Reversal | 1st and 2nd tied

    Old (closeness, integer) | Small | 40.3% | 14.1%

    Medium | 37.7% | 15.3%

    Large | 35.1% | 15.3%

    Middle (total, integer) | Small | 0.0% | 31.7%

    Medium | 0.0% | 30.1%

    Large | 0.0% | 27.7%

    Now (total, one decimal) | Small | 0.0% | 3.6%

    Medium | 0.0% | 3.9%

    Large | 0.0% | 3.8%

  With the old display, the top three were shown in reversed order for 35 to 40% of respondents. By this calculation about 2 in 5 people saw “the chosen first place is lower than the runner-up.”

## Fixing it produced another problem

  Computing from the total made reversals 0%. But with integer percentages, 1st and 2nd looking like the same % rose to around 30%. The top has titles with close totals. Rounding to integers erases the difference and they gather on the same number.

  So I changed the display to one decimal place (like 99.6%). Ties dropped to about 4%. It does not reach 0% because sometimes the totals really differ by less than 0.1%.

## Weak points of this measurement

- The respondents are synthetic. Real people answer differently.

- “Old” is a reconstruction: today’s ordering with the old display method applied. I did not run the code of that time. At the time, ratings and taste boosts had no cap, and the results may have differed.

- What I measured is only “does the display agree with the ranking,” not “is the ranking right for that person.”

## What I learned

> Make the number you show from the same yardstick you used to sort.
  It sounds obvious, but as calculations were added, only the order changed and the displayed number was left behind. Another point: rounding can erase a difference in rank. Where differences are small, just adding one digit brings back the visible order.

  The numbers in this article were measured on October 8, 2026 with 1,000 synthetic respondents (random numbers fixed). The commit record of that time is September 25, 2026.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/match-percent/).

  More in English

- All English pages (https://koshinstudio.com/en/)

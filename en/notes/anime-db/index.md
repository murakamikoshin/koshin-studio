# From 16,177 titles to 6,091: how the anime quiz database was built by dropping over 60%

> An anime quiz picks from about 6,000 titles. Where they came from, the criterion that cut 62.3% of 16,177, what remains, and the biases of the method.

- URL: https://koshinstudio.com/en/notes/anime-db/
- Original (Japanese): https://koshinstudio.com/notes/anime-db/
- Published: 2026-10-09
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/anime-db/)

Development log of the Anime Type Diagnosis / October 2026

  The Hardcore Anime Type Diagnosis (https://koshinstudio.com/en/works/shindananime/) picks your “one anime of fate” from a database of more than 6,000 titles. Where did these 6,000 come from, and how were they narrowed down? This is how the quiz’s data was built, from the repository’s commits and the current real numbers.

## Three sources

- The title list of Annict (an anime tracking service): 15,971 entries.

- Anime on Filmarks (a movie and anime review service): 7,247 entries.

- My own list of classics: about 500 titles.

  The same title is merged into one. After merging there are 16,177 entries. From these I keep only what is usable for the quiz.

## The criterion for keeping: “clues to place it on the axes”

  The quiz describes each title on 6 axes (worldview, aftertaste, structure, subtaste, visuals, viewing style) and picks by closeness to your answers. So each title needs enough “clues to place it on the axes.”

  The clues are estimated from the number of words that appear in reviews (the review text itself is not kept; only the number of words is counted). Disparaging phrasing and negations such as “the animation collapsed” or “I did not cry” are not counted. A phrase like “god-tier animation” is not double counted. This “richness of clues” is given as a number from 0 to 1, and titles below 0.25 are dropped.

  Also, by default I exclude continuations of TV series and spin-off theatrical films (such as Doraemon or Conan movies). Standalone original films are kept.

     | Count | Share

    Titles after merging | 16,177 | 100%

    Dropped for too few clues | 10,086 | 62.3%

    Kept (the database) | 6,091 | 37.7%

  More than 60% of titles were dropped because they lacked clues. The quiz also does not use titles whose values on every axis are close to neutral (absolute value 0.15 or less). That removes 17 more, so the quiz actually uses 6,074 titles.

## What the remaining 6,091 look like

  The data was made on September 25, 2026, and I counted it again on October 8.

    Source | Titles

    Listed on both Annict and Filmarks | 4,354

    Filmarks only | 1,077

    Annict only | 619

    My classics list only | 41

    Richness of clues | Titles | Share

    0.8 or more (plenty) | 3,388 | 55.6%

    0.6 to 0.8 | 639 | 10.5%

    0.4 to 0.6 | 1,148 | 18.8%

    0.25 to 0.4 (barely) | 916 | 15.0%

  The median richness is 0.92. But 15% passed only barely. The axis values for these titles are less certain than for the others.

    Decade of broadcast | Titles

    2020s | 2,591

    2010s | 1,996

    2000s | 926

    1990s | 291

    1980s | 166

    1970s | 83

    1960s | 20

  Titles from 2000 onward make up 90.5%. I think older titles tend to have fewer words in reviews and find it harder to meet the criterion (this is a guess, not confirmed). Titles with an image number 5,632 (92.5%).

## Weak points of this method

- It is biased toward new and much-discussed titles. The more words in reviews, the more likely a title stays. Older titles and those rarely discussed are likely to drop. The quiz has a decade question that decides how much to downweight older titles, but the pool itself already leans toward newer ones.

- The number of clues is “how much was said,” not “taste.” Estimating 6 axes from word counts is a rough approximation.

- The data is as of when it was made. New titles have to be added every season.

## What I learned

> Most of the “6,000 titles” turned out to be “what was left of 16,000 after keeping those with clues.”
  It is tempting to say “covers all anime,” but in fact more than 60% were dropped for lack of clues. I think writing down how many I dropped and the criterion for keeping is what makes the quiz honest.

  The numbers in this article come from the quiz’s data (made on September 25, 2026 and recounted on October 8). Titles, review contents and rating scores are not included.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/anime-db/).

  More in English

- All English pages (https://koshinstudio.com/en/)

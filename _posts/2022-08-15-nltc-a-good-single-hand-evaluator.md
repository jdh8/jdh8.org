---
layout: post
title: NLTC, a good single hand evaluator
categories: Bridge
tags: ["Hand evaluation", Bidding]
---
Inspired by [Thomas Andrews' article on single hand evaluators][singeval],
I want to check out how good such an evaluator NLTC is.  Since LTCs need an
established trump fit, we only consider suit offense tricks, i.e. the most
tricks a partnership can take in any suit contract.

Thomas built his data with Matt Ginsberg's (GIB) double dummy library
containing 700K+ deals.  However, available sources of that library are long
gone.  To achieve similar statistical power, I would have to solve about 1M
deals.  Thanks to [DDS][dds], the well known double dummy solver in C++, along
with modern computer architecture, we can solve 1M deals within one day.

I generated all data in this article with my [bridge utility][bridge].  It took
8 hours to solve 1M deals for only suit contracts.  The following is the
correlation coefficient matrix of various evaluations.

[singeval]: https://bridge.thomasoandrews.com/valuations/original.html
[dds]: https://github.com/dds-bridge/dds
[bridge]: https://github.com/jdh8/Bridge

 Tricks   | HCP+     | BUM-RAP+ | LTC      | NLTC     | ALTC
---------:|---------:|---------:|---------:|---------:|---------:
 1        | 0.508270 | 0.512822 |-0.482577 |-0.521692 |-0.516951
          | 1        | 0.987782 |-0.861016 |-0.927226 |-0.903264
          |          | 1        |-0.831184 |-0.943001 |-0.915663
          |          |          | 1        | 0.919761 | 0.935646
          |          |          |          | 1        | 0.979818
          |          |          |          |          | 1
{:.monospace}

The plus sign stands for short-suit points in [GIB bid descriptions][gibbids].
As BUM-RAP gives fractional points, I made such an adjustment more rigorous.

- S = (void = 3, singleton = 2, doubleton = 1)
- *X*+ = max(*X*, S, *X* + S &minus; 1) for each suit

As for how this adjustment is slightly better than max(*X*, S) and *X* + S,
there will be a separate article.

[gibbids]: https://www.bridgebase.com/doc/gib_descriptions.php

ALTC is what Jeff Rubens suggested.  Adjust &minus;0.5 losers for each held ace
and +0.5 for each guarded queen.  NLTC bears this in mind but adjusts for
missing aces and queens instead.

Things are different when we add up evaluations in each partnership.  LTCs are
less additive than HCP+.  I think this phenomenon arises from counting values
twice.  A classic example is that a long suit in one hand and the corresponding
doubleton in another are both counted as values a priori.

 Tricks   | HCP+     | BUM-RAP+ | LTC      | NLTC     | ALTC
---------:|---------:|---------:|---------:|---------:|---------:
 1        | 0.861012 | 0.870637 |-0.749171 |-0.839970 |-0.813800
          | 1        | 0.987937 |-0.832577 |-0.910715 |-0.880367
          |          | 1        |-0.804589 |-0.924311 |-0.890025
          |          |          | 1        | 0.922495 | 0.940156
          |          |          |          | 1        | 0.974347
          |          |          |          |          | 1
{:.monospace}

Using NLTC in bidding
---------------------
NLTC is more a single hand evaluator than an additive one.  It is good to use
NLTC for suit-oriented initial actions like preemptive openings and overcalls.
Consider using additive point counts to assess supports.

The exact ranges of NLTC for preemptive openings are up to partnership
agreement.  I'd still like to point out some problems if you try to migrate
from LTC to NLTC.

### Don't directly apply the rule of 2, 3, 4

With the plain LTC, we estimate the minimum playing tricks to be 13 &minus;
LTC.  However, NLTC counts more losers than LTC, especially in single suiters.
NLTC counts x and xx as 1.5 and 2.5 losers respectively, i.e. each 0.5 more
than LTC.  Single suiters are rich in singletons and doubletons.  Besides, it
is discouraged to preempt with a void.  In general, NLTC intrinsically counts
1--1.5 more losers than LTC for single suiters.  I am still not sure how to map
NLTC to preemptive bids.  There is going to be an update if I finally figure it
out.

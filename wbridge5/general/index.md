---
layout: cc
title: General understandings
---
Wbridge5 is a closed-source program, so some mechanisms are still unknown.
Moreover, this is a bidding book for humans, who cannot run millions of
simulations while bidding.  Therefore, there must be some adjustments from
original methods.

Notations
---------
4♥ refers to a bid or a contract.  "4 hearts" means 4 cards of hearts.
♥4 is a spot card.

Patterns are shown with hyphens, e.g. 5-4-3-1 refers to a hand with a 5-card
suit, a 4-card suit, a 3-card suit, and a singleton.  Shapes are shown with
equal signs, e.g. 5=4=3=1 means 5 spades, 4 hearts, 3 diamonds, and 1 club.

Hand evaluation
---------------
Wbridge5 mainly uses point-count system for bidding.  One counts only honors
for notrump contracts and defensive values, with distribution points combined
for suit contracts.  The losing trick count helps evaluate distributed hands
for suit contracts.

### High card points ###
<dl>
  <dt>Ace</dt>   <dd>4 HCP</dd>
  <dt>King</dt>  <dd>3 HCP</dd>
  <dt>Queen</dt> <dd>2 HCP</dd>
  <dt>Jack</dt>  <dd>1 HCP</dd>
</dl>

### Distribution points ###
<dl>
  <dt>Void</dt>		 <dd>3 points</dd>
  <dt>Singleton</dt> <dd>2 points</dd>
  <dt>Doubleton</dt> <dd>1 point</dd>
</dl>

__HCP__ refers to high card points.  Simply __points__ refers to HCP +
distribution points.

### Refined honor points ###
Wbridge5 makes some adjustments for 10s and unguarded honors, but I have not figure
out its rules.  Luckily, [Thomas's Bridge Fantasia][thomas] provides precise evaluators
friendly to humans.

#### Binky ####
Binky is a theoretical evaluator impossible for a human player to use.  To
obtain Binky points, one looks up an exhaustive table for every pattern and
holding.  This evaluator is regarded as a reference here.

#### Fifths ####
The [Fifths][fifths] evaluator is the perfect evaluator for 3NT.  It is
good for other notrump contracts too.  Its [correlation][corr] to real notrump
tricks is 0.931, near to Binky's 0.947.

<dl>
  <dt>Ace</dt>   <dd>4.0 HCP</dd>
  <dt>King</dt>  <dd>2.8 HCP (↓ 0.2)</dd>
  <dt>Queen</dt> <dd>1.8 HCP (↓ 0.2)</dd>
  <dt>Jack</dt>  <dd>1.0 HCP</dd>
  <dt>Ten</dt>   <dd>0.4 HCP (↑ 0.4)</dd>
</dl>

#### Bum-rap ####
The Bum-rap evaluator is good for suit contracts.  With distribution points
added, its [correlation][corr] to real tricks is 0.914, near to Binky's 0.925.

<dl>
  <dt>Ace</dt>   <dd>4.5 points (↑ 1/2)</dd>
  <dt>King</dt>  <dd>3 points</dd>
  <dt>Queen</dt> <dd>1.5 points (↓ 1/2)</dd>
  <dt>Jack</dt>  <dd>0.75 points (↓ 1/4)</dd>
  <dt>Ten</dt>   <dd>0.25 points (↑ 1/4)</dd>
</dl>

[corr]:   http://bridge.thomasoandrews.com/valuations/binky-evaluated.html
[fifths]: http://bridge.thomasoandrews.com/valuations/cardvaluesfor3nt.html
[thomas]: http://bridge.thomasoandrews.com/valuations/

### Additional distribution points ###
[Thomas][thomas] has not justified these point-adding systems popular in
France, but the Wbridge5 program uses them.

#### Length ####
Add 1 point for the 6th card and thereafter in every suit.

#### Fit ####
While this is not documented in Wbridge5, I believe the program uses it
secretly from my observation on its bidding.

<dl>
  <dt>The 9th card</dt> <dd>1 point</dd>
  <dt>The 10th card</dt> <dd>2 points</dd>
  <dt>The 11th card and thereafter</dt> <dd>1 point</dd>
</dl>

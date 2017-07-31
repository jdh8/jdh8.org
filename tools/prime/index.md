---
layout: page
title: Primality test
---
Please enter a positive integer less than 2<sup>32</sup>.  [Deterministic
Miller–Rabin primality test][mr] is in use.  There is also [implementation in
C][c].

[c]: https://gist.github.com/jdh8/57c5f097e970bfe260e2
[mr]: https://en.wikipedia.org/wiki/Miller%E2%80%93Rabin_primality_test#Deterministic_variants_of_the_test

<input required id="num" type="number" max="4294967295" min="0" step="1">
<p id="result">&nbsp;</p>

<script src="prime.min.js"></script>
<script src="dom.js"></script>

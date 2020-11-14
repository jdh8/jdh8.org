---
layout: post
title: How to write math functions
---
Writing math functions seems to be a mission impossible, especially writing
ones as fast and as precise as the ones in your systems.  Nevertheless,
somebody managed to do that, like the ones who wrote the math functions in your
computers, phones, calculators, and game consoles.  Some of them are open
source, like glibc and musl.  There are also fine ones in [metallic][metallic],
as a shameless plug.

[metallic]: https://github.com/jdh8/metallic

Some may think math functions are better implemented as hardware instructions.
However, the trend is to have the hardware deal with only basic operations
after decades of evolution.  The only popular architecture with transcendental
instructions is arguably x87.  Therefore, we usually implement math functions
with required operations in IEEE 754 and type punning.

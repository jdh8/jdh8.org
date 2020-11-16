---
layout: post
title: How to write mathematical functions
---
It is achievable to write fast and precise mathematical functions.
There are cutting-edge implementations in computers, phones, calculators,
and game consoles.  Some of them are open source, like glibc and musl,
from which we can learn the state of the art.  I have also been working
on mathematics in [metallic][metallic], as a shameless plug.

[metallic]: https://github.com/jdh8/metallic

Mathematical functions are usually written software instead of hardware
instructions.  The trend is to have the hardware deal with only basic
operations after decades of evolution.  The only popular architecture
with transcendental instructions is arguably x87.  Mathematical
functions are usually computed with only required operations in IEEE 754
and integer operations via type punning.

Target system
-------------
### Instruction set
Which instructions are on the target system?  C operators are probably
supported.  Other operations are less available even if they are
_required_ by IEEE 754.  For example, `fmod` rarely compiles to a single
instruction.  It is usually done by long division, which in turn
translates to a series of integer operations or partial remainder
instructions.

### Programming language

Rounding
--------
### Double rounding

### Exact arithmetics

Approximation
-------------
### Table maker's dilemma

### Remez algorithm

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
instructions.  This is also an example where operators in other
programming languages can be more expensive than expected, like `%` in
JavaScript or Python.

### Programming language
It is recommended to implement mathematical functions in C.  Its
contractions allow long expressions to be evaluated in a fast and
precise way.  For instance, `a * b + c` can compile to a fused multiply–
add for supporting platforms.  On the other hand, explicitly assign to
an intermediate to force rounding.

```c
// Nearest integer for a nonnegative argument
float nearest(float x)
{
    const float rectifier = 0x1p23f;
    float y = x + rectifier;
    return y - rectifier;

    // Wrong: can be optimized to (x + 0)
    return x + rectifier - rectifier;
}
```

Rounding
--------
Rounding half to even is the default rounding in IEEE 754.  The roundoff
error of a series of operations by this unbiased rounding is only
proportional to the square root of the number of operations.  This will
be the implied rounding method throughout this article unless otherwise
specified.

### Double rounding
Rounding to nearest is non-associative.  If we round 1.49 to the nearest
tenth and then to the nearest integer, it becomes 2.  Rounding to
midpoints must be avoided in intermediate roundings.

Rounding to odd is a good intermediate rounding for binary numbers.
Inexact numbers are rounded to the nearest number with an odd
significand.  This preserves the result of the final rounding because
only numbers with even significands can be midpoints or exact in a
coarser precision.  Rounding to odd is also associative like directed
roundings as values between representations are unanimously rounded to
either of them.

- [When double rounding is odd](https://hal.inria.fr/inria-00070603v2/document),
  by Sylvie Boldo and Guillaume Melquiond
- [GCC avoids double rounding errors with round-to-odd](https://www.exploringbinary.com/gcc-avoids-double-rounding-errors-with-round-to-odd/),
  by Rick Regan

### Exact arithmetics

Approximation
-------------
### Table maker's dilemma

### Remez algorithm
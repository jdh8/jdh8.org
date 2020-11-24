---
layout: post
title: How to write mathematical functions
category: Numerical analysis
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

### Exact addition
Exact error of addition can be obtained with default rounding.  This
technique is useful for storing precise intermediates to stop
propagation of error.  The idea is to find exact <var>s</var> +
<var>e</var> = <var>a</var> + <var>b</var>, where <var>s</var> is the
rounded sum, and <var>e</var> is the error term.  Exact error term is
defined where the rounded sum does not overflow.

Compensated summation by 3 operations produces precise results with
preconditions.  The base of the floating-point system (`FLT_RADIX`) can
be at most 3, and logb(<var>a</var>) ≥ logb(<var>b</var>).

```c
s = a + b;
e = a - s + b;
```

One can generalize algorithm by a comparison and a branch, as
|<var>a</var>| ≥ |<var>b</var>| implies logb(<var>a</var>) ≥
logb(<var>b</var>).  Branching is inefficient, though.  There is another
unbranched algorithm of 6 operations working most of the time.  Given
finite rounded sum, this algorithm overflows only if an operand is the
largest finite representable number or its negative.

```c
s = a + b;
x = a - s;
y = b - s;
e = (a + x) + (b + y);
```

- [On the robustness of the 2Sum and Fast2Sum algorithms](https://hal-ens-lyon.archives-ouvertes.fr/ensl-01310023v2/document)
  by Sylvie Boldo, Stef Graillat, and Jean-Michel Muller

### Exact multiplication
First, a `double` is large enough to store exact product of every pair
of `float`s, enormous or tiny.  This is straightforward and fast if
double-precision multiplication is supported, which is assumed unless
proven otherwise.

```c
double multiply(float a, float b)
{
    return (double)a * b;
}
```

Then, we try to find <var>s</var> + <var>e</var> =
<var>a</var><var>b</var>.  If you happen to have FMA instruction
available, don't hesitate to use it.  This can be determined by
`FP_FAST_FMA[FL]?` macros in C.

```c
s = a * b;
e = fma(a, b, -s);
```

Next, without all the hardware witchcraft, we can still count on
schoolbook multiplication.  With even number of significant digits, one
can equally split them and obtain the higher part with a bitwise AND.

Moreover, one can equally split a binary significant with default
rounding.  If the number of significant bits is odd, the split is done
with 3 instructions and risk of overflow for huge inputs.  Take IEEE 754
double precision for example, which has 53 significant bits.  Its magic
multiplier is 2<sup>27</sup> + 1, where 27 = (53 + 1) / 2.

```c
double split(double x)
{
    double s = (0x1p27 + 1) * x;
    double c = x - s;

    return s + c;
}
```

Subtract the returned higher part from the argument to obtain the
lower part.  Each part is guaranteed to have at most 26 significant
bits.  The possibility that the two parts can have opposite signs
covers that seemingly lost bit of information.

Approximation
-------------
### Table maker's dilemma

### Remez algorithm

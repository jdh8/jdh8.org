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

### Table maker's dilemma
The cost of a correctly rounded transcendental function is unknown
unless probed with brute force.  Faithfully rounded versions are much
faster and generally preferable, i.e. the returned results can be
rounded either up or down.  This is because no matter how precise
intermediate results are, they can be close to a turning point of the
given rounding, like a midpoint of two representable numbers in rounding
to nearest or a representable number in a directed rounding.  For
example, <var>x</var> is a mathematical result equal to
<var>x</var><sup>\*</sup> + 0.49 ulp, where <var>x</var><sup>\*</sup> is
an exact floating-point.  An exquisite approximation gives
<var>x</var><sup>\*</sup> + 0.51 ulp, which is only 0.02 ulp off.
Nevertheless, it becomes <var>x</var><sup>\*</sup> + 1 ulp after default
rounding, which is 1 ulp off from the correctly rounded
<var>x</var><sup>\*</sup>.

An algebraic function can be made correctly rounded by solving its
polynomial equation at the turning point and compare the result.
However, this extra cost is not always welcome if faithful rounding is
enough for the spec.  Cubic root is not required to be correctly rounded
in IEEE 754.  As a result, it is implemented as faithfully rounded in
metallic.  Its error can be even larger in glibc and other C libraries.

- [Errors in math functions (glibc)](https://www.gnu.org/software/libc/manual/html_node/Errors-in-Math-Functions.html).
  This article states that their `cbrtf` is faithfully rounded while
  `cbrt` can incur an error of 3 ulp.

Approximation
-------------
### Argument reduction

### Remez algorithm
Remez exchange algorithm is an interative minimax that minimizes error
of a rational approximation of a function.  The best explanation of this
algorithm I found is [from the Boost libraries][boost].  I recommend
[Remez.jl][remez.jl], a public module in the Julia language.  It works
out of the box after installation.

[boost]: https://www.boost.org/doc/libs/1_75_0/libs/math/doc/html/math_toolkit/remez.html
[remez.jl]: https://github.com/simonbyrne/Remez.jl

For example, the following snippet finds a quintic approximation of
2<sup><var>x</var></sup> in [-0.5, 0.5] with minimax absolute errors.
The last argument is 0 because we want a polynomial, whose denominator
is constant (of degree 0) if regarded as a rational function.

```jl
import Remez

N, D, E, X = Remez.ratfn_minimax(x -> 2^x, (-0.5, 0.5), 5, 0)
```

The variables `N`, `D`, `E`, `X` are filled respectively with the
numerator, the denominator, the maximum error, and coordinates of the
extrema of the error.  In this case, we are interested in `N` and `E`
only.  If the snippet is run in the REPL, it is straightforward to
inspect variables.

```
julia> N
6-element Array{BigFloat,1}:
 1.000000075489570475572779794395844118951112905200712713320943557819539899495158
 0.6931472254087463335017125386919482653892870189749332813071956686258532912523762
 0.240221073743231850648976794579911538382218748758607600525638479145201183035736
 0.05550297297715658754616473211294955443754414233482966738252485266340806305907259
 0.00967603635813692980671471668302651117643390961277773275960600973510019542544693
 0.001341000536192704201450246154614164578606130077333414968207795258574915422524853

julia> E
7.558205929025332288032376239843205928422222431391723125142017345498949353212165e-08
```

The resulting coefficients are in ascending order.  For example, the
first element of `N` is the constant term.

### Transformations

### Polynomial evaluation

---
layout: post
title: How to program mathematical functions
category: Numerical analysis
---
<style>
.center {
	text-align: center;
}
</style>

It is achievable to write fast and precise mathematical functions.
There are cutting-edge implementations in computers, phones, calculators,
and game consoles.  Some of them are open source, like glibc and musl,
from which we can learn.  I have also been working on mathematics in
[metallic][metallic], as a shameless plug.

[metallic]: https://github.com/jdh8/metallic

It may seem that mathematical functions are hardware instructions.  We
usually code them in software instead.  The trend is to have the
hardware deal with only basic operations after decades of evolution.  We
can perform mathematics with only operations required in IEEE 754 and
integer operations via type punning.

Target system
-------------
### Instruction set
Which instructions are on the target system?  C operators are probably
supported.  Other operations are not as available even if they are
_required_ by IEEE 754.  For example, `fmod` rarely compiles to a single
instruction.  It is usually done by long division, which then translates
to a series of integer operations or partial remainder instructions.
This C function is also an example where operators in other programming
languages can be more expensive than expected, like `%` in JavaScript or
Python.

### Programming language
I suggest programming mathematical functions in C.  It is fast and
precise to evaluate complicated expressions with floating-point
contraction.  On supported platforms, `a * b + c` can compile to a fused
multiply--add.

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
_Round half to even_ is the default rounding in IEEE 754.  The roundoff
error of a series of <var>n</var> operations by this unbiased rounding
is only in O(√<var>n</var>).  This rounding will be the implied rounding
method throughout this article unless otherwise specified.

### Double rounding
The default rounding is non-associative.  If we round 1.49 to the
nearest tenth and then to the nearest integer, it becomes 2.  Rounding
to midpoints must be avoided in intermediate roundings.

_Round to odd_ is a helpful intermediate rounding for binary numbers.
It rounds irrepresentable numbers to the nearest representation with an
odd significand.  Only numbers with even significands can be midpoints
or exact in a coarser precision.  Therefore, _round to odd_ does not
interfere with subsequent roundings.  _Round to odd_ is also
associative like directed roundings as it rounds all values between
representations to either of them.

- [When double rounding is odd](https://hal.inria.fr/inria-00070603v2/document),
  by Sylvie Boldo and Guillaume Melquiond
- [GCC avoids double rounding errors with round-to-odd](https://www.exploringbinary.com/gcc-avoids-double-rounding-errors-with-round-to-odd/),
  by Rick Regan

### Exact addition
We can obtain the exact error of addition with the default rounding.
This technique is useful for storing precise intermediates to stop the
propagation of error.  The idea is to find <var>s</var> + <var>e</var> =
<var>a</var> + <var>b</var>, where <var>s</var> is the rounded
sum, and <var>e</var> is the error term.  The error term is
defined when <var>s</var> does not overflow.

Compensated summation produces precise results with preconditions.  The
base of the floating-point system (`FLT_RADIX`) can be at most 3, and
logb(<var>a</var>) ≥ logb(<var>b</var>).

```c
s = a + b;
e = a - s + b;
```

We can generalize this algorithm by comparison, as |<var>a</var>| ≥
|<var>b</var>| implies logb(<var>a</var>) ≥ logb(<var>b</var>).
Branching is nevertheless inefficient.  There is another unbranched
algorithm working most of the time.  This algorithm overflows only if an
operand is the largest finite representation or its negative.

```c
s = a + b;
x = a - s;
y = b - s;
e = (a + x) + (b + y);
```

- [On the robustness of the 2Sum and Fast2Sum algorithms](https://hal-ens-lyon.archives-ouvertes.fr/ensl-01310023v2/document)
  by Sylvie Boldo, Stef Graillat, and Jean-Michel Muller

### Exact multiplication
First, a `double` is large enough to store the exact product of any two
`float`s.  Therefore, it is preferred to cast and multiply.  This method
is straightforward and fast, and double-precision multiplication is
widely supported.

```c
double multiply(float a, float b)
{
    return (double)a * b;
}
```

Then, we try to find <var>s</var> + <var>e</var> =
<var>a</var><var>b</var>.  If the FMA instructions are available, use
them.  Probe this feature with `FP_FAST_FMA[FL]?` macros.

```c
s = a * b;
e = fma(a, b, -s);
```

Next, without all the hardware witchcraft, we can still count on
schoolbook multiplication.  With an even number of significant digits,
equally split them and obtain the higher part with a bitwise AND.

Even if the number of significant bits is odd, we can split a binary
significand with the default rounding.  Take IEEE 754 double-precision
as an example, which has 53 significant bits.  Its magic multiplier is
2<sup>27</sup> + 1, where 27 = (53 + 1) / 2.

```c
double split(double x)
{
    double s = (0x1p27 + 1) * x;
    double c = x - s;

    return s + c;
}
```
The above function returns the higher half of the argument.  We can
extract the lower half by subtracting the higher half.  Each half is
guaranteed to have at most 26 significant bits.  The possibility that
the halves can have opposite signs recovers the seemingly lost bit.

### Table maker's dilemma
The cost of a correctly rounded transcendental function is unknown
unless probed with brute force.  Faithfully rounded versions are much
faster and generally preferable, though they may round up or down.  No
matter how precise intermediate results are, they can be close to a
turning point of the given rounding.  For example, <var>x</var> is a
mathematical result equal to <var>x</var><sup>\*</sup> + 0.49 ulp, where
<var>x</var><sup>\*</sup> is an exact floating-point.  An exquisite
approximation gives <var>x</var><sup>\*</sup> + 0.51 ulp, which is only
0.02 ulp off.  Nevertheless, it becomes <var>x</var><sup> \*</sup> + 1
ulp after default rounding, which is 1 ulp off from the correctly
rounded <var>x</var><sup>\*</sup>.

We can correctly round an algebraic function by solving its polynomial
equation at the turning point and compare the results.  However, this
extra cost is unwelcome if faithful rounding is enough.  It is unlikely
that a correctly rounded program solves a real-world problem that a
faithfully rounded one does not.  IEEE 754 does not require correct
rounding for the cubic root.  Therefore, I made `cbrt` faithfully
rounded in metallic.  Its error can be even larger in glibc and other C
libraries.

- [Errors in math functions (glibc)](https://www.gnu.org/software/libc/manual/html_node/Errors-in-Math-Functions.html).
  Their `cbrtf` rounds faithfully, while `cbrt` can incur an error of 3
  ulp.

Approximation
-------------
Eventually, we break down mathematical functions to basic arithmetics.
This section covers how to turn mathematics into source code.

### Argument reduction
Sometimes we can shrink the domain to a short interval with an identity.
For example, to compute `exp` for a binary format, we can divide its
argument <var>x</var> by ln 2.

<p>
	\begin{align*}
		x &= n \ln 2 + r \\
		\exp x &= 2^n \exp r
	\end{align*}
</p>

Where <var>n</var> is an integer, bit twiddling takes care of
multiplication by 2<sup><var>n</var></sup>.  If we pick <var>n</var> as
an integer nearest to <var>x</var>, we simultaneously restrict <var>
r</var> into [-0.5 ln 2, 0.5 ln 2].

Approximation to exp <var>r</var> is fast because [-0.5 ln 2, 0.5 ln 2]
is a short interval.  We approximate exp <var>r</var> with few terms to
achieve the desired precision.

It is also precise because <var>r</var> is small.  Computations
involving small numbers are accurate.  Floating-points are dense near
the origin since they are essentially scientific notation.  In IEEE 754
binary formats, there is the same number of representations in (0, 1.5)
and in (1.5, ∞).  Therefore, it is wise to shift the domain close to 0.

### Transformations
Most mathematical functions we compute are well-behaved.  We can save
computations by taking advantage of continuity, differentiability, or
symmetry.

When a function <var>f</var> **passes through and is monotone at the
origin**, divide it by the identity function and approximate the
quotient <var>g</var> instead.

<p>
	\begin{align*}
		f(0) &= 0 \\
		f(x) &= x g(x)
	\end{align*}
</p>

This transformation explicitly omits the constant term and reduces the
overall relative error.  The value of <var>g</var>(0) can be any finite
number.  We define <var>g</var> as a continuous extension for rigor.

<p>
	\[
		g(x) = \begin{cases}
			\displaystyle \frac{f(x)}{x} & \mbox{if } x \ne 0 \\
			\displaystyle \lim_{t \to 0} \frac{f(t)}{t} & \mbox{if } x = 0
		\end{cases}
	\]
</p>

Given an approximant <var>ĝ</var> of <var>g</var>, the overall
absolute error <var>x</var> |<var>ĝ</var> &minus; <var>g</var>|
tends to 0 when <var>x</var> also approaches 0.  This transformation
enables approximating <var>g</var> without a weight function and
simplifies calculation.

When <var>f</var> is an **even function**, view it as another function
<var>g</var> of a squared variable.

<p>
	\begin{align*}
		f(x) &= f (-x) \\
		f(x) &= g \left( x^2 \right) \\
		g(x) &= f \left( \sqrt x \right)
	\end{align*}
</p>

This transformation explicitly omits odd terms and halves the degree of
the approximant.

An **odd function** is a combination of the above two.  It is a product
of the identity function and an even function.

<p>
	\begin{align*}
		f(x) &= -f (-x) \\
		f(x) &= x g \left( x^2 \right) \\
		g(x) &= \frac{f \left( \sqrt x \right)}{\sqrt x}
	\end{align*}
</p>

The value of <var>g</var>(0) does not affect the approximation of
<var>g</var> as it creates no hole in the domain.  In practice, set the
lower bound to a tiny positive number like 2<sup>-200</sup>, and
everything is fine.

### Remez algorithm
Remez exchange algorithm is an iterative minimax algorithm.  It
minimizes the error of a rational approximation of a function.  The best
explanation of this algorithm I found is
[from the Boost libraries][boost].  I recommend [Remez.jl][remez.jl], a
public module in the Julia language.  It works out of the box after
installation.

[boost]: https://www.boost.org/doc/libs/1_75_0/libs/math/doc/html/math_toolkit/remez.html
[remez.jl]: https://github.com/simonbyrne/Remez.jl

For example, the following snippet finds a cubic approximation of
cos(√&middot;) in [0, (π / 4)<sup>2</sup>] with minimax absolute errors.
The last argument is 0 because we want a polynomial, whose denominator
is a constant (of degree 0) if regarded as a rational function.

```jl
import Remez

N, D, E, X = Remez.ratfn_minimax(x -> cos(√x), (0, (big(π) / 4)^2), 3, 0)
```

The variables `N`, `D`, `E`, `X` are the numerator, the denominator, the
maximum error, and coordinates of the extrema, respectively.  In this
case, we are interested in `N` and `E` only.  If we run the snippet in
the REPL, it is straightforward to inspect variables.

```
julia> N
4-element Array{BigFloat,1}:
  0.9999999724233229210670051040057597041917874465747537951681676248240168483719746
 -0.4999985669584884771720232450657038606385147149244782395789475085368551172067715
  0.04165502688425152443762347668780274316867072837392713367475023020736799395672903
 -0.001358590851011329858521158876238716265345398772374942259275377959127201806930143

julia> E
2.757667707893299489599424029580821255342524620485822487536621483700643103529491e-08
```

The resulting coefficients are in ascending order.  For example, the
first element of `N` is the constant term.

### Polynomial evaluation
The best polynomial evaluation method depends on the system.  For
example, [pipelining influences execution time][pipe].  Luckily, there
are well-known evaluation schemes that provide decent performance and
reasonable errors.

[pipe]: http://lolengine.net/blog/2011/9/17/playing-with-the-cpu-pipeline

**Horner's scheme** produces the fewest operations.  It is the fastest
if its argument is already a vector.  It is also usually the most
accurate method for a polynomial approximant of a well-conditioned
function.  However, its dependency chain is also the longest.  It
underuses the pipeline because all operations except one depend on
another.  Hence, it is less than ideal on single-threaded systems.

On the other hand, **Estrin's scheme** tries to be as parallel as
possible.  It groups terms in a binary fashion to achieve the shallowest
dependency tree at the expense of O(log(<var>n</var>)) extra squaring
ops.

There are also other evaluation schemes with different pros and cons.
Benchmark to find the most suited one if their difference is critical.

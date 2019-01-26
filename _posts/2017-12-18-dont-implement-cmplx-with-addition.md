---
layout: post
title: Don't implement <code>CMPLX</code> with <code>+</code>
categories: C
tags: Complex
---
For brevity, let's forget that `CMPLX` is a macro.  The following code seems to
be a cross-platform solution.

```c
inline double _Complex CMPLX(double x, double y)
{
	return x + I * y;
}
```

Actually, it is not.  Whether `I` is complex or imaginary, `I * y` evaluates to
(+0, <var>y</var>) when added with a real number.  If <var>x</var> happens to
be -0, its sign is not preserved because -0 + +0 = +0.

I think we can only stick with compiler-specific constructs for now. :(

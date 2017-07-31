---
layout: page
title: Asm.js minifier
---
This minifier only mangle local names and concatenate adjacent variable
declarations.  Hence it preserves syntactic hints in [asm.js][asm]

[asm]: http://asmjs.org/

<input type="file" id="asm-file">
<pre><code id="minified-asm"></code></pre>

<script async src="https://cdnjs.cloudflare.com/ajax/libs/esprima/2.7.3/esprima.min.js"></script>
<script async src="https://estools.github.io/esmangle/javascripts/esmangle.js"></script>
<script async src="https://estools.github.io/escodegen/escodegen.browser.js"></script>
<script async src="dom.js"></script>

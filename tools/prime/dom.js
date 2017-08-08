"use strict";
{
	const prime = Prime();
	const output = document.getElementById("result").firstChild;

	document.getElementById("num").addEventListener("input", function()
	{
		const value = this.valueAsNumber;

		output.nodeValue = prime.isuint(value)
			? value + [" is composite.", " is neither prime nor composite.", " is prime."][prime.test(value)]
			: "Plese enter a 32-bit positive integer.";
	});
}

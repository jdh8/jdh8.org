"use strict";
{
	const prime = Prime();
	const output = document.getElementById("result").firstChild;

	document.getElementById("num").addEventListener("input", function()
	{
		output.nodeValue = function(value)
		{
			value = +value;

			if (+(~~value >>> 0) != value)
				return "Plese enter a 32-bit positive integer.";

			return value + [" is composite.", " is neither prime nor composite.", " is prime."][prime.test(value)];
		}(this.valueAsNumber);
	});
}

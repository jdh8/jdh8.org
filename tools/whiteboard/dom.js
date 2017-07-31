"use strict";

!function(){

var form = document.forms.board;
var display = document.getElementById("display");

form.addEventListener("submit", function(ev)
{
	ev.preventDefault();
	ev.stopPropagation();

	display.innerHTML = this.elements.html.value;

	if (this.elements.jax.checked)
		MathJax.Hub.Typeset(display);
});

}();

const display = document.getElementById("display");

document.forms.board.addEventListener("submit", function(ev)
{
	ev.preventDefault();
	ev.stopPropagation();

	display.innerHTML = this.elements.html.value;

	if (this.elements.jax.checked)
		MathJax.typeset([display]);
});

export default (nodes, batch) => {
	document.querySelector("main").appendChild(document.getElementById("loader").content);
	const button = document.getElementById("load");
	let shown = 0;

	const step = () => {
		nodes.slice(shown, shown += batch).forEach(node => node.hidden = false);
		button.hidden = shown >= nodes.length;
	};

	nodes.forEach(node => node.hidden = true);
	button.addEventListener("click", step);
	step();
};

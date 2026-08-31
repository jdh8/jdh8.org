import reveal from "./reveal.js";

const root = new URL("./", import.meta.url);

export default async (pages, batch) => {
	const main = document.querySelector("main");
	const none = document.getElementById("none");
	const query = new URLSearchParams(location.search).get("q")?.trim() ?? "";
	const fill = () => document.querySelectorAll(".search-field").forEach(field => field.value = query);
	const nothing = () => {
		main.replaceChildren(none.content);
		fill();
	};

	if (!query) return nothing();

	fill();
	const title = main.querySelector("h1");
	title.querySelector("span").textContent = query;
	document.title = title.textContent + document.title.slice(document.title.indexOf(" – "));

	const html = await Promise.all(Array.from({ length: pages }, (_, page) =>
		fetch(new URL(page ? `page/${page + 1}/` : ".", root)).then(response => response.text())
	));
	const parser = new DOMParser();
	const needle = query.toLowerCase();
	const matches = html
		.flatMap(source => [...parser.parseFromString(source, "text/html").querySelectorAll("article.post")])
		.filter(post => post.textContent.toLowerCase().includes(needle));

	if (!matches.length) return nothing();

	main.append(...matches);
	reveal(matches, batch);
};

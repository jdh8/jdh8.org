// This file is part of Integration by me.
//
// Copyright (C) 2013-2017 Chen-Pang He <https://jdh8.org/>
//
// Integration by me is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Integration by me is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

"use strict";
{
	function concat(array, right)
	{
		const left = array[array.length - 1];

		if (left && left.type === "VariableDeclaration" && right.type === "VariableDeclaration")
			left.declarations = left.declarations.concat(right.declarations);
		else
			array.push(right);

		return array;
	}

	/**
	 * The argument is modified in place to avoid deep copy.
	 *
	 * @summary Concatenate adjacent variable declarations
	 *
	 * @param {Object} ast - Abstract syntax tree
	 *
	 * @returns  Modified {@link ast}
	 */
	function transform(ast)
	{
		const result = ast.body;

		result.body = result.body.reduce(concat, []);
		result.body.filter(s => s.type === "FunctionDeclaration").forEach(transform);

		return result;
	}

	const reader = new FileReader();
	const code = document.getElementById("minified-asm");

	reader.addEventListener("loadend", function()
	{
		code.textContent = escodegen.generate(transform({ body: esmangle.mangle(esprima.parse(this.result)) }),
		{
			format:
			{
				renumber: false,
				escapeless: true,
				compact: true,
				semicolons: false,
				quotes: "double",
			},
			parse: esprima.parse,
		});
	});

	document.getElementById("asm-file").addEventListener("change", function()
	{
		reader.readAsText(this.files[0]);
	});
}

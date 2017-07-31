// This file is part of Integration by me.
//
// Copyright (C) 2013-2015 Chen-Pang He <https://jdh8.org/>
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

!function(){

/**
 * The argument is modified in place to avoid deep copy.
 *
 * @summary Concatenate adjacent variable declarations
 *
 * @param {Object} ast - Abstract syntax tree
 *
 * @returns  Modified {@link ast}
 */
function concatAdjacentVars(ast)
{
	var body = ast.body;
	var cache = [];

	for (var k = body.length - 1; k >= 0; --k)
	{
		var stmt = body[k];

		switch (stmt.type)
		{
			case "VariableDeclaration":
				if (cache.length)
					body.splice(k + 1, 1);
				cache = stmt.declarations = stmt.declarations.concat(cache);
				break;
			case "FunctionDeclaration":
				concatAdjacentVars(stmt.body);
				// no break
			default:
				cache = [];
		}
	}

	return ast;
}

var reader = new FileReader();
var code = document.getElementById("minified-asm");

reader.addEventListener("loadend", function()
{
	var ast = esmangle.mangle(esprima.parse(this.result));

	code.textContent = escodegen.generate(concatAdjacentVars(ast), {
		format: {
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

}();

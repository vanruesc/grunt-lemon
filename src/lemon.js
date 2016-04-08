import waterfall from "async-waterfall";
import path from "path";
import fs from "fs";

/**
 * Inlines file imports.
 *
 * @param {String} file - The file.
 * @param {Object} options - The options.
 * @param {String} options.encoding - The encoding of the given file.
 * @param {Object} options.extensions - The import file extensions to consider. Each extension must define an encoding.
 * @param {Boolean} options.useVar - Whether the var declaration should be used instead of const.
 * @param {Function} done - A callback function.
 */

export function squeeze(file, options, done) {

	const declaration = options.useVar ? "var" : "const";

	// Ignoring the (optional) semicolon.
	const importRegExp = /import\s*(\w*)\s*from\s*[\"\'](.*)[\"\']/ig;

	waterfall([

		function checkFile(next) {

			fs.access(file, (fs.R_OK | fs.W_OK), next);

		},

		function readFile(next) {

			fs.readFile(file, options.encoding, next);

		},

		function parseImports(data, next) {

			const imports = [];

			let result = importRegExp.exec(data);

			while(result !== null) {

				imports.push({
					start: result.index,
					end: importRegExp.lastIndex,
					name: result[1],
					path: path.resolve(path.dirname(file), result[2]),
					encoding: options.extensions[path.extname(result[2])],
					data: null
				});

				result = importRegExp.exec(data);

			}

			// Might have no imports at all.
			next(null, imports, data);

		},

		function filterImports(imports, data, next) {

			const filteredImports = [];

			let i, l;

			for(i = 0, l = imports.length; i < l; ++i) {

				if(imports[i].encoding !== undefined) {

					filteredImports.push(imports[i]);

				}

			}

			// Might end up with no imports.
			next(null, filteredImports, data);

		},

		function checkImports(imports, data, next) {

			let i = 0;
			let l = imports.length;

			(function proceed(error) {

				if(error || i === l) {

					next(error, imports, data);

				} else {

					fs.access(imports[i++].path, (fs.R_OK | fs.W_OK), proceed);

				}

			}());

		},

		function readImports(imports, data, next) {

			let j;
			let i = -1;
			let l = imports.length;

			(function proceed(error, importData) {

				j = i;

				if(error || ++i === l) {

					// Check if there are any imports.
					if(l > 0) {

						// If so, don't forget to pick up the one that was read last.
						imports[j].data = importData;

					}

					next(error, imports, data);

				} else {

					// Skip this during the first run.
					if(i > 0) {

						// Collect the data. The index i is one step ahead of j.
						imports[j].data = importData;

					}

					fs.readFile(imports[i].path, imports[i].encoding, proceed);

				}

			}());

		},

		function inlineImports(imports, data, next) {

			let modified = imports.length > 0;
			let i;

			// Inline the imports in reverse order to keep the indices intact.
			while(imports.length > 0) {

				i = imports.pop();

				data = data.substring(0, i.start) +
					declaration + " " + i.name + " = " + JSON.stringify(i.data) +
					data.substring(i.end);

			}

			next(null, modified, data);

		},

		function writeFile(modified, data, next) {

			if(modified) {

				fs.writeFile(file, data, next);

			} else {

				next(null);

			}

		}

	], done);

}

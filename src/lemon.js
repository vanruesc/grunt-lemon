import waterfall from "async-waterfall";
import glob from "glob";
import path from "path";
import fs from "fs";

export default function(grunt) {

	grunt.registerMultiTask("lemon", "Inline text file imports.", function() {

		const options = this.options({
			extensions: [],
			encoding: "utf8",
			useVar: false,
			glob: null
		});

		const done = this.async();
		const src = this.data.src;

		const declaration = options.useVar ? "var" : "const";

		// Ignoring the (optional) semicolon on purpose.
		const importRegExp = /import\s*(\w*)\s*from\s*[\"\'](.*)[\"\']/ig;

		/**
		 * Inlines text imports in the given file.
		 *
		 * @param {String} file - The file.
		 * @param {Function} finish - A callback function.
		 */

		function squeeze(file, finish) {

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
							data: null
						});

						result = importRegExp.exec(data);

					}

					// Might end up with no imports.
					next(null, imports, data);

				},

				function filterImports(imports, data, next) {

					const filteredImports = [];

					let i, l;

					for(i = 0, l = imports.length; i < l; ++i) {

						if(options.extensions.indexOf(path.extname(imports[i].path)) > -1) {

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

					let i = 0;
					let l = imports.length;

					(function proceed(error, importData) {

						if(error || i === l) {

							// Check if there are any imports.
							if(l > 0) {

								// If so, don't forget to pick up the one that was read last.
								imports[(i - 1)].data = importData;

							}

							next(error, imports, data);

						} else {

							// Skip this during the first run.
							if(i > 0) {

								// Collect the data. The index is one step ahead.
								imports[(i - 1)].data = importData;

							}

							fs.readFile(imports[i++].path, options.encoding, proceed);

						}

					}());

				},

				function inlineImports(imports, data, next) {

					let modified = imports.length > 0;
					let i;

					// Inline the imports in reverse order to keep the indices intact.
					while(imports.length > 0) {

						i = imports.pop();
						data = data.substring(0, i.start) + declaration + " " + i.name + " = " + JSON.stringify(i.data) + data.substring(i.end);

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

			], finish);

		}

		// Main process.

		waterfall([

			function fetchFiles(next) {

				glob(src, options.glob, function(error, files) {

					if(!error && files.length === 0) {

						error = new Error("No source files found for path: \"" + src + "\"");

					}

					next(error, files);

				});

			},

			function inlineFiles(files, next) {

				let i = 0;
				let l = files.length;

				(function proceed(error) {

					if(error || i === l) {

						next(error);

					} else {

						squeeze(files[i++], proceed);

					}

				}());

			}

		], done);

	});

}

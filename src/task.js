import { squeeze } from "./lemon";
import waterfall from "async-waterfall";
import glob from "glob";

/**
 * The lemon grunt task.
 *
 * @param {Object} grunt - The grunt instance.
 */

export default function(grunt) {

	grunt.registerMultiTask("lemon", "Inline file imports.", function() {

		const options = this.options({
			extensions: {},
			encoding: "utf8",
			useVar: false,
			glob: null
		});

		const src = this.data.src;

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

						squeeze(files[i++], options, proceed);

					}

				}());

			}

		], this.async());

	});

}

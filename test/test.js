"use strict";

const grunt = require("grunt");

const EOL = /(?:\\r\\n|\\r|\\n)/g;

module.exports = {

	"Lemon": {

		"compare actual with expected": function(test) {

			let actual = grunt.file.read("test/inline/a/index.js").replace(EOL, "");
			let expected = grunt.file.read("test/expected/a");
			test.equal(actual, expected, "A - basic inlining and filtering");

			actual = grunt.file.read("test/inline/b/index.js").replace(EOL, "");
			expected = grunt.file.read("test/expected/b");
			test.equal(actual, expected, "B - ignore unrelated imports");

			actual = grunt.file.read("test/inline/c/index.js").replace(EOL, "");
			expected = grunt.file.read("test/expected/c");
			test.equal(actual, expected, "C - inline image file");

			actual = grunt.file.read("test/inline/glob/sub-dir/d/index.js").replace(EOL, "");
			expected = grunt.file.read("test/expected/d");
			test.equal(actual, expected, "D - glob");

			test.done();

		}

	}

};

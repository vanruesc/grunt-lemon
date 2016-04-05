"use strict";

const grunt = require("grunt");

module.exports = {

	"Lemon": {

		"compare actual with expected": function(test) {

			let actual = grunt.file.read("test/inline/a/index.js");
			let expected = grunt.file.read("test/expected/a");
			test.equal(actual, expected, "A - basic inlining");

			actual = grunt.file.read("test/inline/glob/sub-dir/b/index.js");
			expected = grunt.file.read("test/expected/b");
			test.equal(actual, expected, "B - globbing");

			actual = grunt.file.read("test/inline/glob/sub-dir/c/index.js");
			expected = grunt.file.read("test/expected/c");
			test.equal(actual, expected, "C - nothing should have been changed");

			test.done();

		}

	}

};

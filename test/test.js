"use strict";

const grunt = require("grunt");

const EOL = /(?:\\r\\n|\\r|\\n)/g;

module.exports = {

	"Lemon": {

		"compare actual with expected": function(test) {

			let actual = grunt.file.read("test/inline/a/index.js").replace(EOL, "");
			let expected = grunt.file.read("test/expected/a");
			test.equal(actual, expected, "A - basic inlining");

			actual = grunt.file.read("test/inline/glob/sub-dir/b/index.js").replace(EOL, "");
			expected = grunt.file.read("test/expected/b");
			test.equal(actual, expected, "B - glob");

			test.done();

		}

	}

};

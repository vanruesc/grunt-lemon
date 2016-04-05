"use strict";

module.exports = function(grunt) {

	grunt.initConfig({

		date: grunt.template.today("mmm dd yyyy"),
		pkg: grunt.file.readJSON("package.json"),

		banner: "/**\n" +
			" * grunt-lemon v<%= pkg.version %> build <%= date %>\n" +
			" * <%= pkg.homepage %>\n" +
			" * Copyright <%= date.slice(-4) %> <%= pkg.author.name %>, <%= pkg.license %>\n" + 
			" */\n",

		jshint: {
			options: {
				jshintrc: true
			},
			files: ["Gruntfile.js", "src/**/*.js", "test/**/*.js"]
		},

		copy: {
			backup: {
				expand: true,
				cwd: "test/inline",
				src: "**",
				dest: "test/backup",
				filter: "isFile"
			},
			restore: {
				expand: true,
				cwd: "test/backup",
				src: "**",
				dest: "test/inline",
				filter: "isFile"
			}
		},

		clean: {
			backup: ["test/backup"]
		},

		// Configuration to be run and tested.
		lemon: {
			options: {
				extensions: [".frag", ".vert"],
				encoding: "utf8",
				useVar: false,
				glob: null
			},
			taskA: {
				src: "test/inline/a/index.js"
			},
			taskBC: {
				src: "test/inline/glob/**/index.js"
			}
		},

		rollup: {
			options: {
				format: "cjs",
				moduleName: "lemon",
				banner: "<%= banner %>",
				external: ["async-waterfall", "glob", "path", "fs"],
				plugins: [
					require("rollup-plugin-node-resolve")({
						main: false,
						jsnext: true
					})
				]
			},
			dist: {
				src: "src/lemon.js",
				dest: "tasks/lemon.js"
			}
		},

		nodeunit: {
			options: {
				reporter: "default"
			},
			tests: ["test/test.js"]
		}

	});

	// The implemented plugin task.
	grunt.loadTasks("tasks");

	grunt.loadNpmTasks("grunt-contrib-nodeunit");
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks("grunt-contrib-copy");
	grunt.loadNpmTasks("grunt-rollup");

	grunt.registerTask("default", ["build", "test"]);
	grunt.registerTask("test", ["backup", "lemon", "nodeunit", "restore"]);
	grunt.registerTask("build", ["jshint", "rollup"]);
	grunt.registerTask("backup", ["restore", "copy:backup"]);
	grunt.registerTask("restore", ["copy:restore", "clean:backup"]);

};

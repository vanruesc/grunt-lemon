# grunt-lemon 
[![Build status](https://travis-ci.org/vanruesc/grunt-lemon.svg?branch=master)](https://travis-ci.org/vanruesc/grunt-lemon) 
[![npm version](https://badge.fury.io/js/grunt-lemon.svg)](https://badge.fury.io/js/grunt-lemon) 
[![Dependencies](https://david-dm.org/vanruesc/grunt-lemon.svg?branch=master)](https://david-dm.org/vanruesc/grunt-lemon)

If you are using [rollup](https://github.com/rollup/rollup) and [rollup-plugin-string](https://github.com/TrySound/rollup-plugin-string) 
to inline text file imports during the bundling process, you'll be faced with a problem when you decide to publish your module as a library. 
In order to support the [tree-shaking mechanism](https://github.com/rollup/rollup#a-next-generation-es6-module-bundler) of rollup, you'll 
want to expose your source files directly, but these individual files still use the text file imports. Therefore, the end users of your 
library are forced to use that inlining plugin as well during their own bundling process!  

> When life gives you lemons, squeeze the lemons and make lemonade.

This grunt plugin fills this specific development gap by inlining text file imports in individual files __permanently__. In order to 
restore the affected files after publishing your module, you'll need to create a backup first. Check out the usage example below for details. 


## Getting Started

This plugin requires Grunt >= 0.4.0

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) 
guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. 
Once you're familiar with that process, you may install this plugin with this command:

```sh
npm install grunt-lemon --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks("grunt-lemon");
```


## Usage
> The inlining process is __destructive__. Affected files will be changed __permanently__. Create a 
[backup](https://github.com/vanruesc/grunt-lemon#creating-a-backup) first!  

First, define which imports should be inlined by setting the ```options.extensions``` field. Then, specify a source path ```src``` to the 
files that you wish to inline. 

```
// src/my/text.txt
hello world
```

```js
// src/index.js
import myModule from "my-module";
import text from "./my/text.txt";
```

```js
// Gruntfile.js
lemon: {
  options: {
    extensions: [".txt"]
  },
  taskA: {
    src: "src/index.js"
  },
  ...
}
```

```js
// src/index.js (inlined)
import myModule from "my-module";
const text = "hello world";
```


### Glob
You may use [glob patterns](https://github.com/isaacs/node-glob#glob-primer) in order to inline a bunch of files at once. 

```js
lemon: {
  options: {
    extensions: [".html", ".css"]
  },
  task: {
    src: "src/**/tpl.js"
  }
}
```


### Options
This plugin ignores all imports by default. Only those imports whose paths match the specified file ```extensions``` will be considered. 
If you don't want to use the _const_ statement, simply set ```useVar``` to _true_. You can set the file ```encoding``` to one of 
[these](https://github.com/nodejs/node/blob/master/lib/buffer.js#L300-L309) possible values. The default encoding is _utf8_. 
You may also provide options for the underlying [glob](https://github.com/isaacs/node-glob#options) mechanism. 

```js
lemon: {
  options: {
    // Global options.
    extensions: [".exe"],
    encoding: "binary",
    useVar: true,
    glob: { ... },
  },
  squeeze: {
    options: {
      // Local options.
      extensions: [".glsl"],
      encoding: "utf8",
      glob: null
    },
    src: "src/index.js"
  }
}
```


### Creating a Backup
In order to create a backup of specific files, you'll need tools for copying and deleting files. The following example uses the basic grunt 
plugins [grunt-contrib-copy](https://github.com/gruntjs/grunt-contrib-copy) and  [grunt-contrib-clean](https://github.com/gruntjs/grunt-contrib-clean).

```js
// Gruntfile.js (copy setup)
copy: {
  backup: {
    expand: true,
    cwd: "src",
    src: "**/tpl.js",  // Copy all tpl files from src into a 
    dest: "backup",    // backup folder while maintaining directory structures.
    filter: "isFile"
  },
  restore: {
    expand: true,
    cwd: "backup",
    src: "**",         // Copy all backup files back into the 
    dest: "src",       // src folder, overwriting existing files.
    filter: "isFile"
  }
}
```

```js
// Gruntfile.js (clean setup)
clean: {
  backup: ["backup"]  // Remove the backup files.
}
```

```js
// Gruntfile.js (tasks)
grunt.registerTask("backup", ["restore", "copy:backup"]);
grunt.registerTask("restore", ["copy:restore", "clean:backup"]);
grunt.registerTask("prepublish", ["backup", "lemon"]);
grunt.registerTask("postpublish", ["restore"]);
```


## Contributing
Maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code.


## License
[Zlib](https://github.com/vanruesc/grunt-lemon/blob/master/LICENSE)

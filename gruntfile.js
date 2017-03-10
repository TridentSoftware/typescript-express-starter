module.exports = function (grunt) {
  "use strict";

  grunt.initConfig({
    copy: {
      build: {
        files: [
          {//copy configs
            expand: true,
            cwd: "./",
            src: ["./\*\*/\*.config", "./\*\*/\*.json", "!./node_modules/**", "!./angular-src/**"],
            dest: "./dist"
          },
          {//copy server
            expand: true,
            flatten: true,
            cwd: "./",
            src: ["./bin/www.js"],
            dest: "./dist"
          },
          {//copy public files
            expand: true,
            cwd: "./public",
            src: ["**"],
            dest: "./dist/public"
          },
          {//copy views
            expand: true,
            cwd: "./views",
            src: ["**"],
            dest: "./dist/views"
          }
        ]
      }
    },
    ts: {
      app: {
        files: [{
          src: ["src/\*\*/\*.ts", "!src/.baseDir.ts"],
          dest: "./dist"
        }],
        options: {
          experimentalDecorators: true,
          module: "commonjs",
          target: "es6",
          sourceMap: false
        }
      }
    },
    clean: {
      dist: ["./dist/*"]
    },
    watch: {
      ts: {
        files: ["src/\*\*/\*.ts"],
        tasks: ["ts"]
      },
      views: {
        files: ["views/**/*.hbs"],
        tasks: ["copy"]
      },
      config: {
        files: ["./**/*.json", "./**/*.config"],
        tasks: ["copy"]
      }
    }
  });

  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-contrib-clean");
  grunt.loadNpmTasks("grunt-ts");

  grunt.registerTask("default", [
    "clean",
    "copy",
    "ts"
  ]);

};

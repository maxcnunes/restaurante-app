module.exports = function(grunt) {
  grunt.initConfig({
    nodewebkit: {
      options: {
        build_dir: './bin', // Where the build version of my node-webkit app is saved
        mac: true, // We want to build it for mac
        win: true, // We want to build it for win
        linux32: false, // We don't need linux32
        linux64: false // We don't need linux64
      },
      src: ['./build/**/*'] // Your node-webkit app
    },
    copy: {
      build: {
        src: [ 'app/**/*', 'package.json', 'node_modules/**/*' ],
        dest: 'build/',
      }
    },
    compress: {
      mac: {
        options: {
          archive: 'bin/restaurante-app-mac.zip'
        },
        files: [
          { cwd: 'bin/releases/restaurante-app/mac/restaurante-app.app', src: ['**/*'], dest: 'restaurante-app-mac' }
        ]
      },
      win: {
        options: {
          archive: 'bin/restaurante-app-win.zip'
        },
        files: [
          { cwd: 'bin/releases/restaurante-app/win/restaurante-app', src: ['**/*'], dest: 'restaurante-app-win' }
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-node-webkit-builder');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-compress');

  grunt.registerTask('release', ['copy', 'nodewebkit' /*, 'compress:mac', 'compress:win' */]);
};
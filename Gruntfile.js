var path = require('path');

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    copy: {
      vendor: {
        files: [
          {
            expand: true, cwd: 'bower_components/bootstrap/',
            src: ['js/**', 'less/**'], dest: 'public/vendor/bootstrap/'
          },
          {
            expand: true, cwd: 'bower_components/backbone/',
            src: ['backbone.js'], dest: 'public/vendor/backbone/'
          },
          {
            expand: true, cwd: 'bower_components/font-awesome/',
            src: ['fonts/**', 'less/**'], dest: 'public/vendor/font-awesome/'
          },
          {
            expand: true, cwd: 'bower_components/html5shiv/dist/',
            src: ['html5shiv.js'], dest: 'public/vendor/html5shiv/'
          },
          {
            expand: true, cwd: 'bower_components/jquery/dist/',
            src: ['jquery.js'], dest: 'public/vendor/jquery/'
          },
          {
            expand: true, cwd: 'bower_components/momentjs/',
            src: ['moment.js'], dest: 'public/vendor/momentjs/'
          },
          {
            expand: true, cwd: 'bower_components/respond/src/',
            src: ['respond.js'], dest: 'public/vendor/respond/'
          },
          {
            expand: true, cwd: 'bower_components/underscore/',
            src: ['underscore.js'], dest: 'public/vendor/underscore/'
          }
        ]
      },
      webappHtml:{
        files:[
          {
            expand: true,
            cwd: 'public/plugins/buzzer/',
            src: ['*.html'], dest: 'public/plugins/buzzer/dist/'
          },
          {
            expand: true,
            cwd: 'public/plugins/sortMe/',
            src: ['*.html'], dest: 'public/plugins/sortMe/dist/'
          },
          {
            expand: true,
            cwd: 'public/plugins/quickPoll/',
            src: ['*.html'], dest: 'public/plugins/quickPoll/dist/' 
          },
          {
            expand: true,
            cwd: 'public/plugins/checkIn/',
            src: ['*.html'], dest: 'public/plugins/checkIn/dist/' 
          },
          {
            expand: true,
            cwd: 'public/plugins/openResponse/',
            src: ['*.html'], dest: 'public/plugins/openResponse/dist/' 
          },
          {
            expand: true,
            cwd: 'public/plugins/posterMaker/',
            src: ['*.html'], dest: 'public/plugins/posterMaker/dist/' 
          },
          {
            expand: true,
            cwd: 'public/plugins/wheelWord/',
            src: ['*.html'], dest: 'public/plugins/wheelWord/dist/' 
          },
          {
            expand: true,
            cwd: 'public/plugins/randomizer/',
            src: ['*.html'], dest: 'public/plugins/randomizer/dist/' 
          },
          {
            expand: true,
            cwd: 'public/plugins/wordAttack/',
            src: ['*.html'], dest: 'public/plugins/wordAttack/dist/' 
          },
          {
            expand: true,
            cwd: 'public/plugins/wordSearch/',
            src: ['*.html'], dest: 'public/plugins/wordSearch/dist/' 
          }
        ]        
      }
    },
    concurrent: {
      dev: {
        tasks: ['nodemon', 'watch'],
          options: {
            logConcurrentOutput: true
          }
      }
    },
    nodemon: {
      dev: {
        script: 'app.js',
        options: {
          ignore: [
            'node_modules/**',
            'public/**'
          ],
          ext: 'js'
        }
      }     
    },
    watch: {
      clientJS: {
         files: [
          'public/layouts/**/*.js', '!public/layouts/**/*.min.js',
          'public/views/**/*.js', '!public/views/**/*.min.js'
         ],
         tasks: ['newer:uglify', 'newer:jshint:client']
      },
      serverJS: {
         files: ['views/**/*.js'],
         tasks: ['newer:jshint:server']
      },
      clientLess: {
         files: [
          'public/layouts/**/*.less',
          'public/views/**/*.less',
          'public/less/**/*.less'
         ],
         tasks: ['newer:less']
      },
      toolsCss:{
        files:[
          'public/tools/**/*.css',
          'public/tools/**/*.js'    
        ],
        tasks:['newer:jadeUsemin']
      },
      webappCss:{
        files:[
          'public/webapp*/css/*.css'
        ],
        tasks:['newer:jadeUsemin']
      },
      webapp:{
        files:
         [
          'public/webapp*/js/*.js',
          '!public/webapp*/*.built.js',
          'public/webapp*/js/**/**/*.js',
          'public/webapp*/js/**/**/**/*.js',
          'public/webapp*/js/**/**/**/**/*.html'
          ],        
        tasks:['newer:requirejs']
      },
      webappLess:{
        files:
         [
          'public/webapp*/css/*.less',          
          ],        
        tasks:['newer:less:webapp']
      }              
    },
    uglify: {
      options: {
        sourceMap: true,
        sourceMapName: function(filePath) {
          return filePath + '.map';
        }
      },
      layouts: {
        files: {
          'public/layouts/core.min.js': [
            'public/vendor/jquery/jquery.js',
            'public/vendor/underscore/underscore.js',
            'public/vendor/backbone/backbone.js',
            'public/vendor/bootstrap/js/affix.js',
            'public/vendor/bootstrap/js/alert.js',
            'public/vendor/bootstrap/js/button.js',
            'public/vendor/bootstrap/js/carousel.js',
            'public/vendor/bootstrap/js/collapse.js',
            'public/vendor/bootstrap/js/dropdown.js',
            'public/vendor/bootstrap/js/modal.js',
            'public/vendor/bootstrap/js/tooltip.js',
            'public/vendor/bootstrap/js/popover.js',
            'public/vendor/bootstrap/js/scrollspy.js',
            'public/vendor/bootstrap/js/tab.js',
            'public/vendor/bootstrap/js/transition.js',
            'public/vendor/momentjs/moment.js',
            'public/layouts/core.js'
          ],
          'public/layouts/ie-sucks.min.js': [
            'public/vendor/html5shiv/html5shiv.js',
            'public/vendor/respond/respond.js',
            'public/layouts/ie-sucks.js'
          ],
          'public/layouts/admin.min.js': ['public/layouts/admin.js']
        }
      },
      views: {
        files: [{
          expand: true,
          cwd: 'public/views/',
          src: ['**/*.js', '!**/*.min.js'],
          dest: 'public/views/',
          ext: '.min.js'
        }]
      }
    },
    jshint: {
      client: {
        options: {
          jshintrc: '.jshintrc-client',
          ignores: [
            'public/layouts/**/*.min.js',
            'public/views/**/*.min.js'
          ]
        },
        src: [
          'public/layouts/**/*.js',
          'public/views/**/*.js'
        ]
      },
      server: {
        options: {
          jshintrc: '.jshintrc-server'
        },
        src: [
          'schema/**/*.js',
          'views/**/*.js'
        ]
      }
    },
    less: {
      options: {
        compress: true        
      },
      layouts: {
        files: {
          'public/layouts/core.min.css': [
            'public/less/bootstrap-build.less',
            'public/less/font-awesome-build.less',
            'public/layouts/core.less'
          ],
          'public/layouts/admin.min.css': ['public/layouts/admin.less']
        }
      },
      views: {
        files: [{
          expand: true,
          cwd: 'public/views/',
          src: ['**/*.less'],
          dest: 'public/views/',
          ext: '.min.css'
        }]
      },
      webapp: {
        options: {
          compress: false        
        },
        files: [{
          expand: true,
          cwd: 'public/',
          src: ['webapp*/css/*.less'],
          dest: 'public',
          ext: '.css'
        }]
      }
    },
    clean: {
      js: {
        src: [
          'public/layouts/**/*.min.js',
          'public/layouts/**/*.min.js.map',
          'public/views/**/*.min.js',
          'public/views/**/*.min.js.map'
        ]
      },
      css: {
        src: [
          'public/layouts/**/*.min.css',
          'public/views/**/*.min.css'
        ]
      },
      vendor: {
        src: ['public/vendor/**']
      },
      plugins:{
        src:[
          'public/plugins/**/dist/css/*.css',
          'public/plugins/**/dist/js/*.js'
        ]
      }
    },
    requirejs:{
      webappJoin:{
        options: {
          baseUrl: "public/webappJoin/js/",
          mainConfigFile: "public/webappJoin/js/require_main.js",
          name: "require_main",
          findNestedDependencies:true,
          out: "public/webappJoin/js/require_main.built.js"
        }
      },
      webappSession:{
        options: {
          baseUrl: "public/webappSession/js/",
          mainConfigFile: "public/webappSession/js/require_main.js",
          name: "require_main",
          findNestedDependencies:true,
          out: "public/webappSession/js/require_main.built.js"
        }
      },
      webapp:{
        options: {
          baseUrl: "public/webapp/js/",
          mainConfigFile: "public/webapp/js/require_main.js",
          name: "require_main",
          findNestedDependencies:true,
          out: "public/webapp/js/require_main.built.js"
        }
      },
      webappCamp:{
        options: {
          baseUrl: "public/webappCamp/js/",
          mainConfigFile: "public/webappCamp/js/require_main.js",
          name: "require_main",
          findNestedDependencies:true,
          out: "public/webappCamp/js/require_main.built.js"
        }
      },      
    },      
    useminPrepare: {      
      buzzer:{
        src:'public/plugins/buzzer/*.html',                  
        options:{
          dest:'public/plugins/buzzer/dist'
        }
      },
      sortMe:{
        src:'public/plugins/sortMe/*.html',                  
        options:{
          dest:'public/plugins/sortMe/dist'         
        }
      },
      quickPoll:{
        src:'public/plugins/quickPoll/*.html',                  
        options:{
          dest:'public/plugins/quickPoll/dist'         
        }
      },
      checkIn:{
        src:'public/plugins/checkIn/*.html',                  
        options:{
          dest:'public/plugins/checkIn/dist'         
        }
      },
      openResponse:{
        src:'public/plugins/openResponse/*.html',                  
        options:{
          dest:'public/plugins/openResponse/dist'         
        }
      },
      posterMaker:{
        src:'public/plugins/posterMaker/*.html',                  
        options:{
          dest:'public/plugins/posterMaker/dist'         
        }
      },
      wheelWord:{
        src:'public/plugins/wheelWord/*.html',                  
        options:{
          dest:'public/plugins/wheelWord/dist'         
        }
      },
      randomizer:{
        src:'public/plugins/randomizer/*.html',                  
        options:{
          dest:'public/plugins/randomizer/dist'         
        }
      },
      wordAttack:{
        src:'public/plugins/wordAttack/*.html',                  
        options:{
          dest:'public/plugins/wordAttack/dist'         
        }
      },
      wordSearch:{
        src:'public/plugins/wordSearch/*.html',                  
        options:{
          dest:'public/plugins/wordSearch/dist'         
        }
      } 
      
    },    
    usemin:{      
      html:[
          //buzzer
          'public/plugins/buzzer/dist/buzzerStudent.html',
          'public/plugins/buzzer/dist/buzzerTeacher.html',                  
          //SortMe
          'public/plugins/sortMe/dist/sortMeStudent.html',
          'public/plugins/sortMe/dist/sortMeTeacher.html',
          //QuickPoll
          'public/plugins/quickPoll/dist/quickPollStudent.html',
          'public/plugins/quickPoll/dist/quickPollTeacher.html',
          //CheckIn
          'public/plugins/checkIn/dist/checkInStudent.html',
          'public/plugins/checkIn/dist/checkInTeacher.html',
          //OpenResponse
          'public/plugins/openResponse/dist/openResponseStudent.html',
          'public/plugins/openResponse/dist/openResponseTeacher.html',
          //OpenResponse
          'public/plugins/posterMaker/dist/posterMakerStudent.html',
          'public/plugins/posterMaker/dist/posterMakerTeacher.html',
          //WheelWord
          'public/plugins/wheelWord/dist/wheelWordStudent.html',
          'public/plugins/wheelWord/dist/wheelWordTeacher.html',
          //Randomizer
          'public/plugins/randomizer/dist/randomizerStudent.html',
          'public/plugins/randomizer/dist/randomizerTeacher.html',
          //WordAttack
          'public/plugins/wordAttack/dist/wordAttackStudent.html',
          'public/plugins/wordAttack/dist/wordAttackTeacher.html',
          //WordSearch
          'public/plugins/wordSearch/dist/wordSearchStudent.html',
          'public/plugins/wordSearch/dist/wordSearchTeacher.html'               
      ]
    },
    rev: {
      options: {
        encoding: 'utf8',
        algorithm: 'md5',
        length: 8
      },
      assets: {
        files: {
          src: [
            //buzzer
            'public/plugins/buzzer/dist/js/*.js',
            'public/plugins/buzzer/dist/css/*.css',              
            //SortMe
            'public/plugins/sortMe/dist/js/*.js',
            'public/plugins/sortMe/dist/css/*.css',
            //QuickPoll
            'public/plugins/quickPoll/dist/js/*.js',
            'public/plugins/quickPoll/dist/css/*.css',
            //CheckIn
            'public/plugins/checkIn/dist/js/*.js',
            'public/plugins/checkIn/dist/css/*.css',
            //OpenResponse
            'public/plugins/openResponse/dist/js/*.js',
            'public/plugins/openResponse/dist/css/*.css',
            //PosterMaker
            'public/plugins/posterMaker/dist/js/*.js',
            'public/plugins/posterMaker/dist/css/*.css',
            //WheelWord
            'public/plugins/wheelWord/dist/js/*.js',
            'public/plugins/wheelWord/dist/css/*.css',
            //Randomizer
            'public/plugins/randomizer/dist/js/*.js',
            'public/plugins/randomizer/dist/css/*.css',
            //WordAttack
            'public/plugins/wordAttack/dist/js/*.js',
            'public/plugins/wordAttack/dist/css/*.css',
            //WordSearch
            'public/plugins/wordSearch/dist/js/*.js',
            'public/plugins/wordSearch/dist/css/*.css'                    
          ]
        }
      }
      
    },
    jadeUsemin: {
      main: {
        options: {
          uglify: true, //optional - whether to run uglify js besides concat [default=true]
          prefix: '../../public/', //optional - add prefix to the path [default='']
          replacePath: {
            
          }
        },
        files:[{
          src: [
            'views/join/indexJoin.jade',
            'views/session/indexSession.jade',
            'views/session/indexClassroomListNew.jade'
          ]
        }]
      },
      edit: {
        options: {
          uglify: true, //optional - whether to run uglify js besides concat [default=true]
          prefix: '../../../public/', //optional - add prefix to the path [default='']
          replacePath: {
            
          }
        },
        files:[ {
          src: [
            'views/adventures/edit/indexEdit.jade'
          ]
        }]
      }
    },
    bump: {
      options: {
        files: ['package.json'],
        updateConfigs: [],
        commit: true,
        commitMessage: 'Release v%VERSION%',
        commitFiles: ['package.json'],
        createTag: true,
        tagName: 'v%VERSION%',
        tagMessage: 'Version %VERSION%',
        push: false,
        pushTo: 'upstream',
        gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d'
      }
    },
        
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-newer');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-jade-usemin');
  grunt.loadNpmTasks("grunt-contrib-concat");
  grunt.loadNpmTasks("grunt-contrib-cssmin");
  grunt.loadNpmTasks('grunt-rev');
  grunt.loadNpmTasks("grunt-usemin");
  grunt.loadNpmTasks('grunt-bump');

  grunt.registerTask('default', ['copy:vendor', 'newer:uglify', 'newer:less', 'concurrent']);
  grunt.registerTask('build', ['copy:vendor', 'uglify', 'less']);
  grunt.registerTask('lint', ['jshint']);
  grunt.registerTask('production', ['requirejs','jadeUsemin']);
  grunt.registerTask('productionjade', ['jadeUsemin']);
  grunt.registerTask('build1', ['requirejs','jadeUsemin','copy:webappHtml','clean:plugins','useminPrepare','concat','cssmin','uglify','rev','usemin']);  
 // grunt.registerTask('bump', ['bump']);
};

module.exports = function (grunt) {
    require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);
    var fs = require("fs"),
        tasks = grunt.cli.tasks[0],
        appConfigs = (tasks == 'dev') ? grunt.file.readJSON('appConfigDev.json') : grunt.file.readJSON('appConfig.json');

    require('time-grunt')(grunt);
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            all: {
                src: ['dev', 'zip']
            }
        },
        copy: (function () {
            var r = {};
            var apps = appConfigs.apps;
            for (var app in apps) {
                var _app = r[app] = {};
                _app.files = apps[app].copy;
            }
            return r;
        })(),
        cssmin: {
            main: {
                expand: true,
                src: 'dev/**/*.css',
                dest: ''
            }
        },
        imagemin: {
            dynamic: {
                files: [
                    {
                        expand: true,
                        src: ['dev/**/*.{png,jpg,gif}'],
                        dest: ''
                    }
                ]
            }
        },
        requirejs: {
            compile: {
                option: {
                    baseUrl: "/dev/10000001/App/js/",
                    mainConfigFile: "index.js",
                    name: "index",
                    out: "out/"
                }
            }
        },
        uglify: {
            dev: {
                expand: true,
                src: ['dev/**/*.js', "!dev/**/lib/*.js"],
                dest: '',
                options: {
                    mangle: false,
                    footer: '\n/*! BUILD:<%= grunt.template.today("yyyy-mm-dd HH:mm:ss") %> */'
                }
            },
            release: {}
        },
        usemin: {
            html: 'dev/**/*.html'
        },
        'string-replace': {
            main: {
                src: 'dev/**/CERT',
                dest: 'dev/',
                options: {
                    replacements: [{
                        pattern: "=timestamp=",
                        replacement: '' + (+new Date())
                    }]
                }
            }
        },
        compress: (function () {
            var r = {}, apps = appConfigs.apps;
            for (var app in apps) {
                var cfg = apps[app].compress;
                r[app] = cfg;
            }
            return r;
        })(),
        watch: {
            scss : (function(){
                var r = {
                    files: [],
                    tasks: ['sass','watch:css'],
                    options: {
                        spawn: false
                    }
                },
                apps = appConfigs.apps,
                files = [];
                for (var app in apps) {
                    files.push(app+'/App/scss/**/*.scss');
                };
                r.files = files;
                return r;
            }()),
            css: {
                files: ['**/*.css', '!dev/**/*.css', '!node_modules/**/*.css'],
                tasks: ['copy']
            },
            js: {
                files: ['**/*.js', '!dev/**/*.js', '!node_modules/**/*.js'],
                tasks: ['copy']
            },
            html: {
                files: ['**/*.html', '!dev/**/*.html', '!node_modules/**/*.html'],
                tasks: ['copy']
            }
        },
        //自定义插件,给每个文件做MD5签名，为后面的增量更新做号准备
        dazeRev: {
            basePath: "dev/**",
            options: {
                done: function () {
                    console.log("done");
                }
            }
        },
        concat: {
            main: {
                options: {
                    process: function (src, filepath) {
                        var path = filepath.replace("CERT", "package");
                        var pkg = grunt.file.readJSON(path),
                            cfg = grunt.file.readJSON(filepath),
                            zipFile = "zip/" + filepath.match(/[0-9]{8}/)[0] + ".zip";

                        var appId = "id:" + pkg.package.id + "\r\n",
                            timestamp = cfg.lastmodified,
                            name = "名称:" + pkg.package.name + "\r\n",
                            desc = "描述:" + pkg.package.description + "\r\n" + "----------------------------------------------------------\r\n",
                            now = "build:" + grunt.template.today("yyyy-mm-dd hh:mm:ss") + "\r\n",
                        //count = "文件总数: " + cfg.fileVer.length + '\r\n',
                            size = "ZIP文件大小: " + fs.statSync(zipFile).size / 1000 + 'kb\r\n';

                        var lastModified = "version:" + timestamp + "\r\n";

                        var sp = "\r\n==========================================================\r\n";
                        src = appId + name + desc + now + lastModified + size + sp;
                        console.log(timestamp);
                        return src;
                    }
                },

                files: {'dev/release.txt': 'dev/**/CERT'}
            }
        },
        sass : (function(){
            var r = {
                dist : {
                    options: {
                        sourcemap: 'none',
                        style: 'expanded'
                    },
                    files : []
                }
            },
            apps = appConfigs.apps,
            files = [];
            for (var app in apps) {
                var _obj = {
                    expand: true,
                    cwd: app+'/App/scss/',
                    src: '**/*.scss',
                    dest: app+'/App/css/' ,
                    ext: '.css'
                }
                files.push(_obj);
            };
            r.dist.files = files;
            return r;
        }())
    });

    grunt.registerTask('default', ['clean:all', 'sass', 'copy', 'cssmin', 'imagemin', 'uglify:dev', 'usemin', 'string-replace', 'dazeRev', 'compress', 'concat']);
    grunt.registerTask('nouglify', ['clean:all', 'sass','copy', 'usemin', 'string-replace', 'dazeRev', 'compress', 'concat']);
    grunt.registerTask('dev', ['sass','clean', 'copy', 'watch']);
    grunt.registerTask('zip', ['compress']);
};

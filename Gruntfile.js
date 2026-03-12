const sass = require('sass');

module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        
        OBSIDIAN_PATH: process.env.OBSIDIAN_PATH || '',

        /* 1. Get OBSIDIAN_PATH from .env file */
        env: {
            vault : {
                src: ".env"
            }
        },

        /* 2. Compile Sass to CSS (Unminified for dev, Minified for dist) */
        sass: {
        	options: {
        		implementation: sass,
        		sourceMap: true
        	},
            unminified: { 
                options: {
                    style: 'expanded'
                },
                files: {
                    'src/css/main.css': 'src/scss/index.scss'
                }
            },
            minified: {
                options: {
                    style: 'compressed'
                },
                files: {
                    'src/css/main.min.css': 'src/scss/index.scss'
                }
            }
        },

        /* 3. Concatenate CSS files
            (Primary.css = Readable for debugging)
            (theme.css = Minified for final Obsidian use)  */
        concat_css: {
            unminified: {
                files: {
                    'Primary.css': [
                        'src/css/readme.css',
                        'src/css/fonts/*.css',
                        'src/css/main.css', /* Fixed: Now grabs the readable version */
                        'src/css/style-settings.css'
                    ]
                }
            },
            dist: {
                files: {
                    'theme.css': [
                        'src/css/readme.css',
                        'src/css/fonts/*.css',
                        'src/css/main.min.css',
                        'src/css/style-settings.css'
                    ]
                }
            }
        },

        copy: {
            toVault: {
                expand: true,
                src: 'theme.css',
                dest: '<%= OBSIDIAN_PATH %>/',
            }
        },

        /* 4. Watch for changes and run tasks in a logical order */
        watch: {
            css: {
                files: ['src/**/*.scss', 'src/**/*.css'],
                tasks: ['sass:unminified', 'sass:minified', 'concat_css', 'copy:toVault', ]
            }
        }
    });

    /* Load the Gruntfile plugins  */
    grunt.loadNpmTasks('grunt-env');
    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-concat-css');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');

    /* Bridges the gap between the .env file and Grunt's configuration */
    grunt.registerTask('loadenv', function() {
        var path = process.env.OBSIDIAN_PATH;
        if (!path) {
            grunt.log.error("OBSIDIAN_PATH not found in .env!");
        } else {
            grunt.config('OBSIDIAN_PATH', path);
            grunt.log.ok("Target Vault Path: " + path);
        }
    });

    /* Default command triggered when you just type `grunt` in terminal */
    grunt.registerTask('default', ['env:vault', 'loadenv', 'watch']);
};

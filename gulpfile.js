// Using Gulp to run Nightwatch test suites from inside JUnit tests.
// Using Gulp because frontend (see maven deps) provides an easy way
// of running it.
// See NightwatchTest and it's impls.

var gulp  = require('gulp');
var shell = require('gulp-shell');

var nightwatch_env = process.env.NIGHTWATCH_ENV_ARG;
if (nightwatch_env) {
    nightwatch_env = '--env ' + nightwatch_env + ' '
} else {
    nightwatch_env = ''
}

if (process.argv.length === 4 && process.argv[2] === '--test') {
    gulp.task('default', shell.task('nightwatch --suiteRetries 2 ' + nightwatch_env + process.argv[3].toString()));
} else {
    gulp.task('default', shell.task('nightwatch --suiteRetries 2 ' + nightwatch_env ));
}

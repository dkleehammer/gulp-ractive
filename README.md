A simple gulp-plugin that writes compiled ractive templates to a javascript file.
Gulp example:

```
gulp.task('templates', function() {
    gulp.src("./templates/**/*.html")
        .pipe(ractive('templates.js', {
            namespace: '_GLOBAL.templates'
        }))
        .on("error", notify.onError("Error: <%= error.message %>"))
        .pipe(filesize())
        .pipe(gulp.dest('./public/js/'))
        .pipe(ifElse(isWatcher, livereload))
})
```

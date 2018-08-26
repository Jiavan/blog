---
title: Yeoman/Bower/Gulp前端自动化
date: 2016-03-04 16:26:13
tags:
- javascript
- 前端自动化
categories:
- javascript
---

![font-end-auto-tools.jpg](/images/font-end-auto-tools.jpg)

### bower，web包管理器
安装`npm install -g bower`，官方页面http://bower.io

比如利用bower安装jquery或者bootstrap，可以使用一下命令:
```
bower install jquery
bower install bootstrap
```
会从bower包管理器中查找已经在bower上注册的要安装的组件，找到以后去github上找到最新版本的下载地址，下载的组件将会被保存在目录下的bower_components目录下。

也可以用过github短语的形式进行安装，比如jquery在github的地址是jquery/jquery下，就能通过下面的方式安装：
```
bower install jquery/jquery
//注意，bower安装组件的时候，会将组件下载在bower当前命令执行的目录环境下的bower_components目录下
```

除了用上面的两种方式，bower还可以通过完整的github仓库地址进行安装，如：
```
bower install https://github.com/jquery/jquery.git
```

另外bower还可以直接通过url进行安装：
```
bower install http://sinaapp.com/jquery/1.7.2/jquery.js
```

<!--more-->

---

总结：
```
# installs the project dependencies listed in bower.json
$ bower install
# registered package
$ bower install jquery
# GitHub shorthand
$ bower install desandro/masonry
# Git endpoint
$ bower install git://github.com/user/package.git
# URL
$ bower install http://example.com/script.js
```
bower可很方便的安装和管理前端开发的一些框架和组件，但是单独使用bower也有局限性，在页面中使用bower安装的组件的使用，都需要写上bower_components的路径，可以结合grunt等工具来解决这个问题。

---

### Yeoman，整合最佳实践和工具，加速和方便开发

安装`npm install -g yo`，官方页面http://yeoman.io/

安装一个generator（生成器）：
```
//之前通过npm安装angular生成器
npm install generator-angular

//通过yoman建立一个angular项目
yo angular testangular
```
注意，yoman生成器生成的项目本身是基于Node构建的项目。

#### package.json，dependencies与devDependencies
它们都是项目所需要依赖的包，devDependencies是我们在开发过程中需要依赖的包，dependencies是项目在生产环境中需要依赖的包。

版本号的约定：
```json
"devDependencies": {
	"grunt": "^0.7.3"
}
```
尖括号是一个比较宽松的对版本的限制，它只限制主版号，主板本号不变时，npm会自动安装新的版本。如果是：
```json
"devDependencies": {
	"grunt": "～0.7.3"
}
```
波浪号是一个严格的版本要求限制，如果第二位版本号改变了npm就不会更新。

---

### Gulp，前端构建系统
#### task
定义gulp任务的文件gulpfile.js，通过gulp命令来运行：
```javascript
var gulp = require('gulp');
var uglify = require('gulp-uglify');

gulp.task('minify', function() {
    gulp.src('js/app.js')
        .pipe(uglify())
        .pipe(gulp.dest('build'))
});

//gulp minify
```
这里定义了一个名为minify的任务，为了压缩指定目录文件的js代码。task函数有两个参数，第一个是task的名称，第二个是回调函数。
```javascript
gulp.task('test', function() {
	console.log('this is gulp');
});
```

task有可能也是一系列任务，假设要定义一个任务build来执行css、js、imgs三个任务，我们可以指定一个任务数组而不是函数来完成。
```javascript
gulp.task('build', ['css', 'js', 'imgs']);
```
这些任务不是同时进行的，所以不能认为在js任务开始的时候css任务已经结束了，有可能css还没有完成，为了确保一个任务在另一个任务执行前已经结束，可以将函数和任务组结合起来指定其依赖关系。例如，定义一个css任务，在执行前需要检查greet任务是否已经执行完毕，可以像下面这样写：
```javascript
gulp.task('css', ['greet'], function() {
	//deal
});
```
这样在执行css任务时，gulp会先执行greet任务，然后再它结束后执行css回调。

#### default task
可以定义一个在gulp开始运行的时候默认执行的任务，并将这个任务命名为default。
```javascript
gulp.task('default', function() {
	//your default task
});
```

#### src
gulp.src()函数用字符串匹配一个文件或者一个文件编号，称为glob，然后创建一个对象流来代表这些文件。src方法输入一个glob（匹配一个或者多个文件）或者glob数组，然后返回一个可以传递给插件的数据流。
```javascript
gulp.src(['js/*/*.js', '!js/*/*.min.js'])
//匹配js目录下没有被压缩的文件
```

#### plugins
gulp拥有许多的插件，而且调用方法也相同（通过传递文件对象流），它们通常会对这些文件进行修改，然后返回新的文件对象流给下一个插件。

常用的一些插件如jshint，uglify，concat（将所有文件合合并到一个文件）。

#### gulp-load-plugins
gulp-load-plugins模块能自动的从package.json中加载任意gulp插件然后把他们附加到一个对象上：
```javascript
var gulpLoadPlugins = require('gulp-load-plugins');
var plugins = gulpLoadPlugins();

gulp.task('js', function() {
	return gulp.src('js/*.js')
		.pipe(plugins.uglify())
		.pipe(concat('app.js'))
		.pipe(gulp.dest('build'));
});
```
在执行上面的代码后，插件对象就已经包含了插件，package.json文件如下：
```javascript
{
	"devDependencies": {
		"gulp-concat": "~2.2.0",
		"gulp-uglify": "~0.2.1",
		"gulp-jshint": "~1.5.1",
		"gulp": "~3.5.6"
	}
}
```
后续发布的gulp-load-plugins还提供了**延迟加载**功能，提高了插件的性能，只有在执行任务的时候才会加载所用的插件，其它部相关的插件不会被加载。

##### watching files
gulp可以监听文件的修改动态，文件在被改动的时候执行一个或多个任务。这个功能十分方便。你可以修改less文件，gulp会自动的转换为css文件并更新浏览器。

使用gulp中的watch方法可以监听文件，它接受一个glob或者glob数组和src一样，以及一个任务组来执行回调。

##### gulp实践
首先安装gulp及其依赖：
```
npm install --save-dev gulp
npm install --save-dev gulp-concat
npm install --save-dev gulp-uglify
npm install --save-dev gulp-rename
```
在项目目录下新建gulpfile.js文件并输入以下内容：
```javascript
var gulpLloadPlugins = require('gulp-load-plugins');
var gulp = require('gulp');
var plugins = gulpLloadPlugins();

gulp.task('default', ['js']);

gulp.task('js', function() {
    gulp.src('js/*.js')
    .pipe(plugins.concat('app.js'))
    .pipe(gulp.dest('dist/js'))
    .pipe(plugins.uglify())
    .pipe(plugins.rename('app.min.js'))
    .pipe(gulp.dest('dist/js/'));
});

gulp.task('watcher', function() {
    gulp.watch('js/*.js', ['js']);
});
```
在命令行中输入`gulp js`，就会启动js任务，首先找到js目录下的所有js文件，然后合并为app.js文件输出到dest/js目录下然后进行js代码压缩、重命名最后输出到dist/js目录下。

watcher任务可以监视js目录下的所有js文件，当文件发生了改变时会调用js任务重复上面的步骤。

### 思考
gulp相比于grunt来说是要简单了很多，没有这么繁琐的配置步骤，文件对象流实现，效率更高。与学弟也有一些探讨，包括yoeman/bower的使用，类似与yoeman这种东西用构建器可以快速的完成一个如angular项目的构建，但是个人觉得并不是很好用，到底怎么样还是仁者见仁智者见智吧，不过bower还是挺好用的。

----

参考文章
0. http://www.w3ctech.com/topic/134
1. http://www.gulpjs.com.cn/docs/getting-started/
2. https://segmentfault.com/a/1190000000372547

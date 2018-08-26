---
title: Javascript模块化编程及编写加载遵循AMD规范的代码
date: 2016-03-18 16:58:23
tags:
- javascript
- AMD
categories:
- javascript
---

# 最原始的写法
模块就是实现一组特定功能的方法，把不同的函数简单的放在一起就是一个模块。

# 对象写法
把模块写成一个对象，所有的模块成员都放到这个对象里面。
```javascript
var module1 = new Object({
    _count: 10,
    func1: function () {
        console.log('this is fun1');
    },
    func2: function () {
        console.log('this is func2');
    }
});

module1.func1();
```
要使用模块成员的时候直接调用模块成员就行了，但是这样的写法会暴露所有的模块成员，内部状态可以被外部改写，比如外部直接可以改写_count的值。

# 立即执行函数写法
使用立即执行函数的写法可以达到不暴露私有成员的目的。
```javascript
var module = (function () {
    var _count = 10;
    var func1 = function () {
        console.log(_count);
    };
    var func2 = function () {
        console.log(_count);
    };

    return {
        func1: func1,
        func2: func2
    };
})();

module.func1();
```
这样的写法外部不能访问到_count变量。

<!--more-->

# 放大模式
当一个模块需要继承一个模块，或者一个模块需要添加功能时，可以使用放大模式
```javascript
var module = (function () {
    var _count = 10;
    var func1 = function () {
        console.log(_count);
    };
    var func2 = function () {
        console.log(_count);
    };

    return {
        func1: func1,
        func2: func2
    };
})();

var module = (function (mod) {
    var name = 'jiavan';
    mod.func3 = function () {
        console.log('name is' + name);
    };
    return mod;
})(module);

module.func3();
console.log(module.name);//undefind
```
增加了新的函数后，返回了新的module。

# 宽放大模式
在浏览器环境中，各个模块通常是从网上获取的，有时不知道那个模块会先加载，如果采用上面的写法可能会导致modul还没有加载就被使用，加载一个不存在的空对象，这时就要采用“宽放大模式”：
```javascript
var module = (function () {
    var _count = 10;
    var func1 = function () {
        console.log(_count);
    };
    var func2 = function () {
        console.log(_count);
    };

    return {
        func1: func1,
        func2: func2
    };
})();

var module = (function (mod) {
    var name = 'jiavan';
    mod.func3 = function () {
        console.log('name is' + name);
    };
    return mod;
})(module||{});//如果没有module还没有被加载，传入一个空对象

module.func3();
console.log(module.name);//undefind
```
与上面的模式相比，宽放大模式的立即执行函数的参数可以是空对象。

# 输入全局变量
独立性是模块的重要特点，模块内部最好不要直接与其他模块交互，为了在模块内部调用全局变量，必须显示的将其他变量输入模块。
```javascript
var module = (function($, YAHOO) {
    //....
})(jQuery, YAHOO);
```
将jQuery和YAHOO两个库当做参数输入到module中，这样做即保证了模块的独立性，还使得模块之间的依赖关系变得明显。

----

# AMD模块诞生背景
在nodejs的CommonJS规范中可以使用require来加载模块，如：
```javascript
var module1 = require('mod');
module1.someFunc();
```
这样的写法存在一个很明显的问题，要执行第二行必须要等待模块加载完成后才可以，着在服务器端似乎没有多大问题，因为记载模块的时间大约就是I/O耗时，但是在浏览器端问题就比较明显，js模块都在服务器端下载，长时间的不响应会导致浏览器假死。

因此，在浏览器端的模块不能采用同步加载，只能采用异步加载，这就是AMD规范诞生的背景。

# AMD
Asynchronous Module Definition的意思就是异步模块定义，它采用异步方式加载模块，模块的加速不影响它后面语句的运行。所有依赖这个模块的语句，都定义在一个回调函数中，等到加载完以后，这个回调函数才会运行。

AMD也采用require语句来加载模块，但是不同于CommonJS的是，他要求两个参数：
```javascript
require([module], callback);
```

第一个参数[module]，是一个数组，成员就是要加载的模块，第二个参数callback，就是加载成功后的回调函数。如果将上面的Node模块加载形式改为AMD形式，就是下面的：
```javascript
require(['mod'], function() {
    mod.someFunc();
});
```
模块和回调函数的加载是异步的，浏览器就不会出现假死的情况，所以AMD比较适合浏览器环境。

实现了AMD规范的库有：require.js和curl.js。

---

# 为何使用require.js
当一个页面有许多js文件并且各个文件之间存在依赖关系：
```javascript
<script src="1.js"></script>
<script src="2.js"></script>
<script src="3.js"></script>
<script src="4.js"></script>
<script src="5.js"></script>
```
依赖性越强的就越要往后面放，这样的写法有很明显的缺点，加载的时候浏览器会停止网页渲染，加载的文件越多，网页失去响应的时间就越长，很强的依赖关系也使得代码编写和维护变得困难。

require.js就是为了解决这两个问题的：
0. 实现js文件的异步加载，避免网页失去响应
1. 管理模块之间的依赖性，便于代码的编写和维护

# require.js的加载
```javascript
<script src="js/require.js" defer async="true"></script>
```
将requirejs放到网页的底部或者使用defer,async属性进行异步加载，IE只支持defer

加载自己的模块，假设我们的模块是main.js：
```javascript
<script src="js/require.js" data-main="js/main"><script>
```
`data-main`属性的作用是指定网页程序的主模块，上面的是main.js，这个文件会被第一个加载，由于requrie.js的默认文件名是js，所以可以将main.js写成main

# 主模块的写法
上面的main.js称为主模块，意思是整个网页的入口代码，有点像
C语言的main函数。

如果我们的代码布衣赖任何其他模块，可以直接写入javascript代码
```javascript
//main.js
alert('main.js加载成功');
```
但是这样的话，使用require就没有什么意义了，真正常见的情况是主模块依赖于其他模块，这时就需要使用AMD规范定义的require函数。
```javascript
require(['mod1', 'mod2', 'mod3'], function (mod1, mod2, mod3) {
    //some code here
});
```

使用require异步加载，浏览器不会失去响应，只有前面的模块加载成功后，才会运行，解决了依赖问题。

#  模块的加载
使用require.config()方法，可以对模块的加载行为进行自定义，require.config()就写在主模块main.js的头部，参数是一个对象，paths属性就是各个模块的加载路径：
```javascript
require.config({
    paths: {
        'mod1': 'modA',
        'mod2': 'modB',
        'mod3': 'modC'
    }
});
```
当模块在同一个目录下时，可以使用上面的写法，在不同的路径下可以写成下面的形式：
```javascript
require.config({
    paths: {
        'mod1': 'lib/modA',
        'mod2': 'lib/modB',
        'mod3': 'lib/modC'
    }
});
```
或者直接改变基目录：
```javascript
require.config({
    baseUrl: 'js/lib',
    paths: {
        'mod1': 'modA',
        'mod2': 'modB',
        'mod3': 'modC',
        'modExt': 'http://www.xxx.com/xxx.js'//模块在另一个主机上
    }
});
```

# AMD模块的写法
模块必须采用特定的define函数来定义，如果一个模块不依赖其他模块，可以直接定义在define函数中：
```javascript
//math.js
define(function () {
    var add = function (x, y) {
        return x + y;
    };

    return {
        add: add
    };
});

//main.js
require(['math'], function (math) {
    console.log(math.add(1, 2));
});

//html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>

</body>
<script src="require.js" defer async="true"></script>
<script src="require.js" data-main="main"></script>
</html>
```
输出3

如果定义的模块还依赖于其他模块，那么define函数的第一个参数必须是一个数组，指明该模块的依赖性：
```javascript
//main.js
require(['math', 'print'], function (math) {
    math.add(100, 200);
});

//math.js
define(['print'], function (print) {
    var add = function (x, y) {
        print.log(x + y);
    };

    return {
        add: add
    };
});

//print.js
define(function () {
    var log = function (str) {
        console.log(str);
    };

    return {
        log: log
    }
});
```
输出300

上面的例程定义了一个print模块用于输出，在math模块中依赖了print模块并用于输出，所以在定义math模块的时候，第一个参数是print构成的数组，并作为参数传入了math模块中进行了调用，最后在主模块中加载了math，print模块，实现了相互依赖模块的异步加载。

---
> 注：本文内容是对http://www.ruanyifeng.com/blog/2012/10/javascript_module.html系列文章的学习总结，感谢原作者的分享。

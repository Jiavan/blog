---
title: 浅析JS中的自定义事件
date: 2016-04-04 02:22:16
tags:
- javascript
categories:
- javascript
---

![./images/js-event-target.png](./images/js-event-target.png)
在JS中事件是与浏览器进行交互的主要途径，事件与DOM进行交互是最常见的方式，但是也可以用于非DOM代码中，实现自定义的事件。自定义事件的主要概念是创建一个管理事件的对象，用来删除，增加，触发事件等。事件是瞬间触发的，所以自定义事件也一样，当程序执行到某处时，触发了用户注册的事件处理程序完成这个过程。

在下面我们实现了一个自定义的事件管理类，以及一个弹出层对话框的Dialog组件，这个组件继承了事件类里的方法，通过给Dialog实例注册事件以及用户的操作进行触发，完成了自定义事件大概的过程。

下面的内容涉及到了JS中prototype chain，继承模式等相关姿势，不太熟悉的同学可以先看看JS面向对象部分相关的内容。

<!--more-->

# 先上代码
```javascript
function EventTarget() {
    this._handlers = {};
}

EventTarget.prototype = {
    constructor: EventTarget,
    addEvent: function (type, fn) {
        if (typeof type === 'string' && typeof fn === 'function') {
            if (typeof this._handlers[type] === 'undefined') {
                this._handlers[type] = [];
            }
            this._handlers[type].push(fn);
        }
    },
    fireEvent: function (event) {
        if (!event.target) {
            event.target = this;
        }

        if (this._handlers[event.type] instanceof Array) {
            var handlers = this._handlers[event.type];
            for (var i = 0; i < handlers.length; i++) {
                handlers[i](event);
            }
        }
    },
    removeEvent: function (type, handler) {
        if (this._handlers[type] instanceof Array) {
            var handlers = this._handlers[type];
            for (var i = 0; i < handlers.length; i++) {
                if (handlers[i] === handler) {
                    handlers.splice(i, 1);
                    break;
                }
            }
        }
    }
};
```
这可以看成是一个工具类，写过DOM事件管理类的同学应该觉得比较熟悉，通过封装addEventListener或者attachEvent来进行事件注册等等。这里也一样只是进行了简单的封装。

_handlers用于存放事件处理程序，addEvent注册事件，也是注册事件类型，如果没有该事件类型，那么我们就创建一个自定义类型的事件，并把事件处理程序push到该类型的数组，所以一种type可能对应了多个事件处理程序，fireEvent通过传入事件对象，以及event.type来进行事件触发(执行对应的函数)，removeEvent就是删除对应的事件处理程序。

# 那么用途呢？
下面我们定义了一个Dialog组件并继承了EventTarget就能绑定自定义的事件啦。。。
```javascript
function extend(subType, supType) {
    var proto = Object(supType.prototype);
    subType.prototype = proto;
    subType.constructor = subType;
}

function Dialog(id) {
    EventTarget.call(this);
    this.dialog = document.getElementById(id);
    var that = this;
    document.querySelector('#close').onclick = function () {
        that.close();
    };
}

extend(Dialog, EventTarget);

Dialog.prototype.show = function () {
    this.dialog.style.display = 'block';
    this.fireEvent({
        type: 'showPageCover'
    });
};

Dialog.prototype.close = function () {
    this.dialog.style.display = 'none';
    this.fireEvent({
        type: 'closePageCover'
    });
};

function openDialog () {
    var dialog = new Dialog('dialog');
    dialog.addEvent('closePageCover', function () {
        document.querySelector('.page-cover').style.display = 'none';
    });
    dialog.addEvent('showPageCover', function () {
        document.querySelector('.page-cover').style.display = 'block';
    });
    dialog.show();
}
```

这里是组件的代码，以及绑定自定义的事件对遮罩层隐藏/显示，因为遮罩层是不属于Dialog组件的，所以如果将遮罩层的代码写到Dialog中，这样就会造成代码耦合度较高的情况，通过自定事件，将遮罩层处理的事件处理程序注册到Dialog，实现松散耦合。

html页面代码如下：
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <style>
        * {
            padding: 0;
            margin: 0;
        }

        .dialog {
            width: 300px;
            height: 200px;
            background-color: #666;
            position: absolute;
            top: 50%;
            left: 50%;
            margin-left: -150px;
            margin-top: -100px;
            border-radius: 5px;
            display: none;
        }

        .dialog #close {
            width: 20px;
            height: 20px;
            float: right;
            cursor: pointer;
            background-color: red;
            border: 0;
            position: relative;
        }

        .dialog .title {
            height: 20px;
        }
        .page-cover {
            width: 100%;
            height: 100%;
            position: absolute;
            background-color: #999;
            opacity: 0.4;
            display: none;
        }
    </style>
</head>
<body>
<div class="page-cover"></div>
<input type="button" value="Click" id="button" onclick="openDialog()">
<input type="button" value="Click Clear" onclick="clearClose()">
<div class="dialog" id="dialog">
    <img src="" id="close">
    <div class="title">title</div>
    <div class="content"></div>
</div>
<script src="script.js"></script>
</body>
</html>
```

----

> 参考文章：

> http://www.jb51.net/article/33697.htm
> http://www.jb51.net/article/33698.htm
> http://baike.baidu.com/view/1854779.htm
> http://www.zhangxinxu.com/wordpress/2012/04/js-dom%E8%87%AA%E5%AE%9A%E4%B9%89%E4%BA%8B%E4%BB%B6/
> http://www.jb51.net/article/40978.htm



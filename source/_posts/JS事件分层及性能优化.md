---
title: JS事件分层及性能优化
date: 2016-03-24 20:11:21
tags:
- javascript
- dom
categories:
- javascript
---

# HTML事件处理程序
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <script>
        function clickHander() {
            alert('click');
        }
    </script>
</head>
<body>
<p onclick="alert(event.type)">hi jiavan</p>
<p onclick="clickHander()">handler</p>
</body>
</html>
```
html事件处理程序的主要缺点
0. 可能会出现事件被触发了而事件处理程序还没有被加载
1. 文档行为与文档结构耦合程度高

<!--more-->

# DOM 0级事件处理程序
将函数值赋值给一个事件处理程序属性。**每个元素都有自己的事件处理程序属性**：
```javascript
var bt = document.getElementById('bt');
bt.onclick = function() {
    alert('hi');   
}
bt.onclick = null;//删除事件处理程序
```
DOM0级事件处理程序被认为是元素的方法，因此事件处理程序在元素的作用域下运行，this指向的是当前的元素。

# DOM 2级事件处理程序
```javascript
var btHandler = function () {
        alert(this.id);
    };
    var btHandler2 = function () {
        alert(this.title);
    };
    var bt = document.getElementById('bt');
    bt.addEventListener('click', btHandler, false);
    bt.addEventListener('click', btHandler2, false);
    bt.removeEventListener('click', btHandler2, false);//移除事件
```
优点
0. 能添加多个事件处理程序，按添加顺序调用
1. 方便移除事件处理程序，能设置在什么阶段触发
2. 行为与结构分离

# 跨浏览器的事件处理
```javascript
var EventUtil = {
    addHandler: function (element, type, handler) {
        if (element.addEventListener) {
            element.addEventListener(type, handler, false); //DOM2级事件处理
        } else if (element.attachEvent) {
            element.attachEvent('on' + type, handler); //IE事件处理
        } else {
            element['on' + type] = handler; //DOM0级事件处理
        }
    },
    removeHandler: function (element, type, handler) {
        if (element.removeHandler) {
            element.removeEventListener(type, handler, false);
        } else if (element.attachEvent) {
            element.detachEvent('on' + type, handler);
        } else {
            element['on' + type] = null;
        }
    }
};

var p = document.getElementById('jiavan');
EventUtil.addHandler(p, 'click', function () {
    alert(this.id);
});
EventUtil.addHandler(p, 'mouseover', function() {
    alert('mouseover');
})；
```

# 事件对象
在触发DOM上的某个事件时，会产生一个event对象，该对象包含了与事件有关的信息。在事件处理程序内部，this始终等于currentTarget，而target只包含事件实际目标，如果事件处理程序直接给了目标元素，那么3个值相等。
```javascript
var btn = document.getElementById('btn');
document.body.onclick = function (event) {
    alert('body'); //事件在传播到body之前被阻止，所以此处不会执行
};
btn.addEventListener('click', function(event) {
    alert('click');
    event.stopPropagation(); //立即停止事件在DOM层次中传播，可取消事件冒泡或事件捕获
}, false);
```
注：event只会存在事件处理程序执行期间，一旦处理完成，该对象将会被销毁。

----

# UI事件
## load
当页面完全加载后就会触发window上面的load事件，图像上面也可以触发load事件。
```javascript
window.addEventListener('load', function() {
        alert('window load');
    }, false);

    var image = document.createElement('img');
    image.addEventListener('load', function () {
        alert('img load');
    }, false);
    image.src = 'https://avatars3.githubusercontent.com/u/6786013?v=3&s=460';
```
注意：当img设置完src属性后就会下载图片，所以应该在src设置之前绑定事件处理程序。

## unload，resize，scroll事件
```javascript
window.addEventListener('unload', function () {
        console.log('unload');
    }, false);

    window.addEventListener('resize', function () {
        console.log('resize');
    });

    window.addEventListener('scroll', function () {
        console.log('scroll');
    }, false);
```

# 鼠标事件
通过event对象获得鼠标事件产生的位置信息。
event.clientX/Y，在**浏览器窗口**中发生的位置
event.pageX/Y，在**页面**中发生的位置
所以在没有滚动的页面下，clientX/Y的值和pageX/Y的值是相等的

如果不支持事件对象的页面，可以通过document.body(混杂模式)，document.documentElement(标准模式)中的scrollTop和scrollLeft属性计算。

事件位置信息还可以是相对于**整个屏幕**的位置，可以用screenX/Y属性来获得。

# HTML5事件
## beforeunload
在浏览器页面卸载之前触发，可以取消卸载并继续使用原来的页面，为了显示弹出对话框，必须将event.returnValue的值设置为要显示给用户的字符串，同时作为函数的值返回。
```javascript
window.addEventListener('beforeunload', function (event) {
        var message = '真的要离开吗？';
        event.returnValue = message;
        return message;
    }, false);
```
注：事件发生在window上，并且要将returnValue和函数返回值设置为要显示的信息。

# 事件性能和内存
添加到页面中的事件处理程序数量将会直接影响到页面整体运行性能，导致这一问题的原因是多方面的，首先每个函数都是对象，都会占用内存，其次频繁访问DOM会延迟整个页面的交互就绪时间。

事件处理程序过多问题的解决方案是**事件委托**，事件委托利用了**事件冒泡**，指定一个事件处理程序，就可以管理某一类型的所有事件，例如click事件会一直冒泡到document层次，也就是说，我们可以为整个页面指定一个onclick事件处理程序，而不必给每个元素添加事件处理程序。

如果可行，可以给document对象添加一个事件处理程序，处理页面上发生的某种特定类型事件，与传统方法相比，具有如下优点：
0. document对象很快就可以访问
1. DOM引用更少
2. 整个页面占用的内存空间更少，能提升整体性能
```javascript
document.addEventListener('click', function (event) {
        var target = event.target;
        switch (target.id) {
            case 'one': alert('one'); break;
            case 'two': alert('two'); break;
            case 'three': alert('three'); break;
        }
    }, false);
```

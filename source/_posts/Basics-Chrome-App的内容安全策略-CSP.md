---
title: Basics.Chrome App的内容安全策略(CSP)
date: 2016-01-06 06:03:17
categories:
- chromeapp
tags:
- chromeapp
---

如果你不熟悉内容安全策略CSP(Content Security Policy), 这里有一个[关于CSP的介绍](http://www.html5rocks.com/en/tutorials/security/content-security-policy/), 该文档覆盖更为广泛的网络平台对CSP的看法. Chrome App的内容安全策略不是那么的灵活, 你也应该阅读[Chrome扩展应用的内容安全策略](https://developer.chrome.com/extensions/contentSecurityPolicy), 它是作为Chrome App内容安全策略的基础. 为了简洁起见,我们在这里不要重复相同的信息.

CSP是一种为了减轻跨站点脚本的安全策略, 我们都知道, 跨站点脚本是不好的. 我们不会试图说服你, CSP是一个温暖而舒适的新的策略. 涉及的工作: 你需要学习如何使用不同的方式来做基本任务.

本文档的目的是为了告诉你什么是Chrome App中的CSP. 你该如何的去遵守他, 以及你可以通过遵守CSP来完成基本的任务.

<!--more-->

#### 什么是Chrome App中的CSP
Chrome App CSP限制你执行下面的操作:

- 你不能在App的页面中使用内联脚本, 禁止`<script>`代码块和事件处理(`<button onclick="...">`)
- 你不能引用你App外的任何资源(除了视屏和音频资源), 你不能在iframe嵌入外部资源.
- 你不可以使用字符串转换为JavaScript函数, 例如`eval()` 和 `new  Function()`.

这通过下面的策略来实现:
```
default-src 'self';
connect-src * data: blob: filesystem:;
style-src 'self' data: chrome-extension-resource: 'unsafe-inline';
img-src 'self' data: chrome-extension-resource:;
frame-src 'self' data: chrome-extension-resource:;
font-src 'self' data: chrome-extension-resource:;
media-src * data: blob: filesystem:;
```

你的App只能引用你App内的脚本和对象, 除了媒体文件(你的App可以引用外部的音频和视屏文件). Chrome扩展程序的CSP可能会让你觉得比较轻松, 但是App并非如此.

#### 如何遵守CSP
所有JavaScript和所有资源都应该在本地(一切都打包在Chrome App).

#### 但是我该怎么做...
在CSP的约束下你运用的一些模板库很有可能不会工作, 你也可能想要你的App访问外部资源(外部图片, 来自web站点的一些内容).

##### 使用模板库
使用模板库需要你提供已经准备好了的预编译模板, 你也可以使用没有经过预编译的模板. 但是你需要做一些工作并且还有一些限制.

你需要使用沙箱来分离你想通过`eval` 来实现的内容, 沙箱操作CSP在你指定的内容上. 如果你想在App中使用功能非常强大的api, 沙箱中的内容不能直接与这些api进行交互([查看沙箱与本地内容](https://developer.chrome.com/apps/app_external#sandboxing)).

##### 访问远程资源
你可以通过`XMLHttpRequest ` 来获取远程资源, 通过`blob:, data:,` 或`filesystem:` 的URL来处理([查看如何引用外部资源](https://developer.chrome.com/apps/app_external#external)).

视屏和音频资源可以通过远程访问, 因为当离线或则连接不流畅时, 他们有较好的行为反馈.

##### 嵌入WEB内容
并不是使用iframe, 你可以使用webview标签来调用一个外部URL([查看如何嵌入外部网页](https://developer.chrome.com/apps/app_external#webview)).

---
title: Basics.Chrome App的生命周期
date: 2016-02-16 14:28:53
tags:
- javascript
- chromeapp
categories:
- chromeapp
---

应用程序运行时和事件页面是负责管理应用的生命周期, 应用程序运行时管理应用程序安装,控制活动页面,可以随时关闭应用程序. 事件页面监听程序在运行时触发的一些事件和管理程序什么时候启动如何启动.

#### 生命周期是如何工作的
应用程序从用户的桌面加载事件页面, `onLaunch` 事件将会被触发. 这个事件告诉事件页面那个窗口将会被启动和窗口的大小. 这里的生命周期图并不是最好的,但它是实用的(我们很快就会使它更好的)。
![chrome-app-lifecircle.png](/images/chrome-app-lifecycle.png)

当事件页面没有可执行的JavaScript, 没有等待回调, 没有打开的窗口, 运行时将会卸载事件页面和关闭应用程序. 在卸载事件页面之前, `onSuspend()` 事件将会被触发. 在应用程序关闭之前这让事件页面机会做简单的清理任务.

<!--more-->

#### 创建事件页面和窗口
每个Chrome App必须有事件页面, 这个页面包含了这个App的顶级逻辑结构并且负责创建其他窗口页面.

##### 创建事件页面
创建页面事件需要在`manifest` 文件中包含`background` 属性并且在脚本数组中包含`background.js` , 任何要使用的库/脚本首先需要添加到`background` 属性中:

```javascript
"background": {
  "scripts": [
    "foo.js",
    "background.js"
  ]
}
```

你的事件页面必须包含`onLaunch()` 函数, 无论你通过哪种方式来启动你的App, 这个函数是最先被调用的.

```javascript
chrome.app.runtime.onLaunched.addListener(function() {
	// tell your app what to launch and how
});
```

##### 创建窗口
一个事件页面可能会创建多个窗口.  默认情况下, 这些窗口创建一个脚本连接到活动页面和页面直接可用的事件.

Chrome App的窗口不会与Chrome浏览器中的窗口发生任何联系, 他们有可选的框架来控制窗口的标题栏和大小, 还有一个声明窗口的ID, 窗户没有ID重启后不会恢复到它们的大小和位置.

这里有一个简单的例子通过`background.js` 来创建一个窗口:

```javascript
chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('main.html', {
    id: 'MyWindowID',
    bounds: {
      width: 800,
      height: 600,
      left: 100,
      top: 100
    },
    minWidth: 800,
    minHeight: 600
  });
});
```

##### 包含启动数据
根据你App的启动方式, 你可能需要处理一些数据在事件页面. 默认情况下, 通过Chrome Launcher来启动的程序没有数据. 对有需要处理文件的程序, 你需要操作`launchData.items` 参数来允许他们被执行.

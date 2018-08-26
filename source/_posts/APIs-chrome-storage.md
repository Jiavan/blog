---
title: APIs.chrome.storage
date: 2016-01-30 14:48:05
categories:
- chromeapp
tags:
- javascript
- chromeapp
---

## chrome.storage
|描述     |使用`chrome.storage API`来存储、检索和跟踪更改用户数据|
|--------|-------------------|
|可用性   |从Chrome 20开始     |
|权限     |"storage"          |
|内容脚本 |完全支持             |
|更多     |[Chrome Apps Office Hours: Chrome Storage APIs ](https://developers.google.com/live/shows/7320022/) <br/> [Chrome Apps Office Hours: Storage API Deep Dive](https://developers.google.com/live/shows/7320022-1/)|

### 概述
这个API进行了优化，以满足特定的存储需求的扩展。它提供了与`localStorage API`相同的功能，它们之间的差异有以下关键几点：
- 用户的数据可以被自动的同步，在`Chrome sync`机制下(使用`using storage.sync`)。
- 应用程序的内容脚本可以直接访问用户数据而不需要背景页(background.js)。
- 尽管用户使用了隐身模式，应用程序的扩展设置仍然可以使用。
- 它用于大部分的异步读写操作，因此，他会比阻塞和序列化的`localStorage API`要快。
- 用户的数据可以保存在一个对象中(`localStorage API`保存的数据是string)。
- 企业策略由管理员配置的扩展可以读取(使用存储。管理模式)。

<!--more-->

### Manifest
你需要在`manifest`文件中声明`storage`权限，例如：
```json
{
   "name": "My extension",
   ...
   "permissions": [
     "storage"
   ],
   ...
}
```

### 用法
为存储你App的数据你可以使用`storage.sync`或者`storage.local`，当你使用`storage.sync`的时候用户的数据将会被自动同步到Chrome浏览器登录的用户下，提供用户同步数据。

当Chrome处于离线的时候，Chrome将会把数据存储在本地。当在线的时候，它就会同步数据。即使用户关闭了同步，`storage.sync`仍然会工作。在这种情况下，它和storage.local行为完全相同。
>机密的数据不应该被存储，因为存储区域没有被加密！

` storage.managed`是只可读的(>=Chrome 33)。

### 示例
下面这个例子是保存一个textarea里面的值：
```javascript
function saveChanges() {
    // Get a value saved in a form.
    var theValue = textarea.value;
    // Check that there's some code there.
    if (!theValue) {
      message('Error: No value specified');
      return;
    }
    // Save it using the Chrome extension storage API.
    chrome.storage.sync.set({'value': theValue}, function() {
      // Notify that we saved.
      message('Settings saved');
    });
}
```
如果你有对跟踪更改数据对象有兴趣，你可以增加一个`onChanged`事件，每当`storage`有任何改变的时候，这个事件将会被触发。下面是一个存储改变的实例：
```javascript
chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (key in changes) {
      var storageChange = changes[key];
      console.log('Storage key "%s" in namespace "%s" changed. ' +
      'Old value was "%s", new value is "%s".',
      key,
      namespace,
      storageChange.oldValue,
      storageChange.newValue);
    }
});
```

### 总结
|类型|属性|事件|
|---|---|---|
|StorageChange|sync|onChanged
|StorageArea|local||
||managed|||
//chrome.storage.local.set({name: "jiavan", age: 20},function(){console.log("storage success")});
#### StorageArea(sync/local)
常用方法：

**get**<br/>
```
StorageArea.get(string or array of string or object keys, function callback);
```
从存储区域获取一条甚至更多信息。

|参数|||
|---|
|字符串/字符串数组/对象|键名(可选参数)|一个键,键的列表,或一个字典指定默认值(见对象的描述)。一个空的列表或对象将返回一个空的对象结果。通过传null获得全部值。|
|函数|回调函数|如：`chrome.storage.local.get(null, function(info){console.log(info);});`

**set**<br />
```javascript
StorageArea.set(object items, function callback);
```
|参数|||
|---|
|object|item项|对象赋予每个键/值对来更新存储。其他存储键/值对将不会受到影响。|
|函数|可选的回调函数|如：`chrome.storage.local.set({name: "jiavan", age: 20},function(){console.log("storage success")});`

**remove**<br />
```javascript
StorageArea.remove(string or array of string keys, function callback);
```
移除一个或者多个item。

|参数|||
|---|
|字符串/字符串数组|键值|一键或者键列表用于移除|
|函数|可选的回调函数|回调成功/如果错误将会保存` runtime.lastError`|

**clear**
```javascript
StorageArea.clear(function callback);
```
删除`storage`里面所有的数据。唯一的参数是可选的回调函数，删除失败同上。

>整理自 Chrome APIs storage - https://developer.chrome.com/apps/storage

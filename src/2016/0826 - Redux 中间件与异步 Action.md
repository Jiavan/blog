---
title: Redux中间件与异步Action
date: 2016-08-26 11:26:11
tags:
  - flux
  - redux
  - react
  - javascript
categories:
  - javascript
  - react
  - redux
  - flux
---

在之前的[浅谈Flux架构及Redux实践](http://jiavan.com/flux-and-redux/)一文中我们初步的谈及了Redux的数据流思想，并做了一个简单的加减器。但是还没有接触到Redux更多常用的场景，异步操作、API调用，如何连接到UI层等，Redux可以与很多框架搭配包括Vue、React甚至是纯JavaScript。后面我们会用一个实例--通过github API获取个人信息，来将Redux middleware、async action、连接到React贯穿其中。先看看我们最后写的demo的样子。

![/images/redux-demo.png](http://ocjx6ku93.bkt.clouddn.com/flux2-1-redux-demo.png)

<!--more-->

## Middleware与异步Action
依然先看看Redux作者Dam的描述：
> It provides a third-party extension point between dispatching an
action, and the moment it reaches the reducer.

我的理解是，middleware提供了一个你可以修改action的机制，这和Express/Koa的中间件有些类似，只不过这里的中间件主要是操作action。中间件对异步的action实现非常重要，因为在之前的文章中我们谈到，action是一个行为抽象，只是一个对象，reducer是一个纯函数，不应该有API调用和副作用的操作。那么怎么解决异步的问题？我们肯定不能在reducer中写，那么就考虑到了action -> reducer这个过程，这就是redux middleware：

```
action -> middleware modify action -> reducer
```

它提供的是位于 action 被发起之后，到达 reducer 之前的扩展点。 你可以利用 Redux middleware 来进行日志记录、创建崩溃报告、调用异步接口或者路由等等。

在上一篇文章中我们使用的同步action，action creator返回的是一个对象，但是异步action可以是一个函数，虽然函数也是对象，这里我们只是为了区分两种不同的情况。通过使用指定的 middleware，action creator可以返回函数。这时，这个 action creator 就成为了 thunk。当 action creator 返回函数时，这个函数会被 Redux Thunk middleware 执行。这个函数并不需要保持纯净，它还可以带有副作用，包括执行异步 API 请求。这个函数还可以 dispatch action，就像 dispatch 前面定义的同步 action 一样。那么如何在action中进行网络请求？标准的做法是使用 Redux Thunk middleware。要引入 `redux-thunk` 这个专门的库才能使用。

## 搭建工作流
我们将采用ES6语法，webpack进行打包，webpack-dev-server启一个本地服务器，然后用HMR技术进行React热加载，看看webpack配置信息：

```javascript
var webpack = require('webpack');
var OpenBrowserPlugin = require('open-browser-webpack-plugin');

module.exports = {
  entry: {
    index: [
      'webpack/hot/dev-server',
      'webpack-dev-server/client?http://localhost:8080',
      './src/index.js',
    ]
  },
  output: {
    path: './build',
    filename: '[name].js',
  },
  devtool: 'source-map',
  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'babel',
      query: {
        presets: ['es2015', 'stage-0', 'react'],
      },
    }, {
      test: /\.less$/,
      loader: 'style!css!less',
    }],
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new OpenBrowserPlugin({ url: 'http://localhost:8080' }),
  ]
};
```
其中`open-browser-webpack-plugin`插件将会帮助我们自动打开浏览器，用`babel`进行es编译，`less`来维护我们的css样式，以及使用dev-tool来生成source map，`HotModuleReplacementPlugin`来进行热更新。

再看看我们最后的目录结构：
```
├── build
│   ├── index.html
│   └── index.js
├── node_modules
├── package.json
├── src
│   ├── actions
│   │   └── actions.js
│   ├── components
│   │   ├── index.js
│   │   ├── Profile
│   │   │   ├── Profile.js
│   │   │   └── Profile.less
│   │   └── Search
│   │       ├── Search.js
│   │       └── Search.less
│   ├── containers
│   │   ├── App.js
│   │   ├── App.less
│   │   └── test.less
│   ├── index.html
│   ├── index.js
│   └── reducers
│       └── reducers.js
└── webpack.config.js
```

其中`containers`放置我们的容器组件，`components`放置展示性组件，打包入口是`index.js`。

## Demo
### Redux

**state**<br />
使用Redux非常重要的一点就是设计好顶层的state，在demo中我们需要的state大概长这个样子：
```
{
  isFetchingData, // boolean
  username, // string
  profile, // object
}
```
其中`isFetchingData`是网络请求的状态，正在拉取数据为true，`username`是我们要获取用户信息的名字，`profile`是我们拉取用户的详细信息，这个将会是一个Ajax请求，最后由github API提供。

**actions**<br />
同步action我们不再讲述，上一篇文章已经说得比较清楚，这里我们重点说异步action，app的所有action如下：

```javascript
export const GET_INFO = 'GET_INFO'; // 获取用户信息
export const FETCHING_DATA = 'FETCHING_DATA'; // 拉取状态
export const RECEIVE_USER_DATA = 'RECEIVE_USER_DATA'; //接收到拉取的状态

// async action creator
export function fetchUserInfo(username) {
  return function (dispatch) {
    dispatch(fetchingData(true));
    return fetch(`https://api.github.com/users/${username}`)
    .then(response => {
      console.log(response);
      return response.json();
    })
    .then(json => {
      console.log(json);
      return json;
    })
    .then((json) => {
      dispatch(receiveUserData(json))
    })
    .then(() => dispatch(fetchingData(false)));
  };
}
```
上面网络请求用到了`fetch`这个API，它会返回一个Promise，还比较新可以使用社区提供的polyfill或者使用纯粹的XHR都行，这都不是重点。我们看看这个action生成函数返回了一个函数，并且在这个函数中还有`dispatch`操作，我们通过中间件传入的dispatch可以用来dispatch actions。在上面的promise链式中首先我们打印了github API返回Response object，然后输出了json格式的数据，然后dispatch了`RECEIVE_USER_DATA`这个action表示接收到了网络请求，并需要修改state(注：这里我们没有考虑网络请求失败的情况)，最后我们dispatch了`FETCHING_DATA`并告诉对应reducer下一个state的isFetchingData为false，表示数据拉取完毕。

**reducer**<br />
这里看看最核心的reducer，操作profile这一块的：
```javascript
function profile(state = {}, action) {
  switch (action.type) {
    case GET_INFO:
      return Object.assign({}, state, {
        username: action.username,
      });
    case RECEIVE_USER_DATA:
      return Object.assign({}, state, action.profile);
    default: return state;
  }
}
function isFetchingData() {...}
function username() {...}
const rootReducer = combineReducers({
  isFetchingData,
  username,
  profile,
});
export default rootReducer;
```
将拉取到的profile对象assign到之前的state，最后通过`combineReducers`函数合并为一个reducer。

### 连接到React
我们通过`react-redux`提供的`connect`方法与`Provider`来连接到React，`Provider`主要的作用是包装我们的容器组件，`connect`用于将redux与react进行连接，connect() 允许你从 Redux store 中指定准确的 state 到你想要获取的组件中。这让你能获取到任何级别颗粒度的数据，了解更多可以参考它的[API](http://cn.redux.js.org/docs/react-redux/api.html)，这里我们不再敖述。它的形式可以是这样：
```javascript
function mapStateToProps(state) {
  return {
    profile: state.profile,
    isFetchingData: state.isFetchingData,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    fetchUserInfo: (username) => dispatch(fetchUserInfo(username))
  };
}

class App extends Component {
  render() {
    const { fetchUserInfo, profile, isFetchingData } = this.props;
    return (
      <div className='container'>
        <Search fetchUserInfo={fetchUserInfo} isFetchingData={isFetchingData} />
        {'name' in profile ? <Profile profile={profile} isFetchingData={isFetchingData} /> : ''}
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
```
`connect`是个可以执行两次的柯里化函数，第一次传入的参数相当于一系列的定制化东西，第二次传入的是你要连接的React组件，然后返回一个新的React组件。第一次执行时传入的参数是mapStateToProps, mapDispatchToProps, mergeProps, options。也就是说这里相当于帮组容器选择它在整个Store中所需的state与dispatch回调，这些将会被connect以Props的形式绑定到App容器，我们可以通过React开发者工具看到这一点：

![](http://ocjx6ku93.bkt.clouddn.com/flux2-2-react-dev-tools.png)

第一次执行，选择需要的state，第二次传入App容器组件然后返回新的组件。然后创建整个应用的store：

```javascript
const loggerMiddleware = createLogger();
const store = createStore(
  rootReducer,
  compose(
    applyMiddleware(
      thunkMiddleware,
      loggerMiddleware,
    ),
    window.devToolsExtension ? window.devToolsExtension() : f => f
  )
);
```
这里我们用到了两个中间件，`loggerMiddleware`用于输出我们每一次的action，可以明确的看到每次action后state的前后状态，`thunkMiddleware`用于网络请求处理，最后`window.devToolsExtension ? window.devToolsExtension() : f => f`是为了连接我们的[redux-dev-tool](https://github.com/gaearon/redux-devtools#chrome-extension)，可以明确的看到我们dispatch的action，还能达到时间旅行的效果。最后通过`Provider`输入我们的store，整个应用就跑起来啦！
```javascript
let mountRoot = document.getElementById('app');
ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  mountRoot
);
```

### Run
命令行输入`npm run dev`，整个应用就跑起来了，在输入框输入Jiavan，我们来看看action与数据流：

![](http://ocjx6ku93.bkt.clouddn.com/flux2-3-action-logger.png)

在console面板，logger中间件为我们打印除了每一次dispatch action以及前后的state值，是不是非常直观，然而厉害的还在后面。redux-dev-tool可以直接查看我们state tree以及对action做undo操作达到时间旅行的效果！
![](http://ocjx6ku93.bkt.clouddn.com/flux2-4-redux-state-chart.png)
![](http://ocjx6ku93.bkt.clouddn.com/flux2-5-redux-time-travel.png)

完整的demo在文章最后将会贴出，现在总结下：首先我们规划了整个应用的state，然后进行数据流层的代码开发，同步异步action的编写以及reducer的开发，再通过选择我们容器组件所需的state与dispatch回调通过connect方法绑定后输出新的组件，通过创建store与Provider将其与React连接，这样整个应用的任督二脉就被打通了。最后极力推荐Redux的官方文档。

完整demo -> https://github.com/Jiavan/react-async-redux

运行
```shell
1. npm install
2. webpack
3. npm run dev
```

参考文章:

* http://cn.redux.js.org/docs/react-redux/api.html
* http://www.jianshu.com/p/ab9e4d4c8a4b

转载请注明出处 http://jiavan.com/react-async-redux/

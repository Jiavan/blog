## Layout Unit & Subpixel Layout

### 引言

为了更好的支持移动端和 PC 端的缩放，WebKit 增加了`subpixel layout`（次像素/亚像素布局）为此他们还改变了 rendering tree。一个次像素单元在 WebKit 内被称为 LayoutUnit 用于取代之前使用整数来布局一个元素在页面中位置和大小。从 2013 年开始 WebKit 就已经开启了这个 flag。

### LayoutUnit

LayoutUnit 是逻辑像素的一种抽象表示，在 WebKit 的实现中它是一个像素的 1/64，这样我们就可以使用整数来进行布局计算，避免了使用[浮点数计算](https://zh.wikipedia.org/wiki/IEEE_754)而丢失精度的问题。

虽然我们现在在布局计算时使用了 LayoutUnit，但是在最终将计算值渲染对应到设备上时仍然会出现计算值不能与物理像素对齐的情况。因为计算出的值可能是一个小数而 1 个物理像素已经不能再进行切割。所以出现了这样一个问题，次像素如何与物理像素进行对齐？

回到我们实际的编程过程中，我们会有很多场景遇到次像素的问题，只是很多人不会关注，或者会忽略掉这些细节。比如如果一个 box 的宽度是 10px，我们把它平均分成 3 份，那么里面的三个盒子的宽度分别是多少呢，3.3333px？再比如我们在使用 rem 布局的时候有时候会发现一个正方形设置了 border-raduis 预期让它展示成一个圆形，在一些设备上却并不那么圆，在整体比较小的时候可能会被渲染成一个椭圆形。以及这种时候这个元素还设置了一个 background-size 覆盖整个容器但是背景却被切掉了一小块。这些问题不是那么容易被发现，但是确实是存在的。

### 场景

现在我们有一个 50px 的容器（DPR 为 1）将他分成 3 份，必然会出现小数的情况，看看每一份渲染在屏幕上的宽度是多少。

```html
<div class="container">
    <div style="background: #111"></div>
    <div style="background: #222"></div>
    <div style="background: #333"></div>
</div>
```

```css
.container {
    display: flex;
    width: 50px;
    height: 30px;
    background: #999;
}
.container div {
    flex: 1;
    height: 100%;
}
```

```js
const getWidth = () => {
    const container = document.querySelector('.container');
    const nodes = Array.prototype.slice.call(container.children);
    nodes.forEach((i, index) => {
        console.log(
            `${index} width: ${i.clientWidth}, computed width: ${
                i.getBoundingClientRect().width
            }`
        );
    });
};
getWidth();
```

```
// console
0 width: 17, computed width: 16.671875
1 width: 16, computed width: 16.671875
2 width: 17, computed width: 16.671875
```

我们发现三份的 clientWidth 并不是一样的，其中一个会少一像素，但是它们的宽度加起来仍然是容器的宽度。而通过 getBoundingClientRect 获得的计算值却是一样的，但是并不像我们预期的一样是 50/3 = 16.666666667，而是 16.671875 看起来也并没有什么四舍五入的关系。但是从上面的例子中我们可以得到的一个结论就是，上面三份中的宽度最终在屏幕上并不是完全一致的，这也会导致我们在其他场景下遇到类似的问题，比如说在一个页面中同一个组件渲染出来的元素在页面的多个位置上可能表现出不一致的情况，有些元素可能渲染出来会多 1px 或者少 1px，在像素越小的地方对比度就会越明显，比如一个高度是 3px，另一个 2px，这样就会看出明显的差异。而如果一个是 100px 另一个是 101px，你可能就没有感知了。

上面还有一个问题没有解决，就是计算值和我们预期不一致。这里就可以通过 LayoutUnit 来解释。上面我们提到在布局的使用会使用 subpixel layout 把一个像素分成 64 份。这样我们看看 WebKit 在布局的时候是怎么就算的：

```
1. container width: 50px * 64 => 3200
2. 每一个子 div: 3200 / 3 = round(1066.666666667) => 1067
3. 最终计算值: 1067 / 64 => 16.671875
```

通过上面的计算我们发现结果和 getBoundingClientRect 获得的值完全吻合，所以这里计算元素大小的时候浏览器内核使用了 subpixel layout，而不是直接使用原来的 pixels。

这里仍然面临了另一个问题，我们使用 subpixel layout 计算出来的值仍然是一个小数，但是我们布局的时候是如何和物理像素进行对齐的呢？上面少掉 1px 的元素仅是因为把 getBoundingClientRect 的值进行四舍五入？那这样也应该全是 17px，而单单中间的一个元素少了一像素？

### 如何对齐

在进行 subpixel 和 pixel 之间转换时，有两种方式，一种是 `enclosingIntRect` 另一种是 `pixelSnappedIntRect` 在上述的例子中使用了第二种转换方式。

![](/Users/jiazhengquan/GitHub/blog/src/assets/webkit-layout-types.png)

上面的图中，灰色格子代表物理像素，蓝色区域表示 subpixel layout 计算值，黑色区域表示最终 subpixel -> pixel 的对齐结果。

**enclosingIntRect 算法**：

```
x: floor(x)
y: floor(y)
maxX: ceil(x + width)
maxY: ceil(y + height)
width: ceil(x + width) - floor(x)
height: ceil(y + height) - floor(y)
```

这种计算方式很简单，直接选择最小的完全能覆盖住计算结果的物理像素区域。

**pixelSnappedIntRect 算法**:

```x: round(x)
y: round(y)
maxX: round(x + width)
maxY: round(y + height)
width: round(x + width) - round(x)
height: round(y + height) - round(y)
```

pixelSnappedIntRect 的计算也很简单，它直接 round 到离自己最近的一个物理像素。

接着上面的例子，我们现在把 50px 分层 6 份来模拟计算下看看每一份的宽度计算值应该是多少：

```
1. container width: 50px * 64 => 3200
2. 每一个子 div: 3200 / 6 = round(533.333333333) => 533
3. 最终计算值: 533 / 64 => 8.328125
```

```
// log
0 width: 8, computed width: 8.328125
1 width: 9, computed width: 8.328125
2 width: 8, computed width: 8.328125
3 width: 8, computed width: 8.328125
4 width: 9, computed width: 8.328125
5 width: 8, computed width: 8.328125
```

看到 js 算出来的值和我们算出来的是一致的，并不简单的是 50/6 = 8.333333333。在最终渲染的时候：

-   第一个元素：直接从容器左边开始绘制，发现 8.328125 多余的小数无法解决直接 round 到最近物理像素，得到 8px 绘制空间，但是在逻辑空间上第一个元素占用了第 9 个像素 0.328125px 空间，为了和物理像素对齐，下一个元素应该在绘制时加上这块空间。
-   第二个元素：8 + 8.328125 + .328125 => 16.65625 => round(16.65625) => 17，这里第二个元素加第一个元素宽度应该是 17px 所以第二个元素宽度是 9px 而不是 8px，这里其实两个元素加起来还不足 17px，由于对齐规则四舍五入，让第二个元素直接到 17px，在第三个元素绘制时其实左边还有 17 - 16.65625 => 0.34375px 的逻辑空间。
-   第三个元素：由于左边还有剩余的逻辑空间，17 + 8.328125 - 0.34375 => 24.984375 => round(24.984375) => 25。此时宽度来到了 25，减去之前第一二个元素的宽度 17，得到第三个元素宽度为 8px。
-   第四个元素：按照上述规则就不具体说明，25 + 8.328125 - (25 - 24.984375) => 33.3125 => round(33.3125) => 33；33 - 25 => 8px。
-   第五个元素：33 + 8.328125 + 0.3125 => 41.640625 => round(41.640625) => 42；42 - 33 => 9px。
-   第六个元素：剩余 50-41.640625 => 8.359375，对齐到最近的空间剩余 8px。

和上述 js 获取的 clientWidth 结果 8，9，8，8，9，8 完全一致。所以这里元素的大小可以通过 `pixelSnappedIntRect` 对齐方式来解释为什么有些元素会多/少一像素并且出现是「没有规则」的。

### 如果选择

上面介绍了 2 种对齐方式，那么在什么场景下 WebKit 用什么算法呢？以及所有的布局都会使用 subpixel layout 么？

为了保证一些场景下的一致性渲染，并不是所有场景都会使用 subpixel，比如说在计算 border 的时候就不会，这样避免了我们设置了一个 border，渲染出来的元素上边可能会比下边还多出 1px。以及在**大部分**的场景中计算元素的大小的时候会使用 `pixelSnappedIntRect` 。在少数的一些 case 下会使用 `enclosingIntRect` 计算，比如一个 RenderBlock 中的 SVG 盒子，因为需要保证盒子能完全包含住子树。具体的细节可以参看 WebKit 的[文档](https://trac.webkit.org/wiki/LayoutUnit)或源码。

### 最佳实践？

#### 同一组件不同结果

布局计算值有小数带来渲染结果不一致的情况经常发生在 rem 布局中，由于 DPR 的转换导致一些设备下很多场景都是小数。比如下面就是一个常见的真实业务场景。

![](/Users/jiazhengquan/GitHub/blog/src/assets/subpixel-layout-popup.png)

在实现一个 popup 组件或者 dialog 组件时经常会有一些选项，css 也是能绘制出来的，比如上面 9 个红色的圆点，它们都是一个组件，预期宽高都是 10px，但是通过一系列的换算后第一个却变成了 9px，第二个又是 10px，9 个原点渲染出来不尽相同。

下面实现的选择项 icon 是没有问题的，为了避免这种不一致我们选择使用了图片，svg 或者直接 base64 一张 png 到组件里面，但是如果将 png 图作为一个背景放入一个固定宽高的盒子中仍然可能有问题。

#### 背景割裂

如果有一个容器宽高都是 10px，设置一个 backgroundImage，大小和容器一样大，可能会出现背景被「割裂」的情况，因为容器可能会被渲染成 9 x 10 导致背景图一部分内容不可见。可以通过给容器设置一点点 padding 来解决这个问题。

还有很多类似这种渲染结果不符合我们预期的 case 基本都是因为使用 rem 布局导致的，解决它就是尽量 rem to px 时让它不要是一个小数，或者直接使用 px，或者不要使用 rem 布局！

---

- 文中 demo 参见 https://codepen.io/Jiavan/pen/xxbybop
- 推荐阅读 https://trac.webkit.org/wiki/LayoutUnit

如有错误欢迎指正。
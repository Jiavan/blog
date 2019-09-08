## VSCode 帮助贫困的乌干达儿童

最近把开发环境从 WebStorm 迁移到了世界上最好的编辑器 VSCode，因为需要经常开启多个项目，CPU 和内存都爆了只能弃坑。使用过一段时间 vsc 发现里面自带插件库有个叫做 vscodevim 的插件特别有意思。它使用了一些诡异的键位和模式，和普通编辑体验差别很大，但是一看评价这么高，下载量这么大，我一度怀疑自己。看来大家都很认可这个插件，坚持使用了一段时间，发现这些诡异的键位用起来是真的特别爽，颠覆了我对文本编辑体验的认知。接下来我要开始安利了！

### 模式

要学会使用 vim 首先要弄清楚它和其他编辑器最大的区别之一就是它拥有多个模式，而其他大部分编辑器就只有编辑模式，直接就能插入修改删除，作为一篇安利入门性质文章，我们需要知道 vim 中最重要的四种模式。

- normal<esc>：可以简单的理解为浏览模式，默认就是 normal，在这种状态下你可以移动光标，跳转翻页，也可以做一些其他如删除等操作，在插入模式下按 esc 回到 normal 模式。
- insert\<i>：就是常用编辑器的编辑态，符合我们常规的使用方式，在 normal 下按 i 键进入插入模式。
- command<:>: 在 normal 模式下按冒号进入命令模式，比如 `:wq` 退出 vim。
- visual<v>：和 normal 类似但是命令会高亮选中区域，类似普通编辑器选中了一段文本。

vim 不止这四种模式，但是这几种是比较常用到的，更多模式可以看 vim 文档。

### Text Object

vim 对文本进行了抽象，句子由单词组成，段落由句子组成，文章由段落组成，如一个单词就是一个 text-object，它配合 operator 可以进行一些非常高效的操作。常见文本对象的类型：

- iw - inner word
- aw - a word
- is - inner sentence
- as - a sentence
- ip - inner paragraph
- ap - a paragraph

如果结合下面要提到的 operator 就可以组合成一个指令如：daw(delete a word) 即可删除当前光标下的单词。

### Motion

vim 中使用一些 motion 可以快速的来移动光标，如：

- w: 到下一个单词
- b: 上一个单词
- h: 光标向左
- l: 光标向右
- j: 光标向下
- k: 光标向上
- G: 文本末尾行
- gg: 文本开始行
- zz: 屏幕中间
- %: 匹配一对符号的另一端
- ^: 行首
- \$: 行尾

### Operator

一个 vim 命令可以由 operator、number、motion 组成，我们先看 operator，它指的是一些操作如：

- d: 删除
- dd: 删除当前行
- c: 删除并进入插入模式
- y: 复制
- p: 粘贴
- s: 删除并进入插入模式
- x: 删除
- o: 向下插入一新行
- O: 向上插入一新行
- \>: 向右缩进
- <: 向左缩进
- u: 撤销上次操作
- .: 重复上次操作，这个很有用

现在结合 operator / motion / number:

- 2dd: 执行 2 次 dd 即为向下删除 2 行
- daw: 删除当前单词
- 2daw: 删除 2 个单词，包含单词旁边的空格，a 可以理解为 around
- 2diw: 删除 2 个单词，不删掉旁边空格
- c\$: 删除当前光标到当前行末尾的字符
- dG: 从当前行删除至文本末尾
- 2yy: 向下复制 2 行
- 2p: 粘贴 2 次复制的内容

### Surround

在 vim 中有一个逆天的插件 [vim-surround](https://github.com/tpope/vim-surround) 现在 vscodevim 中集成了它。它可以很方便的来处理环绕文本，在代码中总会有一些 `(){}[]<>''""` 符号，这个插件能很方便的处理它们。在 normal 模式下：

```bash
# cs"' 将双引号变成单引号
"hello world" -> 'hello world'

# cs"<p> 把双引号变成 p 标签
"hello world" -> <p>hello world</p>

# ds" 删掉两侧双引号
"hello world" -> hello world

# ysaw' 给 hello 加上单引号
"hello world" -> "'hello' world"
```

更多使用可以查看 https://github.com/tpope/vim-surround。

附上一张 vim 键位图，vim 开始适应需要一段时间，当形成肌肉记忆了用起来就很爽了。
![](https://raw.githubusercontent.com/Jiavan/blog/master/src/assets/vim-keymap.png)

### 输入法切换问题

VSCode 如果在 vi 的 insert 模式下使用了中文输入法，当回到 normal 模式的时候将会还是中文输入法，然后你使用 JKLH 的时候出现一堆拼音这样显然是很恶心的，被迫还要手动切回英文输入法，这里 VSCodeVim 其实已经提供解决方案那就是在切回 normal 模式的时候自动去切换输入法。详细可以看 https://github.com/VSCodeVim/Vim#input-method。

解决方案就是首先我们安装 [im-select](https://github.com/daipeihust/im-select) 这个 CLI，然后在 VSCode 添加以下设置：

```json
{
  "vim.autoSwitchInputMethod.enable": true,
  "vim.autoSwitchInputMethod.defaultIM": "com.apple.keylayout.US",
  "vim.autoSwitchInputMethod.obtainIMCmd": "/usr/local/bin/im-select",
  "vim.autoSwitchInputMethod.switchIMCmd": "/usr/local/bin/im-select {im}"
}
```

你的默认输入法不一定是 `com.apple.keylayout.US` 可以使用上面的 im-select 进行获取，然后替换成你想要设置的 defaultIM。以上是 macOS 的设置，其他平台可以参考上面 VSCodeVim 的官方文档。这样每次回到 normal 模式我们就会自动切回英文输入法。

### 快捷键

VSCode 自带了一些快捷键也是很好用的。

| 作用                                             | 快捷键                         |
| ------------------------------------------------ | ------------------------------ |
| 符号重命名，重命名变量很有用，文件中全部自动替换 | F2                             |
| 重新打开被关闭的编辑页面                         | cmd+ shift + t                 |
| 打开 terminal                                    | ctrl + `                       |
| 删除前一个单词（在 vsc 其他地方也是能用的）      | option + delete                |
| 上下移动选中行                                   | option + 上下箭头              |
| 多行编辑                                         | 按住 option 单击需要编辑的位置 |
| 切换 Tab 组                                      | ctrl + cmd + 左右箭头          |
| 搜索符号                                         | cmd + t                        |
| 搜索文件                                         | cmd + p                        |
| 搜索命令                                         | cmd + shift + p                |
| 切换左侧面板                                     | cmd + b                        |
| 打开文件管理                                     | cmd + shift + e                |
| 文件搜索面板                                     | cmd + shift + f                |
| 扩展搜索面板                                     | cmd + shift + x                |
| 在当前位置展示光标所在处变量、函数定义           | cmd + 鼠标移动到光标处         |
| 跳转到定义处                                     | F12                            |
| 复制当前打开文件的存放路径                       | cmd + k + p                    |
| 新建文件                                         | cmd + n                        |
| 打开新的 vsc 实例                                | cmd + shift + n                |

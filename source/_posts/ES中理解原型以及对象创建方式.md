---
title: ES中理解原型以及对象创建方式
date: 2016-03-05 20:06:49
tags:
- javascript
categories:
- javascript
---

### 工厂模式
```javascript
function createObj(name, age) {
    var o = {};
    o.name = name;
    o.age = age;
    o.sayName = function () {
        console.log(this.name);
    }
    return o;
}
var p1 = createObj('hi', 21);
var p2 = createObj('jiavan', 20);
```
问题：没有解决对象识别的问题。

<!--more-->

### 构造函数模式
创建对象可以使用自定义构造函数，从而定义自定义对象类型的属性和方法。
```javascript
function Person(name, age) {
    this.name = name;
    this.age = age;
    this.sayName = function () {
        alert(this.name);
    };
}
var p1 = new Person('jiavan', 29);
var p2 = new Person('hi', 20);
p1.constructor === Person;//true
p1.constructor === p2.constructor;//true
```
**使用new 操作符调用构造函数实际上会经历以下4个步骤**：

- 创建一个新的对象
- 将构造函数的作用域赋值给新的对象（因此this指向了新的对象），在没有new之前，如果构造函数在全局作用域下，this应该是指向window的，如果是直接在全局执行环境下调用了构造函数，那么this.name是挂在在window下的全局变量，如果是new操作符，则更改了this的指向。
- 执行构造函数中的代码
- 返回一个新的对象

constructor属性是用来标识对象类型的，但是用instanceof来检测会更可靠一些。

任何函数都可以通过new操作符来调用，与普通的函数没有任何区别，只是用途是不一样的。创建自定义的构造函数意味着可以将它的**实例作为一种特定的类型**，这也解决了工厂模式的对象识别问题。

构造函数模式的问题：
每个方法都要在每个实例上重新创建一遍，上面两个对象都有sayName方法，但是两个方法不是同一个Function实例，每次定义一个函数都实例化了一个对象。可以通过把函数的定义放到构造函数之外来解决这个问题。
```javascript
function Person(name, age) {
    this.name = name;
    this.age = age;
    this.sayName = sayName;
}

function sayName() {
    alert(this.name);
}
var p1 = new Person('jiavan', 29);
var p2 = new Person('hi', 20);
```
但是这样的做法又会出现新的问题，如果当构造函数需要定义很多方法，那么将会有许多的函数被定义在全局作用域下，那么就**缺失了OO的封装性**，就引入了原型模式。

### 原型模式
每个函数都有一个prototype属性（函数也是对象），这个属性是一个指针，指向一个对象。该对象指向的是该特定类型**所有实例所共享的属性和方法**，这样就可以直接将对象信息添加到原型对象中：
```javascript
function Person() {}
Person.prototype.name = 'jiavan';
Person.prototype.age = 20;
Person.prototype.sayName = function () {
    alert(this.name);
};
var p1 = new Person();
var p2 = new Person();
p1.sayName();//jiavan
p1.name === p2.name;//true
```

#### ECMAScript中的原型对象
无论什么时候，只要创建了一个函数就会为该函数创建一个prototype属性，该属性指向函数的原型对象，在默认情况下，所有原型对象都会自动获得一个constructor属性，这个属性指向prototype所在函数的指针。

在创建了自定义构造函数之后，其原型对象**默认只会获得constructor属性**，其他方法都是从Object继承而来。

当调用一个构造函数创建一个新的实例后，该实例内部将包含一个指针，指向构造函数的原型对象。在ES5中叫这个指针[[Prototype]]，每个对象上都支持一个属性__proto__（浏览器实现），在其它实现中这个属性对脚本则是完全不可见的，不过要明白的是**这个链接存在于实例与构造函数的原型对象之间，而不是存在于实例与构造函数之间**。

在所有的实现中都是不能访问到[[Prototype]]，但是可以通过isPrototypeOf()方法来确定对象件是否存在这种关系。

ES5中增加了一个新的方法，Object.getPrototypeOf(p1)，将会返回一个对象，这个对象就是该实例的原型。

属性搜索过程：首先会在对象实例的属性中查找，如果没有找到就会从对象实例的原型中查找。

注意：虽然可以通过对象实例来访问原型中的属性，但是**不能通过对象重写原型中的值**，如果在实例中添加了一个与原型重名的属性，那么实例属性将会屏蔽原型中的属性。换句话说重写同名属性只会阻止我们访问原型中的那个属性，但是并不能改变原型中属性的值。可以使用delete来删除实例属性，从而让我们能继续访问原型中属性的值。

#### prototype添加属性与重写prototype对象
上面提到了，在创建函数的时候就会创建原型对象，并且**原型对象自动会获得一个constructor属性**，如果按照下面的写法:
```javascript
function Person() {
    
}
Person.prototype = {
    name: 'jiavan',
    age: 20  
};
```
这样会切断掉prototype指向最初创建函数时的对象,而重新指向了新的对象，所以**constructor属性讲不会存在**，但是还是能用instanceof来判断类型。如果要存在constructor，也可以这样写：
```javascript
function Person() {
    
}
Person.prototype = {
	constructor： Person,
    name: 'jiavan',
    age: 20  
};
```
这也体现了原型的动态性。

#### 原型的动态性
注意：实例中的指针仅指向原型，而不指向构造函数。
```javascript
function Person() {
    
}
var p = new Person();
Person.prototype = {
    name: 'jiavan',
    age: 20,
    sayName: function () {
        console.log(this.name);
    }
};
p.sayName();
```
上面的代码会报错，因为在实例化对象后，prototype被重写了，但是最开始实例化对象的时候的的[[Prototype]]指向的是最初的原型而不是后面重写的原型对象，所以找不到sayName方法，但是改成下面就行了:
```javascript
function Person() {
    
}
Person.prototype = {
    name: 'jiavan',
    age: 20,
    sayName: function () {
        console.log(this.name);
    }
};
var p = new Person();
p.sayName();
```

#### 原型对象的问题
原型中所有的属性是被很多的实例共享的，这种共享对于函数非常合适，对于那些包含基本值的属性来说还行，通过在实例上添加一个同名的属性，可以隐藏原型中的对应属性。然而，对于包含引用类型值的属性来说，问题就比较突出了，修改引用类型的值会直接影响原型对象的值，导致也影响了其他实例的属性。

### 组合使用构造函数模式与原型模式
```javascript
function Person(name, age) {
    this.name = name;
    this.age = age;
    this.color = ['red', 'blue'];
}
Person.prototype = {
    constructor: Person,
    sayName: function () {
        console.log(this.name);
    }
};

var p1 = new Person('jiavan', 19);
var p2 = new Person('lzy', 20);

p1.color.push('green');
p1.color === p2.color;//false
p1.sayName === p2.sayName;//true
```
修改了p1实例的color但是并不会对p2造成影响，因为它们是不同的数组引用。这种构造函数与原型混合成的模式，是ES中用的最多的自定义类型方法。
---
title: JS数组去重的正确姿势？
date: 2016-02-01 21:54:06
tags:
- javascript
categories:
- javascript
---


## 编写uniqueArray
```javascript
var Unique = {
    /**
     * 双重循环去重
     * @param arr
     * @returns {*}
     */
    dbloop: function (arr) {
        var i,
            j,
            res = [];
        for (i = 0; i < arr.length; i++) {
            for (j = i + 1; j < arr.length; j++) {
                if (arr[i] === arr[j]) {
                    arr.splice(i, 1);//当出现相同的元素时，删除重复的元素
                }
            }
        }

        return arr;
    },

    /**
     * 哈希表形式
     * @param arr
     * @returns {Array}
     */
    hash: function (arr) {
        var i,
            hash = {},
            res = [];

        //查询hash对象是否存在当前元素(属性)
        for (i = 0; i < arr.length; i++) {
            if (!hash[arr[i]]) {
                res.push(arr[i]);
                hash[arr[i]] = true;
            }
        }

        return res;
    },

    /**
     * 借助indexOf方法
     * @param arr
     * @returns {Array}
     */
    indexOf: function (arr) {
        var i,
            res = [];

        //查询空数组里面是否已经存在这个值，不存在则推入
        for (i = 0; i < arr.length; i++) {
            if (res.indexOf(arr[i]) === -1) {
                res.push(arr[i]);
                console.log(arr[i]);
            }
        }

        return res;
    }
};

module.exports = Unique;
```

<!--more-->

## 编写单元测试
```javascript
var expect = require('chai').expect,
    unique = require('../uniqueArray');

describe('Test unique array function', function () {
    var arr = [1, 1, 2, 4, 3, 4, 4, 5, 1];
    var res = [1, 2, 4, 3, 5];

    it('# hash table test', function () {
        expect(unique.hash(arr)).to.be.deep.equal(res);
    });
    it('# indexof test', function () {
        expect(unique.hash(arr)).to.be.deep.equal(res);
    });
    it('# double loop test', function () {
        expect(unique.dbloop(arr)).to.be.deep.equal([2, 3, 4, 5, 1]);
    });
});
```

```shell
//out 
Test unique array function
    ✓ # double loop test
    ✓ # hash table test
    ✓ # indexof test


  3 passing (23ms)
```

通过hash table是比较不错的方法，有更优雅的姿势欢迎讨论。


---
title: max-subsequence-sum算法分析记录
date: 2016-02-11 10:39:21
tags:
- algorithm
- c
- math
categories:
- algorithm
---

### 数学基础
#### 定义
- 如果存在正常数c和n，使得当N>=n时，T(N)<=cf(N)，则记为T(N)=O(f(n))。
- 如果存在正常数c和n，使得当N<=n时，T(N)>=cg(N)，则记为T(N)=Ω(g(n))。

如果我们用传统的不等式来计算增长率，那么第一个定义就是说T(n)的增长率小于f(n)的增长率。第二个定义T(N)=Ω(g(n))意思就是T(N)的增长率大于g(n)的增长率。

当我们说T(N)=O(f(n))时，我们是在保证函数T(N)在不快于f(N)的速度增长；因此说T(N)是f(N)的一个上界(upper bound)，与此同时说T(N)是f(N)的一个下界(lower bound)。好比说N^3增长比N^2快，因此我们可以说是N^2=O(N^3)或者N^3=Ω(N^2)。

### 最大子序问题
#### 运行时间计算

![algorithm-max-subsquence-sum.png](/images/algorithm-max-subsquence-sum.png)

范围内能够终止运行提供了保障，程序可能提前结束，但是绝对不能拖后。

<!--more-->

#### 一般法则
0. for循环
一次for循环运行的时间至多是该for循环内语句的运行时间乘以迭代次数。
1. 嵌套for循环
从里向外分析这些for循环，例如：
```c
for (i = 0; i < N; i++)
    for (j = 0; j < N; j++)
        k++;
```
此段程序为O(N^2)。
2. 顺序语句
将各个语句的运行时间求和即可（这意味着，其中最大值就是所得的运行时间）。下面的例子先用去O(N)再花费了O(N^2)的运行时间，总的开销也是O(N^2)。
```c
for (i = 0; i < N; i++)
    k++;
for (i = 0; i < N; i++)
    for (j = 0; j < N; j++)
        k--;
```
3. if/else语句
```c
if (condition)
    S1;
else
    S2;
```
一个if/else语句的运行时间从不超过判断再加上S1和S2中运行时间长者的总运行时间。

#### 最大子序和的算法分析
输入主函数如下：
```c
int main()
{
	int a[10] = {-2, 11, -4, 13, -5, -2}, N = 6;
	printf("%d\n", maxSubsquenceSum_X(a, N));
	return 0;
}
```
0. 算法1

```c
#include<stdio.h>
int maxSubsquenceSum1(const int a[], int N)
{
	int thisSum, maxSum, i, j, k;
	maxSum = 0;

	for(i = 0; i < N; i++)
	{
		for(j = i; j < N; j++)
		{
			thisSum = 0;
			for(k = i; k <= j; k++)
			{
				thisSum += a[k];
				if(thisSum > maxSum)
				{
					maxSum = thisSum;
				}
			}
		}
	}

	return maxSum;
}
```
我们通过3层循环来穷举所有的可能，这里的时间复杂度/运行时间为O(N^3)。第三个for循环是可以避免的，我们可以使用算法2来去掉大量的不必要的计算。

1. 算法2

```c
int maxSubsquenceSum2(const int a[], int N)
{
	int thisSum, maxSum, i, j;

	maxSum = 0;
	for(i = 0; i < N; i++)
	{
		thisSum = 0;
		for(j = i; j < N; j++)
		{
			thisSum += a[j];
			if(thisSum > maxSum)
			{
				maxSum = thisSum;
			}
		}
	}

	return maxSum;
}
```
算法二的时间复杂度为O(N^2)，简化了算法一中第三层循环，避免了不必要的一些计算。

2. 算法3

```c
int maxSubsquenceSum4(const int a[], int N)
{
	int thisSum, maxSum, j;

	thisSum = maxSum = 0;
	for(j = 0; j < N; j++)
	{
		thisSum += a[j];
		if(thisSum > maxSum)
		{
			maxSum = thisSum;
		}
		else if(thisSum < 0)
		{
			thisSum = 0;
		}
	}

	return maxSum;
}
```
运行时间为O(N)，这种算法只需要对数据进行一次扫描。


---
>未完待续，参考《数据结构与算法分析-C语言描述》

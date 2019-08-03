---
title: LibGDX中图元Mesh的使用以及参考示例
date: 2015-08-05 23:48:36
tags:
    - game-dev
    - libgdx
---

> 这篇文章可能不完整

好吧最近撸码撸得想吐，什么都不想干了，抽点时间写写博客。以下是之前在libGDX学习中遇到的一些关于 Mesh 问题。关于 Mesh (图元)在libgdx中的使用，本来对于国内libgdx的开发资料比较缺乏，之前也看了网上的一些教程，感觉很对都没有写清楚（还是我理解能力太差？）或者是把它讲得比较复杂，难以理解。浏览了部分资料后自己写了一个demo。 本文采用libGDX-0.99版本，1.x版本API可能会有变化。

## API
> qute: A Mesh consists of vertices and optionally indices which specify which vertices define a triangle. Each vertex is composed of attributes such as position, normal, color or texture coordinate. Note that not all of this attributes must be given, except for position which is non-optional. Each attribute has an alias which is used when rendering a Mesh in OpenGL ES 2.0. The alias is used to bind a specific vertex attribute to a shader attribute. The shader source and the alias of the attribute must match exactly for this to work.

大致说明了一个mesh包含了多个vertice即顶点，每个顶点都有各自的属性，包括颜色、位置、纹理等等。平时常用的构造函数就是:

<!--more-->

```java
Mesh(boolean isStatic, int maxVertices, int maxIndices, VertexAttribute... attributes)  
Creates a new Mesh with the given attributes.  
Parameters:  
isStatic - whether this mesh is static or not. Allows for internal optimizations.  
maxVertices - the maximum number of vertices this mesh can hold  
maxIndices - the maximum number of indices this mesh can hold  
attributes - the VertexAttributes. Each vertex attribute defines one property of a vertex such as position, normal or texture coordinate  
```

构造函数是比较简单的，以上官方的参数讲解，其中最重要的就是attribute需要用到 VertexAttribute 这个类其常用的构造函数 VertexAttribute(usage, numComponents, alias); 第一个参数usage需要一个Usage类型他的父类是 VertexAttributes ，第二个参数是这个顶点属性组成数量范围是1-4，比如说颜色 color = new VertexAttribute(Usage.ColorPacked, 4, "color") 这样这个顶点属性就是指明为颜色，由四个参数组成，因为颜色是rgba还有一个是透明度所以是4个，后面参数alias顾名思义是别名的意思，就是这个顶点的一个名字String类型，据说和 Shader 有关联，还没有用到过，这里就不考虑，写上一个string就行了。

mesh中有一个重要的方法就是 setVertices() 就是设置顶点属性了了，之前的 VertexAttribute 只是指明了属性是位置属性还是颜色属性还是其他的属性。好了说了一堆API的东西还是看看demo比较好。

## Demo
这里展示了一个mesh包含了其中位置、颜色、和纹理的展示
```java
private Mesh mesh;
private VertexAttribute position;
private VertexAttribute color;
private VertexAttribute img;
private Texture texture;
@Override
public void create() {      
    /**
        * 这里设置了mesh的顶点属性postion为位置有三个参数因为mesh它
        * 其实是在3D世界中的所以有x，y，z三个坐标点取个名字为‘position’
        * color是指颜色这里4个组成是由red green blue alpha组成
        * img是一个纹理这里纹理就只有两个参数构成就是它的x，y坐标没有z
        */
    position = new VertexAttribute(Usage.Position, 3, "position");
    color = new VertexAttribute(Usage.ColorPacked, 4, "color");
    img = new VertexAttribute(Usage.TextureCoordinates, 2, "img");
    /**
        * 实例化mesh第一个参数允许进行内部优化，一般默认设置true，第二个参数是他的属性个数
        * 有color、position、img，然后是索引点3个因为后面我们会绘制一个三角形，最后传入
        * 所有的顶点属性
        */
    mesh = new Mesh(true, 3, 3, position, color, img);
    /**
        * 这里是设置每个属性顶点的具体参数，上面是设置顶点具备哪些属性并没有进行具体的设置
        * 前面三个是xyz坐标后面一个是颜色，最后两位是纹理对应顶点的坐标
        */
    mesh.setVertices(new float[]{
, 0.5f, 0, Color.toFloatBits(0, 0, 255, 255), 0.5f, 0,
        -0.5f, -0.5f, 0, Color.toFloatBits(0, 255, 0, 255), 0, 1,
.5f, -0.5f, 0, Color.toFloatBits(255, 0, 0, 255), 1, 1
    });
    mesh.setIndices(new short[]{0, 1, 2});//设置渲染索引从第一个开始
    texture = new Texture(Gdx.files.internal("data/me.png"));
}
```

下面附上完整代码
```java
package com.jiavan.libgdx.mesh;  
import com.badlogic.gdx.ApplicationListener;  
import com.badlogic.gdx.Gdx;  
import com.badlogic.gdx.graphics.Color;  
import com.badlogic.gdx.graphics.GL10;  
import com.badlogic.gdx.graphics.Mesh;  
import com.badlogic.gdx.graphics.Texture;  
import com.badlogic.gdx.graphics.VertexAttribute;  
import com.badlogic.gdx.graphics.VertexAttributes.Usage;  
public class MyGdxGame implements ApplicationListener {  
    private Mesh mesh;
    private VertexAttribute position;
    private VertexAttribute color;
    private VertexAttribute img;
    private Texture texture;
    @Override
    public void create() {      
        /**
         * 这里设置了mesh的顶点属性postion为位置有三个参数因为mesh它
         * 其实是在3D世界中的所以有x，y，z三个坐标点取个名字为‘position’
         * color是指颜色这里4个组成是由red green blue alpha组成
         * img是一个纹理这里纹理就只有两个参数构成就是它的x，y坐标没有z
         */
        position = new VertexAttribute(Usage.Position, 3, "position");
        color = new VertexAttribute(Usage.ColorPacked, 4, "color");
        img = new VertexAttribute(Usage.TextureCoordinates, 2, "img");
        /**
         * 实例化mesh第一个参数允许进行内部优化，一般默认设置true，第二个参数是他的属性个数
         * 有color、position、img，然后是索引点3个因为后面我们会绘制一个三角形，最后传入
         * 所有的顶点属性
         */
        mesh = new Mesh(true, 3, 3, position, color, img);
        /**
         * 这里是设置每个属性顶点的具体参数，上面是设置顶点具备哪些属性并没有进行具体的设置
         * 前面三个是xyz坐标后面一个是颜色，最后两位是纹理对应顶点的坐标
         */
        mesh.setVertices(new float[]{
, 0.5f, 0, Color.toFloatBits(0, 0, 255, 255), 0.5f, 0,
            -0.5f, -0.5f, 0, Color.toFloatBits(0, 255, 0, 255), 0, 1,
.5f, -0.5f, 0, Color.toFloatBits(255, 0, 0, 255), 1, 1
        });
        mesh.setIndices(new short[]{0, 1, 2});//设置渲染索引从第一个开始
        texture = new Texture(Gdx.files.internal("data/me.png"));
    }
    @Override
    public void dispose() {
    }
    @Override
    public void render() {      
        //Gdx.gl.glClearColor(1, 1, 1, 1);
        Gdx.gl.glClear(GL10.GL_COLOR_BUFFER_BIT);
        Gdx.graphics.getGL10().glEnable(GL10.GL_TEXTURE_2D);
        texture.bind(); 
        mesh.render(GL10.GL_TRIANGLES, 0, 3);
    }
    @Override
    public void resize(int width, int height) {
    }
    @Override
    public void pause() {
    }
    @Override
    public void resume() {
    }
}
```

## 参考文档
- libGDX官方文档 https://libgdx.badlogicgames.com/nightlies/docs/api/com/badlogic/gdx/graphics/Mesh.html
- 博客园 http://www.cnblogs.com/tianjian/archive/2011/08/26/2154957.html
- Potato http://blog.sina.com.cn/s/blog_940dd50a0101fl4s.html
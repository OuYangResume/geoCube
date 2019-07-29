## 目录说明文档

### `src`目录

####  `assets`存放项目中需要用到的资源文件.
####  `componets`存放vue开发中一些公共组件.
####  `router`vue路由的配置文件.
####  `service`配置的vue请求后台接口方法.
####  `utils`放置公共方法。
####  `views`vue页面组件的文件夹.
####  `vuex`为vue专门开发的状态管理器.
####  `main.js`vue-cli工程的入口文件.

### `readme`说明文档目录
#### `catalog.md`目录说明.
#### `mapbox_style.md`mapbox样式表达式说明文档.

### `public` 该目录下的文件不会被压缩
#### `index.html`设置项目的一些meta头信息.
#### `lib`依赖文件夹.
##### `GeoGlobeJS.min.js`
``` 
这里不用npm下载官方mapbox-gl的依赖是因为版本原因，避免冲突。
而官方只支持web墨卡托.
```

### `dist`项目打包生成结果目录

``` bash 
.
├── README.md                   #项目介绍文档
├── dist                        #项目打包生成目录
├── package.json                #package.json 依赖
├── public                      #目录下的文件不会被压缩
│   ├── favicon.ico             #favicon图标
│   ├── index.html              #html模板
│   └── lib                     #依赖文件夹.
├── readme                      #说明文档文件夹
│   ├── catalog.md              #目录说明文档
│   ├── mapbox_style.md         #mapbox样式表达式说明文档.
│   └── tree.md                 #目录树生成文档  tree -I node_modules -L 2 > readme/tree.md
└── src
    ├── App.vue     #入口页面
    ├── assets      #存放项目中需要用到的资源文件.
    ├── components  #存放vue开发中一些公共组件.
    ├── main.js     #入口文件 加载组件 初始化等 
    ├── router      #vue路由的配置文件.
    ├── service     #配置的vue请求后台接口方法.
    ├── utils       #放置公共方法。
    ├── views       #vue页面组件的文件夹.
    └── vuex        #为vue专门开发的状态管理器.

```


### 目录结构

```bash
├── /mock/                      # 数据mock
├── /dist/                      # 项目生成环境输出目录
├── /src/                       # 项目源码目录
│ ├── /assets/                  # 公共文件，编译时copy至dist目录，存放项目图片
│ ├── /components/              # 通用组件及方法
│ ├── /layouts/                 # 布局式文件:header，侧边栏等
│ ├── /models/                  # 全局数据模型(默认加载)
│ ├── /pages/                   # 项目路由,各页面入口
│ │ └── /project/      
│ │   ├── /components/          #project私有组件
│ │   │ └── /project_aims/      #项目目标组件
│ │   │ └── /project_contents/  #规划项目组件
│ │   │ └── /project_milestone/ #规划里程碑组件
│ │   ├── /create_project/      #创建项目相关组件
│ │   ├── /edit_project/        #编辑项目相关组件
│ │   ├── /manage_members/      #项目成员相关组件
│ │   ├── /project_approval/    #立项审批相关组件
│ │   ├── /project_detail/      #项目详情页相关组件
│ │   ├── /project_finish/      #结项审批相关组件
│ │   ├── /project_list/        #项目列表组件
│ │   ├── /shared/              #项目下公用配置文件
│ │ └── /receipt/               #单据模块统一入口，包含五类单据和版本
│ │ └── /message/               #消息中心模块
│ │ └── /my_workbench/         #我的工作台模块
│ │ └── /product_setting/       #产品配置模块
│ │ └── /report/                #数据报表模块
│ │ └── /system_manage/         #系统管理模块
│ │ └── /index.js               #项目入口   
│ │ └── /document.ejs           #模版
│ ├── /services/                # 数据接口，根据业务需求划分
│ ├── /styles/                  # 存放各类全局样式文件
│ ├── /utils/                   # 工具函数
│ │ └── request.js              # 异步请求函数
│ │ └── helper.js               # 工具类函数
│ │ └── ga.js                   # Google Analytics函数,用于埋点
│ │ └── function.css            # 工具类css
│ │ └── util.less               # 帮助函数类css
│ │ └── sentry.js               # 异常监控
│ ├── defaultSetting            # 全局通用设置
│ └── global.less               # 全局样式文件入口   
├── package.json                # 项目依赖信息
├── .eslintrc                   # Eslint配置
├── .senryclirc                 # sentry监控配置
├── .umirc.js                   # 项目配置文件，webpack配置也放置于此
├── .gitignore                  # 不追踪的git文件
```

### 文件及文件名命名规定
1. 文件名小写以_分隔开，例如user_info
2. 文件名开头字母大写，例如TestPage.js

### model数据模型约定
1. `src/models/**/*.js` 为 global model
2. `src/pages/**/models/**/*.js` 为 page model
3. global model 全量载入，page model 在 production 时按需载入，在 development 时全量载入
4. page model 为 page js 所在路径下 `models/**/*.js` 的文件
5. page model 要向上查找，比如 page js 为 pages/a/b.js，他的 page model 为 `pages/a/b/models/**/*.js + pages/a/models/**/*.js`，依次类推
6. 约定 `model.js` 为单文件 model，解决只有一个 model 时不需要建 models 目录的问题，有 `model.js` 则不去找 `models/**/*.js`

## 组件中引入依赖模块时遵循依赖包-绝对路径组件-依赖路径组件的层次
如下：
- import React, { Component } from 'react';
- import MyIcon from '@components/MyIcon';
- import { equalsObj } from '@utils/helper';
- import CurrentUser from './components/current_user';
- import ProductSetting from './components/product_setting';

## 拉取分支及约定
- 日常迭代开发feature/xxx
- bug修复bugfix/xxx
- 上线前需要先合并到develop，然后由develop合并到master

## 安装依赖
npm install 或者cnpm install

## 启动项目
npm run start

## 部署到开发或者测试环境
npm run build

## 发布到线上之前需要上传sentry的sourcemap便于还原问题
npm run online

## 单元测试
npm run test

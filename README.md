# 罕见病社区 Rare Disease Community

一个为罕见病患者、家属和研究者搭建的交流互助平台。

## 功能

- **病种分类**: 按疾病类型浏览和加入社区
- **社区讨论**: 分享经验、互相帮助
- **信息汇总**: 政策资讯、药物信息、临床试验

## 技术栈

- [Next.js](https://nextjs.org/) 14 (App Router)
- React 18
- CSS Modules

## 开始使用

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

浏览器访问 [http://localhost:3000](http://localhost:3000)

## 项目结构

```
src/
├── app/
│   ├── layout.js          # 根布局
│   ├── page.js            # 首页
│   ├── globals.css        # 全局样式
│   ├── diseases/          # 病种分类页
│   ├── posts/             # 社区讨论页
│   └── about/             # 关于页面
└── components/
    └── Navbar.js          # 导航栏组件
```

# Rivet — 产品官网

一个虚构开源前端构建工具 **Rivet** 的官网成品。纯静态站点，无构建步骤、无依赖、无后端。

> 本站为演示用虚构项目，产品名、数据、团队名均为示例，不对应任何真实组织或产品。

## 打开方式

直接双击 `index.html` 即可在浏览器中打开；也可以在本目录起一个静态服务：

    # 任选其一
    npx serve .
    python -m http.server 8080

然后访问 `http://localhost:8080/index.html`。

## 目录结构

    portfolio/
    ├── index.html          首页：Hero / 特性 / 性能基准 / 快速开始 / 插件 / 路线图 / FAQ / CTA
    ├── docs.html           文档页：安装 / 快速开始 / 配置 / CLI / 插件 / 插件 API / FAQ
    ├── README.md
    └── assets/
        ├── css/style.css   设计系统（设计令牌、双主题、组件、动效、响应式、打印样式）
        ├── js/main.js      交互脚本（原生 JS，无第三方库）
        └── img/
            ├── favicon.svg
            └── feature/    6 张特性插画（手写 SVG）

## 页面与功能

| 页面 | 说明 |
| --- | --- |
| `index.html` | 产品主页，含 6 大特性、性能对比表、三步快速开始、6 个官方插件、路线图、FAQ 手风琴、订阅表单 |
| `docs.html` | 文档中心，左侧目录随滚动高亮，含配置项速查表与 CLI 命令参考 |

交互全部在 `assets/js/main.js` 中实现，无第三方依赖：

- 深色 / 浅色主题切换，记忆在 `localStorage`，也支持 `?theme=dark` / `?theme=light` 强制指定
- 顶部导航滚动变紧凑、移动端抽屉菜单
- 滚动入场动画、数字滚动计数、页内锚点平滑跳转
- FAQ 手风琴、代码块一键复制、订阅表单校验
- 主导航与文档侧栏的滚动位置侦测高亮
- 特性卡片 3D 倾斜、按钮磁吸、Hero 光标跟随光晕
- 窄屏下表格横向滚动提示，滚到底自动收起

## 改成你自己的项目

1. **换名字**：全局搜索 `Rivet`，替换 `index.html`、`docs.html` 与 `assets/css/style.css` 中的品牌名。
2. **换配色**：改 `style.css` 顶部的 `--accent-*` / `--brand-*` 令牌，渐变、光晕、按钮会整体跟着变。
3. **换插画**：`assets/img/feature/*.svg` 可直接替换成自己的图，保持文件名即可。
4. **改文案**：所有文案都写在 HTML 里，语义化标签 + `data-*` 属性驱动交互，删掉对应区块也不会报错。

## 技术说明

- 单页 HTML + 原生 CSS + 原生 JS，无框架、无构建、无 CDN 请求，可完全离线打开
- 图标使用内联 SVG sprite（`#i-*`），无需字体图标
- 插画为手写 SVG，深底几何发光风，跟随主题切换
- 支持 `prefers-reduced-motion`、`prefers-color-scheme`，并提供打印样式
- 布局对 320px 起的窄屏做了适配，桌面 / 平板 / 手机三档断点

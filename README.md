# xiyu-admin

## 项目简介

`xiyu-admin` 是洗浴/酒店预约系统的管理后台，面向运营和门店管理人员，提供房型、餐饮、会员、订单、优惠券、积分商城、储值套餐等业务数据维护能力。

## 技术栈

- Vue 3
- Vite
- Element Plus
- Pinia
- Vue Router
- Axios
- ECharts
- RuoYi-Vue3 前端体系

## 关联仓库

| 子项目 | 仓库 | 说明 |
|---|---|---|
| 后端服务 | [xiyu-backend](https://github.com/jiangyi3265/xiyu-backend) | 提供管理后台与用户端 API |
| 管理后台 | [xiyu-admin](https://github.com/jiangyi3265/xiyu-admin) | 运营人员使用的后台管理系统 |
| 用户端 | [xiyu-app](https://github.com/jiangyi3265/xiyu-app) | 面向用户的 uni-app/微信小程序端 |

## 快速启动

```bash
npm install
npm run dev
```

生产构建：

```bash
npm run build:prod
```

默认通过 `/dev-api` 或 `/prod-api` 代理访问 `xiyu-backend`。

## 简历描述示例

负责洗浴/酒店预约系统管理后台开发，基于 Vue3、Vite、Element Plus 构建可配置化运营管理界面，覆盖客房、会员、订单、营销与积分等业务模块。

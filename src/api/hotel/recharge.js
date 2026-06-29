import request from '@/utils/request'

// 查询充值套餐列表
export function listRecharge(query) {
  return request({
    url: '/hotel/recharge/list',
    method: 'get',
    params: query
  })
}

// 查询充值套餐详细
export function getRecharge(rechargeId) {
  return request({
    url: '/hotel/recharge/' + rechargeId,
    method: 'get'
  })
}

// 新增充值套餐
export function addRecharge(data) {
  return request({
    url: '/hotel/recharge',
    method: 'post',
    data: data
  })
}

// 修改充值套餐
export function updateRecharge(data) {
  return request({
    url: '/hotel/recharge',
    method: 'put',
    data: data
  })
}

// 删除充值套餐
export function delRecharge(rechargeId) {
  return request({
    url: '/hotel/recharge/' + rechargeId,
    method: 'delete'
  })
}

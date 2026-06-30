import request from '@/utils/request'

// 查询订单列表
export function listOrder(query) {
  return request({
    url: '/hotel/order/list',
    method: 'get',
    params: query
  })
}

// 查询订单详细
export function getOrder(orderId) {
  return request({
    url: '/hotel/order/' + orderId,
    method: 'get'
  })
}

// 新增订单
export function addOrder(data) {
  return request({
    url: '/hotel/order',
    method: 'post',
    data: data
  })
}

// 修改订单
export function updateOrder(data) {
  return request({
    url: '/hotel/order',
    method: 'put',
    data: data
  })
}

// 同意退款
export function approveRefund(orderId) {
  return request({
    url: '/hotel/order/' + orderId + '/refund/approve',
    method: 'put'
  })
}

// 驳回退款
export function rejectRefund(orderId, reason) {
  return request({
    url: '/hotel/order/' + orderId + '/refund/reject',
    method: 'put',
    data: { reason }
  })
}

// 删除订单
export function delOrder(orderId) {
  return request({
    url: '/hotel/order/' + orderId,
    method: 'delete'
  })
}

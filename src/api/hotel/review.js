import request from '@/utils/request'

// 查询订单评价列表
export function listReview(query) {
  return request({
    url: '/hotel/review/list',
    method: 'get',
    params: query
  })
}

// 查询订单评价详情
export function getReview(reviewId) {
  return request({
    url: '/hotel/review/' + reviewId,
    method: 'get'
  })
}

// 删除订单评价
export function delReview(reviewId) {
  return request({
    url: '/hotel/review/' + reviewId,
    method: 'delete'
  })
}

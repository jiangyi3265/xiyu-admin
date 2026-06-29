import request from '@/utils/request'

// 查询积分记录列表
export function listPointlog(query) {
  return request({
    url: '/hotel/pointlog/list',
    method: 'get',
    params: query
  })
}

// 查询积分记录详细
export function getPointlog(logId) {
  return request({
    url: '/hotel/pointlog/' + logId,
    method: 'get'
  })
}

// 新增积分记录
export function addPointlog(data) {
  return request({
    url: '/hotel/pointlog',
    method: 'post',
    data: data
  })
}

// 修改积分记录
export function updatePointlog(data) {
  return request({
    url: '/hotel/pointlog',
    method: 'put',
    data: data
  })
}

// 删除积分记录
export function delPointlog(logId) {
  return request({
    url: '/hotel/pointlog/' + logId,
    method: 'delete'
  })
}

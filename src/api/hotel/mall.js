import request from '@/utils/request'

// 查询积分商城列表
export function listMall(query) {
  return request({
    url: '/hotel/mall/list',
    method: 'get',
    params: query
  })
}

// 查询积分商城详细
export function getMall(mallId) {
  return request({
    url: '/hotel/mall/' + mallId,
    method: 'get'
  })
}

// 新增积分商城
export function addMall(data) {
  return request({
    url: '/hotel/mall',
    method: 'post',
    data: data
  })
}

// 修改积分商城
export function updateMall(data) {
  return request({
    url: '/hotel/mall',
    method: 'put',
    data: data
  })
}

// 删除积分商城
export function delMall(mallId) {
  return request({
    url: '/hotel/mall/' + mallId,
    method: 'delete'
  })
}

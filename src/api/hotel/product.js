import request from '@/utils/request'

// 查询套餐列表
export function listProduct(query) {
  return request({
    url: '/hotel/product/list',
    method: 'get',
    params: query
  })
}

// 查询套餐详细
export function getProduct(productId) {
  return request({
    url: '/hotel/product/' + productId,
    method: 'get'
  })
}

// 新增套餐
export function addProduct(data) {
  return request({
    url: '/hotel/product',
    method: 'post',
    data: data
  })
}

// 修改套餐
export function updateProduct(data) {
  return request({
    url: '/hotel/product',
    method: 'put',
    data: data
  })
}

// 删除套餐
export function delProduct(productId) {
  return request({
    url: '/hotel/product/' + productId,
    method: 'delete'
  })
}

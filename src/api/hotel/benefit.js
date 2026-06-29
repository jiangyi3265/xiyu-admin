import request from '@/utils/request'

// 查询会员权益列表
export function listBenefit(query) {
  return request({
    url: '/hotel/benefit/list',
    method: 'get',
    params: query
  })
}

// 查询会员权益详细
export function getBenefit(benefitId) {
  return request({
    url: '/hotel/benefit/' + benefitId,
    method: 'get'
  })
}

// 新增会员权益
export function addBenefit(data) {
  return request({
    url: '/hotel/benefit',
    method: 'post',
    data: data
  })
}

// 修改会员权益
export function updateBenefit(data) {
  return request({
    url: '/hotel/benefit',
    method: 'put',
    data: data
  })
}

// 删除会员权益
export function delBenefit(benefitId) {
  return request({
    url: '/hotel/benefit/' + benefitId,
    method: 'delete'
  })
}

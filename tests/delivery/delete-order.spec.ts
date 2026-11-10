import { expect, test } from '@playwright/test'
import { StatusCodes } from 'http-status-codes'
import { OrderListSchema } from '../../contracts/order-contract'
import { authHeader, createOrder, deleteOrder, fetchJwt } from '../../helpers/api-helper'
import { baseUrl, ordersEndpoint } from './delivery-config'

test.describe('DELETE /orders/{id}', () => {
  let jwt: string
  let orderId: number

  test.beforeAll(async ({ request }) => {
    jwt = await fetchJwt(request)
  })

  test.beforeEach(async ({ request }) => {
    orderId = (await createOrder(request, jwt)).id
  })

  // ---------- positive ----------

  test('delete own order should receive code 200 and true', async ({ request }) => {
    const response = await deleteOrder(request, jwt, orderId)

    expect(response.status()).toBe(StatusCodes.OK)
    expect(await response.json()).toBe(true)
  })

  test('deleted order should not be found by id', async ({ request }) => {
    await deleteOrder(request, jwt, orderId)

    const response = await request.get(`${baseUrl}${ordersEndpoint}/${orderId}`, {
      headers: authHeader(jwt),
    })

    // API returns 200 with empty body for a missing order (not 404)
    expect.soft(response.status()).toBe(StatusCodes.OK)
    expect.soft(await response.text()).toBe('')
  })

  test('deleted order should not be in the list of orders', async ({ request }) => {
    await deleteOrder(request, jwt, orderId)

    const response = await request.get(baseUrl + ordersEndpoint, { headers: authHeader(jwt) })
    const orders = OrderListSchema.parse(await response.json())

    expect(orders.map((order) => order.id)).not.toContain(orderId)
  })

  // ---------- negative ----------

  test('delete order without token should receive code 401', async ({ request }) => {
    const response = await request.delete(`${baseUrl}${ordersEndpoint}/${orderId}`)

    expect(response.status()).toBe(StatusCodes.UNAUTHORIZED)
  })

  test('delete order with invalid id should receive code 400', async ({ request }) => {
    const response = await deleteOrder(request, jwt, 'abc')

    expect(response.status()).toBe(StatusCodes.BAD_REQUEST)
  })

  // BUG: deleting an order that does not exist (or was already deleted)
  // returns 200 and true, so the client cannot tell that nothing was deleted
  test('delete already deleted order should not report success', async ({ request }) => {
    test.fail()
    await deleteOrder(request, jwt, orderId)

    const response = await deleteOrder(request, jwt, orderId)

    expect(await response.json()).not.toBe(true)
  })
})

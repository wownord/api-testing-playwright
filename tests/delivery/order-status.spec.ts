import { expect, test } from '@playwright/test'
import { StatusCodes } from 'http-status-codes'
import { OrderStatus, StatusDto } from '../../dto/status-dto'
import { changeOrderStatus, createOrder, fetchJwt, getOrderById } from '../../helpers/api-helper'
import { baseUrl, ordersEndpoint } from './delivery-config'

// PUT /orders/{id}/status is allowed only for ROLE_COURIER (Swagger).
// We log in as a student, so the API must forbid the status change.
test.describe('PUT /orders/{id}/status', () => {
  let jwt: string
  let orderId: number

  test.beforeAll(async ({ request }) => {
    jwt = await fetchJwt(request)
  })

  test.beforeEach(async ({ request }) => {
    orderId = (await createOrder(request, jwt)).id
  })

  for (const status of [OrderStatus.INPROGRESS, OrderStatus.DELIVERED]) {
    test(`student changes status to ${status} should receive code 403`, async ({ request }) => {
      const response = await changeOrderStatus(request, jwt, orderId, status)

      expect(response.status()).toBe(StatusCodes.FORBIDDEN)
    })
  }

  test('order status should stay OPEN after forbidden status change', async ({ request }) => {
    await changeOrderStatus(request, jwt, orderId, OrderStatus.DELIVERED)

    const order = await getOrderById(request, jwt, orderId)

    expect(order.status).toBe(OrderStatus.OPEN)
  })

  test('change status without token should receive code 401', async ({ request }) => {
    const response = await request.put(`${baseUrl}${ordersEndpoint}/${orderId}/status`, {
      data: new StatusDto(OrderStatus.INPROGRESS),
    })

    expect(response.status()).toBe(StatusCodes.UNAUTHORIZED)
  })
})

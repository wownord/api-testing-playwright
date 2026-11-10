import { expect, test } from '@playwright/test'
import { StatusCodes } from 'http-status-codes'
import { LoginDto } from '../../dto/login-dto'
import { OrderDto } from '../../dto/order-dto'
import { createOrder, fetchJwt } from '../../helpers/api-helper'
import { baseUrl, loginEndpoint, ordersEndpoint } from './delivery-config'

test.describe('Authorization flow', () => {
  // ---------- login: negative ----------

  test('login with incorrect password should receive code 401', async ({ request }) => {
    const response = await request.post(baseUrl + loginEndpoint, {
      data: LoginDto.createLoginWithIncorrectPassword(),
    })

    expect(response.status()).toBe(StatusCodes.UNAUTHORIZED)
  })

  test('login with incorrect username should receive code 401', async ({ request }) => {
    const response = await request.post(baseUrl + loginEndpoint, {
      data: LoginDto.createLoginWithIncorrectUsername(),
    })

    expect(response.status()).toBe(StatusCodes.UNAUTHORIZED)
  })

  // ---------- login: positive (credentials from env variables) ----------

  test('login with correct credentials should receive code 200 and JWT', async ({ request }) => {
    const response = await request.post(baseUrl + loginEndpoint, {
      data: LoginDto.createLoginWithCorrectData(),
    })
    const jwt = await response.text()

    expect(response.status()).toBe(StatusCodes.OK)
    // JWT has 3 parts separated by dots: header.payload.signature
    expect(jwt).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/)
  })

  // ---------- orders with token ----------

  test('create order with authorization token should receive code 200', async ({ request }) => {
    const jwt = await fetchJwt(request, LoginDto.createLoginWithCorrectData())

    const response = await request.post(baseUrl + ordersEndpoint, {
      data: OrderDto.createOrderWithoutId(),
      headers: { Authorization: `Bearer ${jwt}` },
    })

    expect(response.status()).toBe(StatusCodes.OK)
  })

  test('created order should have an id', async ({ request }) => {
    const jwt = await fetchJwt(request, LoginDto.createLoginWithCorrectData())

    const orderId = await createOrder(request, jwt)

    expect(orderId).toBeDefined()
  })

  test('get orders with authorization token should receive code 200', async ({ request }) => {
    const jwt = await fetchJwt(request, LoginDto.createLoginWithCorrectData())

    const response = await request.get(baseUrl + ordersEndpoint, {
      headers: { Authorization: `Bearer ${jwt}` },
    })

    expect(response.status()).toBe(StatusCodes.OK)
  })

  // ---------- orders without token ----------

  test('create order without authorization token should receive code 401', async ({ request }) => {
    const response = await request.post(baseUrl + ordersEndpoint, {
      data: OrderDto.createOrderWithoutId(),
    })

    expect(response.status()).toBe(StatusCodes.UNAUTHORIZED)
  })

  test('get orders with invalid token should receive code 401', async ({ request }) => {
    const response = await request.get(baseUrl + ordersEndpoint, {
      headers: { Authorization: 'Bearer invalid.token.value' },
    })

    expect(response.status()).toBe(StatusCodes.UNAUTHORIZED)
  })
})

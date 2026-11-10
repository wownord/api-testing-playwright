import { expect, test } from '@playwright/test'
import { StatusCodes } from 'http-status-codes'
import { OrderListSchema, OrderSchema, TokenSchema } from '../../contracts/order-contract'
import { LoginDto } from '../../dto/login-dto'
import { OrderDto } from '../../dto/order-dto'
import { authHeader, createOrder, fetchJwt, getOrderById } from '../../helpers/api-helper'
import { baseUrl, loginEndpoint, ordersEndpoint } from './delivery-config'

test.describe('Orders flow with helpers and schema validation', () => {
  let jwt: string

  // login once for all tests in this file
  test.beforeAll(async ({ request }) => {
    jwt = await fetchJwt(request)
  })

  // ---------- login flow: schema validation ----------

  test('login response should match token contract', async ({ request }) => {
    const response = await request.post(baseUrl + loginEndpoint, {
      data: LoginDto.createLoginWithCorrectData(),
    })

    expect(response.status()).toBe(StatusCodes.OK)
    const token = TokenSchema.parse(await response.text())
    expect(token.length).toBeGreaterThan(0)
  })

  // ---------- order creation flow: schema validation ----------

  test('create order response should match order contract', async ({ request }) => {
    const requestBody = OrderDto.createOrderWithoutId()

    const response = await request.post(baseUrl + ordersEndpoint, {
      data: requestBody,
      headers: authHeader(jwt),
    })

    expect(response.status()).toBe(StatusCodes.OK)
    const order = OrderSchema.parse(await response.json())
    expect.soft(order.id).toBeGreaterThan(0)
    expect.soft(order.status).toBe('OPEN')
    expect.soft(order.customerName).toBe(requestBody.customerName)
    expect.soft(order.customerPhone).toBe(requestBody.customerPhone)
    expect.soft(order.comment).toBe(requestBody.comment)
  })

  test('get all orders response should match order list contract', async ({ request }) => {
    await createOrder(request, jwt)

    const response = await request.get(baseUrl + ordersEndpoint, {
      headers: authHeader(jwt),
    })

    expect(response.status()).toBe(StatusCodes.OK)
    const orders = OrderListSchema.parse(await response.json())
    expect(orders.length).toBeGreaterThan(0)
  })

  // ---------- helpers ----------

  test('create order with helper', async ({ request }) => {
    const order = await createOrder(request, jwt)

    expect.soft(order.id).toBeGreaterThan(0)
    expect.soft(order.status).toBe('OPEN')
  })

  test('create order and find it by id with helpers', async ({ request }) => {
    const createdOrder = await createOrder(request, jwt)

    const foundOrder = await getOrderById(request, jwt, createdOrder.id)

    expect.soft(foundOrder.id).toBe(createdOrder.id)
    expect.soft(foundOrder.status).toBe('OPEN')
    expect.soft(foundOrder.customerName).toBe(createdOrder.customerName)
  })
})

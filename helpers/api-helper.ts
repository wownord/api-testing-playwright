import { APIRequestContext, expect } from '@playwright/test'
import { StatusCodes } from 'http-status-codes'
import { Order, OrderSchema, TokenSchema } from '../contracts/order-contract'
import { LoginDto } from '../dto/login-dto'
import { OrderDto } from '../dto/order-dto'
import { baseUrl, loginEndpoint, ordersEndpoint } from '../tests/delivery/delivery-config'

// login with POST /login/student and return JWT (validated by TokenSchema)
export async function fetchJwt(
  request: APIRequestContext,
  login: LoginDto = LoginDto.createLoginWithCorrectData(),
): Promise<string> {
  const authResponse = await request.post(baseUrl + loginEndpoint, {
    data: login,
  })
  if (authResponse.status() !== StatusCodes.OK) {
    throw new Error(`Authorization failed. Status: ${authResponse.status()}`)
  }
  return TokenSchema.parse(await authResponse.text())
}

// build Authorization header with Bearer token
export function authHeader(jwt: string): { Authorization: string } {
  return { Authorization: `Bearer ${jwt}` }
}

// create order with POST /orders and return created order (validated by OrderSchema)
export async function createOrder(
  request: APIRequestContext,
  jwt: string,
  order: OrderDto = OrderDto.createOrderWithoutId(),
): Promise<Order> {
  const response = await request.post(baseUrl + ordersEndpoint, {
    data: order,
    headers: authHeader(jwt),
  })
  expect(response.status()).toBe(StatusCodes.OK)
  return OrderSchema.parse(await response.json())
}

// find order with GET /orders/{id} (validated by OrderSchema)
export async function getOrderById(
  request: APIRequestContext,
  jwt: string,
  id: number,
): Promise<Order> {
  const response = await request.get(`${baseUrl}${ordersEndpoint}/${id}`, {
    headers: authHeader(jwt),
  })
  expect(response.status()).toBe(StatusCodes.OK)
  return OrderSchema.parse(await response.json())
}

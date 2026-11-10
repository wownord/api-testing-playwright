import { APIRequestContext, expect } from '@playwright/test'
import { StatusCodes } from 'http-status-codes'
import { LoginDto } from '../dto/login-dto'
import { OrderDto } from '../dto/order-dto'
import { baseUrl, loginEndpoint, ordersEndpoint } from '../tests/delivery/delivery-config'

// send POST /login/student and return JWT from the response body
export async function fetchJwt(request: APIRequestContext, login: LoginDto): Promise<string> {
  const authResponse = await request.post(baseUrl + loginEndpoint, {
    data: login,
  })
  if (authResponse.status() !== StatusCodes.OK) {
    throw new Error(`Authorization failed. Status: ${authResponse.status()}`)
  }
  return await authResponse.text()
}

// create order with Bearer token and return its id
export async function createOrder(request: APIRequestContext, jwt: string): Promise<number> {
  const response = await request.post(baseUrl + ordersEndpoint, {
    data: OrderDto.createOrderWithoutId(),
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  })
  expect(response.status()).toBe(StatusCodes.OK)
  const responseBody = await response.json()
  return responseBody.id
}

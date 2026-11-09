import { expect, test } from '@playwright/test'
import { StatusCodes } from 'http-status-codes'
import { productsUrl } from './shop-config'

test.describe('GET /api/products/{id}', () => {
  // ---------- positive ----------

  test('get product with existing id should receive code 200', async ({ request }) => {
    const response = await request.get(`${productsUrl}/1`)

    expect(response.status()).toBe(StatusCodes.OK)
  })

  test('get product with existing id should return product with the same id', async ({
    request,
  }) => {
    const response = await request.get(`${productsUrl}/1`)
    const responseBody = await response.json()

    expect(responseBody.id).toBe(1)
  })

  test('get product should return body with correct field types', async ({ request }) => {
    const response = await request.get(`${productsUrl}/1`)
    const responseBody = await response.json()

    expect(typeof responseBody.name).toBe('string')
    expect(typeof responseBody.category).toBe('string')
    expect(typeof responseBody.price).toBe('number')
    expect(typeof responseBody.quantity).toBe('number')
  })

  test('get product should return JSON content-type header', async ({ request }) => {
    const response = await request.get(`${productsUrl}/1`)

    expect(response.headers()['content-type']).toContain('application/json')
  })

  // ---------- negative ----------

  test('get product with non-existing id should receive code 404', async ({ request }) => {
    const response = await request.get(`${productsUrl}/999999999`)

    expect(response.status()).toBe(StatusCodes.NOT_FOUND)
  })

  // invalid ids: server should answer with a client error (400 or 404), never 200 or 5xx
  const invalidIds = ['abc', '-1', '0', '1.5', '%20']

  for (const id of invalidIds) {
    test(`get product with invalid id "${id}" should receive client error`, async ({ request }) => {
      const response = await request.get(`${productsUrl}/${id}`)

      expect([StatusCodes.BAD_REQUEST, StatusCodes.NOT_FOUND]).toContain(response.status())
    })
  }
})

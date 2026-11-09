import { expect, test } from '@playwright/test'
import { StatusCodes } from 'http-status-codes'
import { ProductDto } from '../../dto/product-dto'
import { productsUrl } from './shop-config'

test.describe('POST /api/products', () => {
  // ---------- positive ----------

  test('post product with correct data should receive code 201', async ({ request }) => {
    const response = await request.post(productsUrl, {
      data: ProductDto.createValid(),
    })

    expect(response.status()).toBe(StatusCodes.CREATED)
  })

  test('post product should return created product with the same data', async ({ request }) => {
    const requestBody = ProductDto.createValid()

    const response = await request.post(productsUrl, { data: requestBody })
    const responseBody = await response.json()

    expect(response.status()).toBe(StatusCodes.CREATED)
    expect(responseBody.id).toBeDefined()
    expect(responseBody.name).toBe(requestBody.name)
    expect(responseBody.category).toBe(requestBody.category)
    expect(responseBody.price).toBe(requestBody.price)
    expect(responseBody.quantity).toBe(requestBody.quantity)
  })

  test('post product should return body with correct field types', async ({ request }) => {
    const response = await request.post(productsUrl, {
      data: ProductDto.createValid(),
    })
    const responseBody = await response.json()

    expect(typeof responseBody.name).toBe('string')
    expect(typeof responseBody.category).toBe('string')
    expect(typeof responseBody.price).toBe('number')
    expect(typeof responseBody.quantity).toBe('number')
  })

  // quantity is optional by API docs: if not sent, it defaults to 0
  test('post product without quantity should receive code 201 and quantity 0', async ({
    request,
  }) => {
    const response = await request.post(productsUrl, {
      data: { name: 'Orange', category: 'Fruit', price: 2.39 },
    })
    const responseBody = await response.json()

    expect(response.status()).toBe(StatusCodes.CREATED)
    expect(responseBody.quantity).toBe(0)
  })

  // ---------- negative ----------

  // KNOWN BUG: server accepts negative price and returns 201 instead of 400.
  // test.fail() marks this test as expected to fail until the bug is fixed.
  test('post product with negative price should receive code 400', async ({ request }) => {
    test.fail()
    const response = await request.post(productsUrl, {
      data: { name: 'Orange', category: 'Fruit', price: -1, quantity: 10 },
    })

    expect(response.status()).toBe(StatusCodes.BAD_REQUEST)
  })

  test('post product with empty body should receive code 400', async ({ request }) => {
    const response = await request.post(productsUrl, { data: {} })

    expect(response.status()).toBe(StatusCodes.BAD_REQUEST)
  })

  test('post product with invalid JSON should receive code 400', async ({ request }) => {
    const response = await request.post(productsUrl, {
      headers: { 'Content-Type': 'application/json' },
      data: '{ "name": "Orange", ',
    })

    expect(response.status()).toBe(StatusCodes.BAD_REQUEST)
  })

  // invalid request bodies: each one should be rejected with 400
  const invalidBodies: { scenario: string; body: Record<string, unknown> }[] = [
    { scenario: 'missing name', body: { category: 'Fruit', price: 2.39, quantity: 10 } },
    { scenario: 'missing category', body: { name: 'Orange', price: 2.39, quantity: 10 } },
    { scenario: 'missing price', body: { name: 'Orange', category: 'Fruit', quantity: 10 } },
    {
      scenario: 'empty name',
      body: { name: '', category: 'Fruit', price: 2.39, quantity: 10 },
    },
    {
      scenario: 'name is a number',
      body: { name: 123, category: 'Fruit', price: 2.39, quantity: 10 },
    },
    {
      scenario: 'price is a string',
      body: { name: 'Orange', category: 'Fruit', price: 'abc', quantity: 10 },
    },
    {
      scenario: 'quantity is a string',
      body: { name: 'Orange', category: 'Fruit', price: 2.39, quantity: 'ten' },
    },
    {
      scenario: 'negative quantity',
      body: { name: 'Orange', category: 'Fruit', price: 2.39, quantity: -5 },
    },
  ]

  for (const { scenario, body } of invalidBodies) {
    test(`post product with ${scenario} should receive code 400`, async ({ request }) => {
      const response = await request.post(productsUrl, { data: body })

      console.log(`[${scenario}] status:`, response.status())
      expect(response.status()).toBe(StatusCodes.BAD_REQUEST)
    })
  }
})

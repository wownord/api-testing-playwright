import { expect, test } from '@playwright/test'
import { StatusCodes } from 'http-status-codes'
import { CreateAccountDto } from '../../dto/account-dto'
import { accountsUrl, HEADERS } from './accounts-config'

test.describe('POST /api/accounts', () => {
  // ---------- positive ----------

  test('create account with owner only should receive code 201', async ({ request }) => {
    const response = await request.post(accountsUrl, {
      headers: HEADERS,
      data: CreateAccountDto.withOwner(),
    })

    expect(response.status()).toBe(StatusCodes.CREATED)
  })

  for (const currency of ['EUR', 'USD', 'GBP']) {
    test(`create account with currency ${currency} should receive code 201`, async ({
      request,
    }) => {
      const response = await request.post(accountsUrl, {
        headers: HEADERS,
        data: CreateAccountDto.withCurrency(currency),
      })

      expect(response.status()).toBe(StatusCodes.CREATED)
    })
  }

  test('create account with owner of 1 character should receive code 201', async ({ request }) => {
    const response = await request.post(accountsUrl, {
      headers: HEADERS,
      data: CreateAccountDto.withOwner('A'),
    })

    expect(response.status()).toBe(StatusCodes.CREATED)
  })

  test('create account with owner of 100 characters should receive code 201', async ({
    request,
  }) => {
    const response = await request.post(accountsUrl, {
      headers: HEADERS,
      data: CreateAccountDto.withOwner('A'.repeat(100)),
    })

    expect(response.status()).toBe(StatusCodes.CREATED)
  })

  // ---------- negative ----------

  const invalidBodies = [
    { scenario: 'without owner', dto: new CreateAccountDto(undefined, 'EUR') },
    { scenario: 'with empty owner', dto: CreateAccountDto.withOwner('') },
    { scenario: 'with owner of 101 characters', dto: CreateAccountDto.withOwner('A'.repeat(101)) },
    { scenario: 'with unsupported currency RUB', dto: CreateAccountDto.withCurrency('RUB') },
    { scenario: 'with lowercase currency eur', dto: CreateAccountDto.withCurrency('eur') },
  ]

  for (const { scenario, dto } of invalidBodies) {
    test(`create account ${scenario} should receive code 400`, async ({ request }) => {
      const response = await request.post(accountsUrl, { headers: HEADERS, data: dto })

      expect(response.status()).toBe(StatusCodes.BAD_REQUEST)
    })
  }

  test('create account with invalid JSON body should receive code 400', async ({ request }) => {
    const response = await request.post(accountsUrl, {
      headers: { ...HEADERS, 'Content-Type': 'application/json' },
      data: '{ "owner": "Kati Mägi", ',
    })

    expect(response.status()).toBe(StatusCodes.BAD_REQUEST)
  })

  test('create account with body larger than 10 000 bytes should receive code 413', async ({
    request,
  }) => {
    const response = await request.post(accountsUrl, {
      headers: HEADERS,
      data: CreateAccountDto.withOwner('A'.repeat(11000)),
    })

    expect(response.status()).toBe(StatusCodes.REQUEST_TOO_LONG)
  })
})

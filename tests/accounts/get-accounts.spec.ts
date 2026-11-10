import { expect, test } from '@playwright/test'
import { StatusCodes } from 'http-status-codes'
import { accountsUrl, HEADERS } from './accounts-config'

test.describe('GET /api/accounts', () => {
  test('get all accounts should receive code 200', async ({ request }) => {
    const response = await request.get(accountsUrl, { headers: HEADERS })

    expect(response.status()).toBe(StatusCodes.OK)
  })

  test('DELETE /api/accounts (unsupported method) should receive code 405', async ({ request }) => {
    const response = await request.delete(accountsUrl, { headers: HEADERS })

    expect(response.status()).toBe(StatusCodes.METHOD_NOT_ALLOWED)
  })
})

import { expect, test } from '@playwright/test'
import { StatusCodes } from 'http-status-codes'
import {
  accountsUrl,
  createAccount,
  HEADERS,
  INVALID_IDS,
  NON_EXISTING_ID,
} from './accounts-config'

test.describe('GET /api/accounts/{id}', () => {
  test('get existing account should receive code 200', async ({ request }) => {
    const id = await createAccount(request)

    const response = await request.get(`${accountsUrl}/${id}`, { headers: HEADERS })

    expect(response.status()).toBe(StatusCodes.OK)
  })

  test('get non-existing account should receive code 404', async ({ request }) => {
    const response = await request.get(`${accountsUrl}/${NON_EXISTING_ID}`, { headers: HEADERS })

    expect(response.status()).toBe(StatusCodes.NOT_FOUND)
  })

  for (const id of INVALID_IDS) {
    test(`get account with invalid id "${id}" should receive code 400`, async ({ request }) => {
      const response = await request.get(`${accountsUrl}/${id}`, { headers: HEADERS })

      expect(response.status()).toBe(StatusCodes.BAD_REQUEST)
    })
  }

  test('DELETE /api/accounts/{id} (unsupported method) should receive code 405', async ({
    request,
  }) => {
    const id = await createAccount(request)

    const response = await request.delete(`${accountsUrl}/${id}`, { headers: HEADERS })

    expect(response.status()).toBe(StatusCodes.METHOD_NOT_ALLOWED)
  })
})

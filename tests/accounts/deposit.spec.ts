import { expect, test } from '@playwright/test'
import { StatusCodes } from 'http-status-codes'
import { DepositDto } from '../../dto/account-dto'
import {
  accountsUrl,
  createAccount,
  HEADERS,
  INVALID_IDS,
  NON_EXISTING_ID,
} from './accounts-config'

test.describe('POST /api/accounts/{id}/deposit', () => {
  let accountId: number

  // fresh own account before each test (DB is shared between all students)
  test.beforeEach(async ({ request }) => {
    accountId = await createAccount(request)
  })

  // ---------- positive ----------

  for (const amount of [25.5, 0.01, 1000000]) {
    test(`deposit amount ${amount} should receive code 200`, async ({ request }) => {
      const response = await request.post(`${accountsUrl}/${accountId}/deposit`, {
        headers: HEADERS,
        data: new DepositDto(amount),
      })

      expect(response.status()).toBe(StatusCodes.OK)
    })
  }

  // ---------- negative ----------

  const invalidAmounts = [
    { scenario: 'zero amount', amount: 0 },
    { scenario: 'negative amount', amount: -10 },
    { scenario: 'amount as string', amount: '10' },
    { scenario: 'amount with 3 decimal places', amount: 1.234 },
    { scenario: 'amount greater than 1 000 000', amount: 1000000.01 },
    { scenario: 'amount null', amount: null },
  ]

  for (const { scenario, amount } of invalidAmounts) {
    test(`deposit with ${scenario} should receive code 400`, async ({ request }) => {
      const response = await request.post(`${accountsUrl}/${accountId}/deposit`, {
        headers: HEADERS,
        data: new DepositDto(amount),
      })

      expect(response.status()).toBe(StatusCodes.BAD_REQUEST)
    })
  }

  test('deposit without amount should receive code 400', async ({ request }) => {
    const response = await request.post(`${accountsUrl}/${accountId}/deposit`, {
      headers: HEADERS,
      data: new DepositDto(undefined),
    })

    expect(response.status()).toBe(StatusCodes.BAD_REQUEST)
  })

  test('deposit to non-existing account should receive code 404', async ({ request }) => {
    const response = await request.post(`${accountsUrl}/${NON_EXISTING_ID}/deposit`, {
      headers: HEADERS,
      data: new DepositDto(10),
    })

    expect(response.status()).toBe(StatusCodes.NOT_FOUND)
  })

  for (const id of INVALID_IDS) {
    test(`deposit to account with invalid id "${id}" should receive code 400`, async ({
      request,
    }) => {
      const response = await request.post(`${accountsUrl}/${id}/deposit`, {
        headers: HEADERS,
        data: new DepositDto(10),
      })

      expect(response.status()).toBe(StatusCodes.BAD_REQUEST)
    })
  }
})

import { expect, test } from '@playwright/test'
import { StatusCodes } from 'http-status-codes'
import { TransferDto } from '../../dto/account-dto'
import {
  accountsUrl,
  createAccount,
  createAccountWithBalance,
  HEADERS,
  INVALID_IDS,
  NON_EXISTING_ID,
} from './accounts-config'

test.describe('POST /api/accounts/{id}/transfer', () => {
  let fromId: number
  let toId: number

  // own EUR accounts for every test: sender with 100 EUR, empty recipient
  test.beforeEach(async ({ request }) => {
    fromId = await createAccountWithBalance(request, 100)
    toId = await createAccount(request)
  })

  // ---------- positive ----------

  test('transfer part of the balance should receive code 200', async ({ request }) => {
    const response = await request.post(`${accountsUrl}/${fromId}/transfer`, {
      headers: HEADERS,
      data: new TransferDto(toId, 40),
    })

    expect(response.status()).toBe(StatusCodes.OK)
  })

  test('transfer whole balance should receive code 200', async ({ request }) => {
    const response = await request.post(`${accountsUrl}/${fromId}/transfer`, {
      headers: HEADERS,
      data: new TransferDto(toId, 100),
    })

    expect(response.status()).toBe(StatusCodes.OK)
  })

  test('transfer minimal amount 0.01 should receive code 200', async ({ request }) => {
    const response = await request.post(`${accountsUrl}/${fromId}/transfer`, {
      headers: HEADERS,
      data: new TransferDto(toId, 0.01),
    })

    expect(response.status()).toBe(StatusCodes.OK)
  })

  // ---------- negative ----------

  test('transfer more than balance should receive code 409', async ({ request }) => {
    const response = await request.post(`${accountsUrl}/${fromId}/transfer`, {
      headers: HEADERS,
      data: new TransferDto(toId, 100.01),
    })

    expect(response.status()).toBe(StatusCodes.CONFLICT)
  })

  test('transfer from empty account should receive code 409', async ({ request }) => {
    const response = await request.post(`${accountsUrl}/${toId}/transfer`, {
      headers: HEADERS,
      data: new TransferDto(fromId, 10),
    })

    expect(response.status()).toBe(StatusCodes.CONFLICT)
  })

  test('transfer to the same account should receive code 400', async ({ request }) => {
    const response = await request.post(`${accountsUrl}/${fromId}/transfer`, {
      headers: HEADERS,
      data: new TransferDto(fromId, 10),
    })

    expect(response.status()).toBe(StatusCodes.BAD_REQUEST)
  })

  test('transfer between different currencies should receive code 400', async ({ request }) => {
    const usdAccountId = await createAccountWithBalance(request, 0.01, 'USD')

    const response = await request.post(`${accountsUrl}/${fromId}/transfer`, {
      headers: HEADERS,
      data: new TransferDto(usdAccountId, 10),
    })

    expect(response.status()).toBe(StatusCodes.BAD_REQUEST)
  })

  const invalidAmounts = [
    { scenario: 'zero amount', amount: 0 },
    { scenario: 'negative amount', amount: -10 },
    { scenario: 'amount as string', amount: '10' },
    { scenario: 'amount with 3 decimal places', amount: 1.234 },
    { scenario: 'amount greater than 1 000 000', amount: 1000000.01 },
    { scenario: 'without amount', amount: undefined },
  ]

  for (const { scenario, amount } of invalidAmounts) {
    test(`transfer with ${scenario} should receive code 400`, async ({ request }) => {
      const response = await request.post(`${accountsUrl}/${fromId}/transfer`, {
        headers: HEADERS,
        data: new TransferDto(toId, amount),
      })

      expect(response.status()).toBe(StatusCodes.BAD_REQUEST)
    })
  }

  const invalidToIds = [
    { scenario: 'toId as string', toId: 'abc' },
    { scenario: 'toId 0', toId: 0 },
    { scenario: 'negative toId', toId: -1 },
    { scenario: 'fractional toId', toId: 1.5 },
    { scenario: 'without toId', toId: undefined },
  ]

  for (const { scenario, toId: invalidToId } of invalidToIds) {
    test(`transfer with ${scenario} should receive code 400`, async ({ request }) => {
      const response = await request.post(`${accountsUrl}/${fromId}/transfer`, {
        headers: HEADERS,
        data: new TransferDto(invalidToId, 10),
      })

      expect(response.status()).toBe(StatusCodes.BAD_REQUEST)
    })
  }

  test('transfer to non-existing recipient should receive code 404', async ({ request }) => {
    const response = await request.post(`${accountsUrl}/${fromId}/transfer`, {
      headers: HEADERS,
      data: new TransferDto(NON_EXISTING_ID, 10),
    })

    expect(response.status()).toBe(StatusCodes.NOT_FOUND)
  })

  test('transfer from non-existing account should receive code 404', async ({ request }) => {
    const response = await request.post(`${accountsUrl}/${NON_EXISTING_ID}/transfer`, {
      headers: HEADERS,
      data: new TransferDto(toId, 10),
    })

    expect(response.status()).toBe(StatusCodes.NOT_FOUND)
  })

  for (const id of INVALID_IDS) {
    test(`transfer from account with invalid id "${id}" should receive code 400`, async ({
      request,
    }) => {
      const response = await request.post(`${accountsUrl}/${id}/transfer`, {
        headers: HEADERS,
        data: new TransferDto(toId, 10),
      })

      expect(response.status()).toBe(StatusCodes.BAD_REQUEST)
    })
  }
})

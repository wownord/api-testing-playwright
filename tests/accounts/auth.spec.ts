import { expect, test } from '@playwright/test'
import { StatusCodes } from 'http-status-codes'
import { CreateAccountDto, DepositDto, TransferDto } from '../../dto/account-dto'
import { accountsUrl } from './accounts-config'

// every /api/accounts endpoint must answer 401 without a key or with a wrong key
const endpoints = [
  { name: 'GET /api/accounts', method: 'get', url: accountsUrl, data: undefined },
  { name: 'GET /api/accounts/{id}', method: 'get', url: `${accountsUrl}/1`, data: undefined },
  {
    name: 'POST /api/accounts',
    method: 'post',
    url: accountsUrl,
    data: CreateAccountDto.withOwner(),
  },
  {
    name: 'POST /api/accounts/{id}/deposit',
    method: 'post',
    url: `${accountsUrl}/1/deposit`,
    data: new DepositDto(10),
  },
  {
    name: 'POST /api/accounts/{id}/transfer',
    method: 'post',
    url: `${accountsUrl}/1/transfer`,
    data: new TransferDto(3, 10),
  },
] as const

test.describe('Authorization (X-API-KEY)', () => {
  for (const endpoint of endpoints) {
    test(`${endpoint.name} without X-API-KEY should receive code 401`, async ({ request }) => {
      const response = await request[endpoint.method](endpoint.url, { data: endpoint.data })

      expect(response.status()).toBe(StatusCodes.UNAUTHORIZED)
    })

    test(`${endpoint.name} with wrong X-API-KEY should receive code 401`, async ({ request }) => {
      const response = await request[endpoint.method](endpoint.url, {
        headers: { 'X-API-KEY': 'wrong-key' },
        data: endpoint.data,
      })

      expect(response.status()).toBe(StatusCodes.UNAUTHORIZED)
    })
  }
})

import { APIRequestContext, expect } from '@playwright/test'
import { StatusCodes } from 'http-status-codes'
import { CreateAccountDto, DepositDto } from '../../dto/account-dto'

export const baseUrl = 'https://shop.tl-academy.ee'
export const accountsUrl = baseUrl + '/api/accounts'

// API key is read from env (.env locally, GitHub secret in CI) and never committed
export const HEADERS = {
  'X-API-KEY': process.env['API_KEY'] ?? '',
}

export const NON_EXISTING_ID = 999999
export const INVALID_IDS = ['abc', '0', '-1', '1.5']

// creates a new account and returns its id (shared DB: tests use their own accounts)
export async function createAccount(
  request: APIRequestContext,
  dto: CreateAccountDto = CreateAccountDto.withOwner(),
): Promise<number> {
  const response = await request.post(accountsUrl, { headers: HEADERS, data: dto })
  expect(response.status()).toBe(StatusCodes.CREATED)
  const body = await response.json()
  return body.id
}

// creates a new account with given balance (via deposit) and returns its id
export async function createAccountWithBalance(
  request: APIRequestContext,
  balance: number,
  currency = 'EUR',
): Promise<number> {
  const id = await createAccount(request, CreateAccountDto.withCurrency(currency))
  const response = await request.post(`${accountsUrl}/${id}/deposit`, {
    headers: HEADERS,
    data: new DepositDto(balance),
  })
  expect(response.status()).toBe(StatusCodes.OK)
  return id
}

// Request body for POST /api/accounts
export class CreateAccountDto {
  owner?: string
  currency?: string

  constructor(owner?: string, currency?: string) {
    this.owner = owner
    this.currency = currency
  }

  // owner only: currency will default to EUR
  static withOwner(owner = 'Kati Mägi'): CreateAccountDto {
    return new CreateAccountDto(owner)
  }

  static withCurrency(currency: string, owner = 'Kati Mägi'): CreateAccountDto {
    return new CreateAccountDto(owner, currency)
  }
}

// Request body for POST /api/accounts/{id}/deposit
export class DepositDto {
  amount: unknown

  constructor(amount: unknown) {
    this.amount = amount
  }
}

// Request body for POST /api/accounts/{id}/transfer
export class TransferDto {
  toId: unknown
  amount: unknown

  constructor(toId: unknown, amount: unknown) {
    this.toId = toId
    this.amount = amount
  }
}

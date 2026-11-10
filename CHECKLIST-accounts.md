# Checklist: Bank Accounts API (https://shop.tl-academy.ee/docs/accounts)

All requests use the `X-API-KEY` header (`API_KEY` env variable). Only status codes are checked.

| #   | Endpoint                         | Scenario                                                  | Expected |
| --- | -------------------------------- | --------------------------------------------------------- | -------- |
| 1   | all `/api/accounts…` endpoints   | No `X-API-KEY` header                                     | 401      |
| 2   | all `/api/accounts…` endpoints   | Wrong `X-API-KEY`                                         | 401      |
| 3   | GET /api/accounts                | Get all accounts                                          | 200      |
| 4   | DELETE /api/accounts             | Unsupported method                                        | 405      |
| 5   | GET /api/accounts/{id}           | Existing account                                          | 200      |
| 6   | GET /api/accounts/{id}           | Non-existing id                                           | 404      |
| 7   | GET /api/accounts/{id}           | Invalid id: `abc`, `0`, `-1`, `1.5`                       | 400      |
| 8   | DELETE /api/accounts/{id}        | Unsupported method                                        | 405      |
| 9   | POST /api/accounts               | Owner only (currency defaults to EUR)                     | 201      |
| 10  | POST /api/accounts               | Currency EUR / USD / GBP                                  | 201      |
| 11  | POST /api/accounts               | Owner 1 and 100 characters (boundaries)                   | 201      |
| 12  | POST /api/accounts               | No owner / empty owner / owner 101 characters             | 400      |
| 13  | POST /api/accounts               | Unsupported currency `RUB`, lowercase `eur`               | 400      |
| 14  | POST /api/accounts               | Invalid JSON body                                         | 400      |
| 15  | POST /api/accounts               | Body larger than 10 000 bytes                             | 413      |
| 16  | POST /api/accounts/{id}/deposit  | Amount 25.5, 0.01, 1 000 000                              | 200      |
| 17  | POST /api/accounts/{id}/deposit  | Amount 0, -10, `"10"`, 1.234, 1 000 000.01, null, missing | 400      |
| 18  | POST /api/accounts/{id}/deposit  | Non-existing account                                      | 404      |
| 19  | POST /api/accounts/{id}/deposit  | Invalid id: `abc`, `0`, `-1`, `1.5`                       | 400      |
| 20  | POST /api/accounts/{id}/transfer | Part of balance / whole balance / 0.01                    | 200      |
| 21  | POST /api/accounts/{id}/transfer | Amount greater than balance / from empty account          | 409      |
| 22  | POST /api/accounts/{id}/transfer | Transfer to the same account                              | 400      |
| 23  | POST /api/accounts/{id}/transfer | Different currencies (EUR → USD)                          | 400      |
| 24  | POST /api/accounts/{id}/transfer | Amount 0, -10, `"10"`, 1.234, 1 000 000.01, missing       | 400      |
| 25  | POST /api/accounts/{id}/transfer | toId `"abc"`, 0, -1, 1.5, missing                         | 400      |
| 26  | POST /api/accounts/{id}/transfer | Non-existing recipient / non-existing sender              | 404      |
| 27  | POST /api/accounts/{id}/transfer | Invalid sender id: `abc`, `0`, `-1`, `1.5`                | 400      |

Not automated: 409 "account limit (500) reached" — would require creating hundreds of accounts in the shared DB.

## Found bugs

Tests for these cases are marked with `test.fail()` until the bugs are fixed.

| #   | Request                                                          | Expected | Actual |
| --- | ---------------------------------------------------------------- | -------- | ------ |
| 1   | POST /api/accounts/{id}/transfer with `toId` equal to `{id}`     | 400      | 200    |
| 2   | POST /api/accounts/{id}/transfer from EUR account to USD account | 400      | 200    |

# Checklist: Shop API (https://shop.tl-academy.ee)

## GET /api/products/{id}

| #   | Scenario                           | Test data      | Expected            |
| --- | ---------------------------------- | -------------- | ------------------- |
| 1   | Get product with existing id       | id = 1         | 200                 |
| 2   | Response contains requested id     | id = 1         | body.id = 1         |
| 3   | Response fields have correct types | id = 1         | string/number types |
| 4   | Response has JSON content-type     | id = 1         | application/json    |
| 5   | Get product with non-existing id   | id = 999999999 | 404                 |
| 6   | Get product with non-numeric id    | id = abc       | 400 / 404           |
| 7   | Get product with negative id       | id = -1        | 400 / 404           |
| 8   | Get product with zero id           | id = 0         | 400 / 404           |
| 9   | Get product with fractional id     | id = 1.5       | 400 / 404           |
| 10  | Get product with blank id          | id = %20       | 400 / 404           |

## POST /api/products

| #   | Scenario                             | Test data               | Expected               |
| --- | ------------------------------------ | ----------------------- | ---------------------- |
| 1   | Create product with valid data       | Orange, Fruit, 2.39, 10 | 201                    |
| 2   | Response echoes sent data and has id | Orange, Fruit, 2.39, 10 | same fields            |
| 3   | Response fields have correct types   | Orange, Fruit, 2.39, 10 | correct types          |
| 4   | Empty body                           | `{}`                    | 400                    |
| 5   | Malformed JSON                       | `{ "name": "Orange", `  | 400                    |
| 6   | Missing name                         | no `name`               | 400                    |
| 7   | Missing category                     | no `category`           | 400                    |
| 8   | Missing price                        | no `price`              | 400                    |
| 9   | Missing quantity (optional field)    | no `quantity`           | 201, quantity = 0      |
| 10  | Empty name                           | `name: ""`              | 400                    |
| 11  | Name of wrong type                   | `name: 123`             | 400                    |
| 12  | Price of wrong type                  | `price: "abc"`          | 400                    |
| 13  | Negative price                       | `price: -1`             | 400 (BUG: returns 201) |
| 14  | Quantity of wrong type               | `quantity: "ten"`       | 400                    |
| 15  | Negative quantity                    | `quantity: -5`          | 400                    |

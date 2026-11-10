// Request body for POST /orders
export class OrderDto {
  status: string
  courierId: number
  customerName: string
  customerPhone: string
  comment: string
  id: number

  constructor(
    status: string,
    courierId: number,
    customerName: string,
    customerPhone: string,
    comment: string,
    id: number,
  ) {
    this.status = status
    this.courierId = courierId
    this.customerName = customerName
    this.customerPhone = customerPhone
    this.comment = comment
    this.id = id
  }

  // id = 0: the server generates a real id
  static createOrderWithoutId(): OrderDto {
    return new OrderDto('OPEN', 0, 'wownord', '55445566', 'homework 12', 0)
  }
}

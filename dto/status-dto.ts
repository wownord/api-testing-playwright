export enum OrderStatus {
  OPEN = 'OPEN',
  ACCEPTED = 'ACCEPTED',
  INPROGRESS = 'INPROGRESS',
  DELIVERED = 'DELIVERED',
}

// Request body for PUT /orders/{id}/status
export class StatusDto {
  status: OrderStatus

  constructor(status: OrderStatus) {
    this.status = status
  }
}

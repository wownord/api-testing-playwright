import { z } from 'zod'

/**
 * API response contract for POST /login/student (200)
 * response body is plain text with JWT: header.payload.signature
 */
export const TokenSchema = z.string().regex(/^[\w-]+\.[\w-]+\.[\w-]+$/)

/**
 * API response contract for order: POST /orders, GET /orders/{id}
 * https://backend.tallinn-learning.ee/swagger-ui/index.html
 */
export const OrderSchema = z
  .object({
    status: z.enum(['OPEN', 'ACCEPTED', 'INPROGRESS', 'DELIVERED']),
    courierId: z.number().nullable(),
    customerName: z.string(),
    customerPhone: z.string(),
    comment: z.string(),
    id: z.number(),
  })
  .strict()

export type Order = z.infer<typeof OrderSchema>

/**
 * API response contract for GET /orders: array of orders
 */
export const OrderListSchema = z.array(OrderSchema)

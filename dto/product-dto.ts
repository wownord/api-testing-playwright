export class ProductDto {
  name: string
  category: string
  price: number
  quantity: number

  constructor(name: string, category: string, price: number, quantity: number) {
    this.name = name
    this.category = category
    this.price = price
    this.quantity = quantity
  }

  // valid product with default test data
  static createValid(): ProductDto {
    return new ProductDto('Orange', 'Fruit', 2.39, 10)
  }
}

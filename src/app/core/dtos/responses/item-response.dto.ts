export interface ItemAPIRes {
  id: string;
  name: string;
  description: string;
  img: string;
  price: number;
  amountOfStock: number;
  stockUrgency: 'STOCK_LOW' | 'STOCK_MEDIUM' | 'STOCK_HIGH';
}

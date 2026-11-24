import { StockUrgencyEnum } from '../enums/stock-urgency.enum';

export interface ItemInterface {
  id: string;
  name: string;
  description: string;
  img: string;
  price: number;
  amountOfStock: number;
  stockUrgency: StockUrgencyEnum;
}

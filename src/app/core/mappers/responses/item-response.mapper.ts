import { ItemInterface } from '../../interfaces/item.interface';
import { StockUrgencyEnum } from '../../enums/stock-urgency.enum';
import { ItemAPIRes } from '../../dtos/responses/item-response.dto';

const URGENCY_MAP: Record<ItemAPIRes['stockUrgency'], StockUrgencyEnum> = {
  STOCK_LOW: StockUrgencyEnum.LOW,
  STOCK_MEDIUM: StockUrgencyEnum.MEDIUM,
  STOCK_HIGH: StockUrgencyEnum.HIGH,
};

export function ItemRestoEntity({ stockUrgency, ...rest }: ItemAPIRes): ItemInterface {
  return { ...rest, stockUrgency: URGENCY_MAP[stockUrgency] };
}

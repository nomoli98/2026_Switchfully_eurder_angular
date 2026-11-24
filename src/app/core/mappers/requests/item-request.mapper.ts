import { ItemInterface } from '../../interfaces/item.interface';
import { ItemReq } from '../../dtos/requests/item-request.dto';

export function toItemReq(item: ItemInterface): ItemReq {
  return {
    name: item.name.trim(),
    description: item.description.trim(),
    price: item.price,
    amountOfStock: item.amountOfStock,
  };
}

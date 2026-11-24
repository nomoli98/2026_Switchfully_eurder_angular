import { AddressInterface } from './address.interface';
import { ItemGroupInterface } from './item-group.interface';

export interface EurderInterface {
  address: AddressInterface;
  itemGroups: ItemGroupInterface[];
  orderId: string;
}

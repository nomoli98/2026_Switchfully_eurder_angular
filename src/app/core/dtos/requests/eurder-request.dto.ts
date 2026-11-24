import { ItemGroupInterface } from '../../interfaces/item-group.interface';

export interface EurderRequestDto {
  customerId: string;
  itemGroups: ItemGroupInterface[];
}

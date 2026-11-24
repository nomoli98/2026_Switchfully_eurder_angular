import { EurderResponseDto } from '../../dtos/responses/eurder-response.dto';
import { EurderInterface } from '../../interfaces/eurder.interface';
import { ItemGroupInterface } from '../../interfaces/item-group.interface';

export function EurderResToEntity(APIres: EurderResponseDto): EurderInterface {
  let groups: ItemGroupInterface[] = [];
  for (let g of APIres.itemGroups) {
    groups.push({
      itemId: g.itemId,
      orderedAmount: g.orderedAmount,
    });
  }
  return {
    address: {
      country: APIres.address.country,
      streetName: APIres.address.streetName,
      postalCode: APIres.address.postalCode,
      houseNumber: APIres.address.houseNumber,
    },
    itemGroups: groups,
    orderId: APIres.orderId,
  };
}

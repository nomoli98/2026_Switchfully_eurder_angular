export interface EurderResponseDto {
  address: {
    country: string;
    houseNumber: string;
    postalCode: string;
    streetName: string;
  };
  itemGroups: { itemId: string; orderedAmount: number }[];
  orderId: string;
}

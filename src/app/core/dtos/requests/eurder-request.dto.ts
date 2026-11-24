export interface EurderRequestDto {
  customerId: string;
  itemGroups: [
    {
      itemId: string;
      orderedAmount: number;
    },
    {
      itemId: string;
      orderedAmount: number;
    },
  ];
}

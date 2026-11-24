/** One line in the basket: which item and how many. Same shape the backend uses for an order line. */
export interface ItemGroupInterface {
  itemId: string;
  orderedAmount: number;
}

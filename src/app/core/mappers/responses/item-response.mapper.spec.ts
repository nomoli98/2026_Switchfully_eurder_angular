import { ItemRestoEntity } from './item-response.mapper';
import { StockUrgencyEnum } from '../../enums/stock-urgency.enum';
import { makeItemRes } from '../../../../testing/fixtures';

describe('ItemRestoEntity', () => {
  it.each([
    ['STOCK_LOW', StockUrgencyEnum.LOW],
    ['STOCK_MEDIUM', StockUrgencyEnum.MEDIUM],
    ['STOCK_HIGH', StockUrgencyEnum.HIGH],
  ] as const)('maps %s to %s', (apiValue, expected) => {
    expect(ItemRestoEntity(makeItemRes({ stockUrgency: apiValue })).stockUrgency).toBe(expected);
  });

  it('copies all other fields unchanged', () => {
    const res = makeItemRes({ id: 'x', name: 'n', description: 'd', img: 'i.png', price: 1.5, amountOfStock: 3 });

    expect(ItemRestoEntity(res)).toEqual({
      id: 'x',
      name: 'n',
      description: 'd',
      img: 'i.png',
      price: 1.5,
      amountOfStock: 3,
      stockUrgency: StockUrgencyEnum.HIGH,
    });
  });

  it('does not mutate the API response', () => {
    const res = makeItemRes();
    const copy = structuredClone(res);
    ItemRestoEntity(res);
    expect(res).toEqual(copy);
  });
});

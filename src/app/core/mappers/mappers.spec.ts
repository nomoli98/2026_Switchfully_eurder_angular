import { ItemRestoEntity } from './responses/item-response.mapper';
import { toItemReq } from './requests/item-request.mapper';
import { UserRestoEntity } from './responses/user-response.mapper';
import { StockUrgencyEnum } from '../enums/stock-urgency.enum';
import { makeItem, makeItemRes, makeUser } from '../../../testing/fixtures';
import { UserRes } from '../dtos/responses/user-response.dto';

describe('ItemRestoEntity', () => {
  it.each([
    ['STOCK_LOW', StockUrgencyEnum.LOW],
    ['STOCK_MEDIUM', StockUrgencyEnum.MEDIUM],
    ['STOCK_HIGH', StockUrgencyEnum.HIGH],
  ] as const)('maps %s to %s', (api, expected) => {
    expect(ItemRestoEntity(makeItemRes({ stockUrgency: api })).stockUrgency).toBe(expected);
  });

  it('keeps every other field', () => {
    expect(ItemRestoEntity(makeItemRes({ id: 'x', name: 'n', price: 3 }))).toEqual(
      makeItem({ id: 'x', name: 'n', price: 3 }),
    );
  });
});

describe('toItemReq', () => {
  it('keeps only name, description, price and stock', () => {
    expect(toItemReq(makeItem())).toEqual({
      name: 'mug',
      description: 'A coffee mug',
      price: 9.5,
      amountOfStock: 20,
    });
  });

  it('trims name and description', () => {
    const r = toItemReq(makeItem({ name: '  a ', description: '\tb\n' }));
    expect(r.name).toBe('a');
    expect(r.description).toBe('b');
  });
});

describe('UserRestoEntity', () => {
  it('maps a full response', () => {
    expect(UserRestoEntity(makeUser() as UserRes)).toEqual(makeUser());
  });

  it('fills missing nested objects with empty strings', () => {
    const result = UserRestoEntity({ id: 'u' } as UserRes);
    expect(result).toEqual({
      id: 'u',
      firstname: '',
      lastname: '',
      address: { country: '', houseNumber: '', postalCode: '', streetName: '' },
      email: { complete: '', domain: '', localPart: '' },
      phoneNumber: { countryCallingCode: '', number: '' },
    });
  });
});

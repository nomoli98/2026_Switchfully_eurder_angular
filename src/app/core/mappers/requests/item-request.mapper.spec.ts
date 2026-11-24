import { toItemReq } from './item-request.mapper';
import { makeItem } from '../../../../testing/fixtures';

describe('toItemReq', () => {
  it('keeps only the fields the API accepts', () => {
    const req = toItemReq(makeItem({ id: 'abc', img: 'x.png' }));

    expect(req).toEqual({
      name: 'Coffee mug',
      description: 'A big mug',
      price: 9.99,
      amountOfStock: 20,
    });
    expect(req).not.toHaveProperty('id');
    expect(req).not.toHaveProperty('img');
    expect(req).not.toHaveProperty('stockUrgency');
  });

  it('trims name and description', () => {
    const req = toItemReq(makeItem({ name: '  Mug  ', description: '\n Big mug \t' }));

    expect(req.name).toBe('Mug');
    expect(req.description).toBe('Big mug');
  });

  it('passes price and stock through unchanged, including zero', () => {
    const req = toItemReq(makeItem({ price: 0, amountOfStock: 0 }));

    expect(req.price).toBe(0);
    expect(req.amountOfStock).toBe(0);
  });
});

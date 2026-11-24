import { TestBed } from '@angular/core/testing';
import { BasketService } from './basket.service';

describe('BasketService', () => {
  let service: BasketService;

  beforeEach(() => {
    service = TestBed.inject(BasketService);
  });

  it('starts empty', () => {
    expect(service.basket()).toEqual([]);
    expect(service.count()).toBe(0);
  });

  it('addToBasket adds a new line (1 by default)', () => {
    service.addToBasket('a');
    expect(service.basket()).toEqual([{ itemId: 'a', orderedAmount: 1 }]);
  });

  it('addToBasket adds to an existing line instead of duplicating it', () => {
    service.addToBasket('a', 2);
    service.addToBasket('b', 1);
    service.addToBasket('a', 3);
    expect(service.basket()).toEqual([
      { itemId: 'a', orderedAmount: 5 },
      { itemId: 'b', orderedAmount: 1 },
    ]);
  });

  it.each([0, -1, 1.5, NaN])('addToBasket ignores invalid amount %s', (amount) => {
    service.addToBasket('a', amount);
    expect(service.basket()).toEqual([]);
  });

  it('count sums the amounts of every line', () => {
    service.addToBasket('a', 2);
    service.addToBasket('b', 3);
    expect(service.count()).toBe(5);
  });

  it('updateAmount replaces the amount of one line', () => {
    service.addToBasket('a', 2);
    service.addToBasket('b', 1);
    service.updateAmount('a', 7);
    expect(service.basket()).toEqual([
      { itemId: 'a', orderedAmount: 7 },
      { itemId: 'b', orderedAmount: 1 },
    ]);
  });

  it('updateAmount to 0 removes the line', () => {
    service.addToBasket('a', 2);
    service.updateAmount('a', 0);
    expect(service.basket()).toEqual([]);
  });

  it('removeItem removes only that line', () => {
    service.addToBasket('a');
    service.addToBasket('b');
    service.removeItem('a');
    expect(service.basket()).toEqual([{ itemId: 'b', orderedAmount: 1 }]);
  });

  it('clear empties the basket', () => {
    service.addToBasket('a', 4);
    service.clear();
    expect(service.basket()).toEqual([]);
    expect(service.count()).toBe(0);
  });

  it('never mutates the previous array or line objects (signals need new references)', () => {
    service.addToBasket('a', 1);
    const before = service.basket();
    const line = before[0];
    service.addToBasket('a', 1);
    expect(service.basket()).not.toBe(before);
    expect(line.orderedAmount).toBe(1);
  });

  it('is a singleton', () => {
    service.addToBasket('a');
    expect(TestBed.inject(BasketService).basket()).toHaveLength(1);
  });
});

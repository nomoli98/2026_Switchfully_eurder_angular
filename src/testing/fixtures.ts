import { ItemInterface } from '../app/core/interfaces/item.interface';
import { UserInterface } from '../app/core/interfaces/user.interface';
import { ItemAPIRes } from '../app/core/dtos/responses/item-response.dto';
import { UserRes } from '../app/core/dtos/responses/user-response.dto';
import { StockUrgencyEnum } from '../app/core/enums/stock-urgency.enum';

export function makeItem(overrides: Partial<ItemInterface> = {}): ItemInterface {
  return {
    id: 'item-1',
    name: 'mug',
    description: 'A coffee mug',
    img: '',
    price: 9.5,
    amountOfStock: 20,
    stockUrgency: StockUrgencyEnum.HIGH,
    ...overrides,
  };
}

export function makeItemRes(overrides: Partial<ItemAPIRes> = {}): ItemAPIRes {
  return {
    id: 'item-1',
    name: 'mug',
    description: 'A coffee mug',
    img: '',
    price: 9.5,
    amountOfStock: 20,
    stockUrgency: 'STOCK_HIGH',
    ...overrides,
  };
}

export function makeUser(overrides: Partial<UserInterface> = {}): UserInterface {
  return {
    id: 'user-1',
    firstname: 'Ada',
    lastname: 'Lovelace',
    email: { localPart: 'ada', domain: 'example.com', complete: 'ada@example.com' },
    address: {
      streetName: 'Main street',
      houseNumber: '1',
      postalCode: '1000',
      country: 'Belgium',
    },
    phoneNumber: { number: '470123456', countryCallingCode: '+32' },
    ...overrides,
  };
}

export function makeUserRes(overrides: Partial<UserRes> = {}): UserRes {
  return { ...makeUser(), ...overrides } as UserRes;
}

/** Types into an input/textarea/select the way a user would (fires input + change + blur) */
export function typeInto(
  el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  value: string,
) {
  el.value = value;
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
  el.dispatchEvent(new Event('blur'));
}

export function q<T extends Element = HTMLElement>(root: HTMLElement, selector: string): T {
  const el = root.querySelector<T>(selector);
  if (!el) {
    throw new Error(`No element matches "${selector}"`);
  }
  return el;
}

export function qa<T extends Element = HTMLElement>(root: HTMLElement, selector: string): T[] {
  return Array.from(root.querySelectorAll<T>(selector));
}

export function text(el: Element | null | undefined): string {
  return (el?.textContent ?? '').replace(/\s+/g, ' ').trim();
}

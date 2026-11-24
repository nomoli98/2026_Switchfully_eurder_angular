import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { Mock } from 'vitest';

type AnyFn = (...args: any[]) => any;
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FormUserComponent } from './form-user.component';
import { UserInterface } from '../../../core/interfaces/user.interface';
import { UserReq } from '../../../core/dtos/requests/user-request.dto';
import { makeUser, q, qa, text, typeInto } from '../../../../testing/fixtures';

describe('FormUserComponent', () => {
  let fixture: ComponentFixture<FormUserComponent>;
  let el: HTMLElement;
  let navigate: ReturnType<typeof vi.spyOn>;

  async function setup(inputs: {
    editable: boolean;
    methodName?: 'create' | 'update';
    user?: UserInterface;
    method?: AnyFn;
  }) {
    TestBed.configureTestingModule({
      imports: [FormUserComponent],
      providers: [provideRouter([])],
    });
    fixture = TestBed.createComponent(FormUserComponent);
    for (const [k, v] of Object.entries(inputs)) {
      fixture.componentRef.setInput(k, v);
    }
    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    await fixture.whenStable();
    el = fixture.nativeElement;
  }

  const input = (id: string) => q<HTMLInputElement>(el, `#${id}`);
  const submit = async () => {
    q<HTMLFormElement>(el, 'form').dispatchEvent(new Event('submit', { cancelable: true }));
    await fixture.whenStable();
  };
  const feedback = () => qa(el, '.invalid-feedback').map(text);
  const fillValid = async () => {
    typeInto(input('firstname'), 'Grace');
    typeInto(input('lastname'), 'Hopper');
    typeInto(input('email'), 'grace@navy.mil');
    typeInto(input('callingCode'), '32');
    typeInto(input('phone'), '470 12 34 56');
    typeInto(input('street'), 'Dock street');
    typeInto(input('houseNumber'), '12B');
    typeInto(input('postalCode'), '2000');
    typeInto(input('country'), 'Belgium');
    await fixture.whenStable();
  };
  const errorFor = async (id: string, value: string) => {
    typeInto(input(id), value);
    await fixture.whenStable();
    return text(input(id).parentElement!.querySelector('.invalid-feedback'));
  };

  describe('create mode', () => {
    let method: Mock<AnyFn>;

    beforeEach(async () => {
      method = vi.fn<AnyFn>(() => of(makeUser({ id: 'new-user' })));
      await setup({ editable: true, methodName: 'create', method });
    });

    it('shows the title and Create/Cancel', () => {
      expect(text(q(el, '.navbar-text'))).toBe('create user');
      expect(qa(el, 'button').map(text)).toEqual(['create', 'Cancel']);
    });

    it('shows no errors before touching', () => {
      expect(feedback()).toEqual([]);
    });

    it.each([
      ['firstname', 'Please enter a first name.'],
      ['lastname', 'Please enter a last name.'],
      ['email', 'Please enter an email address.'],
      ['callingCode', 'Required.'],
      ['phone', 'Please enter a phone number.'],
      ['street', 'Please enter a street name.'],
      ['houseNumber', 'Please enter a house number.'],
      ['postalCode', 'Please enter a postal code.'],
      ['country', 'Please enter a country.'],
    ])('%s is required', async (id, message) => {
      expect(await errorFor(id, '')).toBe(message);
    });

    it.each(['ada', 'ada@', '@example.com'])('rejects email %s', async (value) => {
      expect(await errorFor('email', value)).toBe('Please enter a valid email address.');
    });

    it.each(['32', '1', '1234'])('accepts calling code %s', async (value) => {
      expect(await errorFor('callingCode', value)).toBe('');
    });

    it.each(['+32', '12345', 'ab', '3 2'])(
      'rejects calling code %s (the "+" is already shown)',
      async (value) => {
        expect(await errorFor('callingCode', value)).toBe('Invalid code (e.g. 32).');
      },
    );

    it('shows a "+" in front of the calling code, a digits placeholder and a number keyboard', () => {
      const field = input('callingCode');
      expect(text(field.previousElementSibling)).toBe('+');
      expect(field.placeholder).toBe('32');
      expect(field.getAttribute('inputmode')).toBe('numeric');
    });

    it.each(['470 12 34 56', '0470/12.34-56', '123456'])(
      'accepts phone number %s',
      async (value) => {
        expect(await errorFor('phone', value)).toBe('');
      },
    );

    it.each(['12345', 'phone me', '1'.repeat(21)])('rejects phone number %s', async (value) => {
      expect(await errorFor('phone', value)).toBe('Please enter a valid phone number.');
    });

    it('does not save an invalid form', async () => {
      await submit();
      expect(method).not.toHaveBeenCalled();
    });

    it('sends the full payload, splitting the email and adding "+" to the code', async () => {
      await fillValid();
      await submit();
      expect(method).toHaveBeenCalledWith({
        firstname: 'Grace',
        lastname: 'Hopper',
        email: { complete: 'grace@navy.mil', localPart: 'grace', domain: 'navy.mil' },
        address: {
          streetName: 'Dock street',
          houseNumber: '12B',
          postalCode: '2000',
          country: 'Belgium',
        },
        phoneNumber: { number: '470 12 34 56', countryCallingCode: '+32' },
      });
    });

    it('trims the email before splitting it', async () => {
      await fillValid();
      typeInto(input('email'), '  grace@navy.mil ');
      await fixture.whenStable();
      await submit();
      expect(method.mock.calls[0][0].email).toEqual({
        complete: 'grace@navy.mil',
        localPart: 'grace',
        domain: 'navy.mil',
      });
    });

    it('goes to the new customer page after saving', async () => {
      await fillValid();
      await submit();
      expect(navigate).toHaveBeenCalledWith(['/customers', 'new-user']);
    });

    it('goes to the overview when the response has no id', async () => {
      method.mockReturnValue(of({} as UserInterface));
      await fillValid();
      await submit();
      expect(navigate).toHaveBeenCalledWith(['/customers']);
    });

    it('stays on the page and re-enables the button when saving fails', async () => {
      method.mockReturnValue(throwError(() => new Error('boom')));
      await fillValid();
      await submit();
      expect(navigate).not.toHaveBeenCalled();
      expect(q<HTMLButtonElement>(el, 'button[type=submit]').disabled).toBe(false);
    });

    it('cancel goes back to the overview and clears the form', async () => {
      typeInto(input('firstname'), 'Draft');
      await fixture.whenStable();
      q<HTMLButtonElement>(el, 'button.btn-secondary').click();
      await fixture.whenStable();
      expect(navigate).toHaveBeenCalledWith(['/customers']);
      expect(input('firstname').value).toBe('');
    });
  });

  describe('update mode', () => {
    let method: Mock<AnyFn>;
    const user = makeUser({ id: 'u7' });

    beforeEach(async () => {
      method = vi.fn<AnyFn>(() => of(user));
      await setup({ editable: true, methodName: 'update', user, method });
    });

    it('shows the title with the id', () => {
      expect(text(q(el, '.navbar-text'))).toBe('update user u7');
    });

    it('fills the fields, showing the code without its "+"', () => {
      expect(input('firstname').value).toBe('Ada');
      expect(input('email').value).toBe('ada@example.com');
      expect(input('callingCode').value).toBe('32');
      expect(input('country').value).toBe('Belgium');
    });

    it('saving unchanged sends the code back with its "+"', async () => {
      await submit();
      expect(method.mock.calls[0][0].phoneNumber).toEqual({
        number: '470123456',
        countryCallingCode: '+32',
      });
      expect(navigate).toHaveBeenCalledWith(['/customers', 'u7']);
    });

    it('cancel goes back to the detail page', async () => {
      q<HTMLButtonElement>(el, 'button.btn-secondary').click();
      await fixture.whenStable();
      expect(navigate).toHaveBeenCalledWith(['/customers', 'u7']);
    });
  });

  it('loads and saves a code that was stored without "+"', async () => {
    const method = vi.fn<AnyFn>(() => of(makeUser()));
    await setup({
      editable: true,
      methodName: 'update',
      user: makeUser({ phoneNumber: { number: '7700900123', countryCallingCode: '44' } }),
      method,
    });
    expect(input('callingCode').value).toBe('44');
    await submit();
    expect(method.mock.calls[0][0].phoneNumber.countryCallingCode).toBe('+44');
  });

  describe('read-only mode', () => {
    beforeEach(async () => {
      await setup({ editable: false, user: makeUser({ id: 'r1' }) });
    });

    it('disables every field', () => {
      for (const field of qa<HTMLInputElement>(el, 'input')) {
        expect(field.disabled).toBe(true);
      }
    });

    it('shows Edit (to the edit page) and Back (to the overview)', () => {
      const [edit, back] = qa<HTMLButtonElement>(el, 'button');
      expect([text(edit), text(back)]).toEqual(['Edit', 'Back']);
      const navigateByUrl = vi
        .spyOn(TestBed.inject(Router), 'navigateByUrl')
        .mockResolvedValue(true);
      edit.click();
      expect(String(navigateByUrl.mock.calls[0][0])).toBe('/customers/r1/edit');
      back.click();
      expect(String(navigateByUrl.mock.calls[1][0])).toBe('/customers');
    });
  });
});

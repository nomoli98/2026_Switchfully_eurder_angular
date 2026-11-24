import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { Mock } from 'vitest';

type AnyFn = (...args: any[]) => any;
import { provideRouter, Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { FormItemComponent } from './form-item.component';
import { ItemInterface } from '../../../core/interfaces/item.interface';
import { makeItem, q, qa, text, typeInto } from '../../../../testing/fixtures';

describe('FormItemComponent', () => {
  let fixture: ComponentFixture<FormItemComponent>;
  let el: HTMLElement;
  let navigate: ReturnType<typeof vi.spyOn>;

  async function setup(inputs: {
    editable: boolean;
    methodName?: 'create' | 'update';
    item?: ItemInterface;
    method?: AnyFn;
  }) {
    TestBed.configureTestingModule({
      imports: [FormItemComponent],
      providers: [provideRouter([])],
    });
    fixture = TestBed.createComponent(FormItemComponent);
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
  const fillValid = async () => {
    typeInto(input('name'), 'Mug');
    typeInto(q<HTMLTextAreaElement>(el, '#description'), 'Nice mug');
    typeInto(input('price'), '4.5');
    typeInto(input('stock'), '3');
    await fixture.whenStable();
  };
  const feedback = () => qa(el, '.invalid-feedback').map(text);

  describe('create mode', () => {
    let method: Mock<AnyFn>;

    beforeEach(async () => {
      method = vi.fn<AnyFn>(() => of(makeItem({ id: 'new-id' })));
      await setup({ editable: true, methodName: 'create', method });
    });

    it('shows the title and empty fields', () => {
      expect(text(q(el, '.navbar-text'))).toBe('create item');
      expect(input('name').value).toBe('');
      expect(input('price').value).toBe('0');
    });

    it('shows Create and Cancel buttons', () => {
      expect(qa(el, 'button').map(text)).toEqual(['create', 'Cancel']);
    });

    it('does not show errors before the user touches a field', () => {
      expect(feedback()).toEqual([]);
    });

    it('requires a name', async () => {
      typeInto(input('name'), '');
      await fixture.whenStable();
      expect(feedback()).toContain('Please enter a name.');
      expect(input('name').classList).toContain('is-invalid');
    });

    it('requires a description', async () => {
      typeInto(q<HTMLTextAreaElement>(el, '#description'), '');
      await fixture.whenStable();
      expect(feedback()).toContain('Please enter a description.');
    });

    it('rejects a negative price', async () => {
      typeInto(input('price'), '-1');
      await fixture.whenStable();
      expect(feedback()).toContain("Price can't be negative.");
    });

    it('rejects negative stock', async () => {
      typeInto(input('stock'), '-5');
      await fixture.whenStable();
      expect(feedback()).toContain("Stock can't be negative.");
    });

    it('accepts 0 price and 0 stock', async () => {
      await fillValid();
      typeInto(input('price'), '0');
      typeInto(input('stock'), '0');
      await fixture.whenStable();
      expect(feedback()).toEqual([]);
    });

    it('counts description characters', async () => {
      typeInto(q<HTMLTextAreaElement>(el, '#description'), 'abcde');
      await fixture.whenStable();
      expect(text(q(el, '.form-text'))).toContain('5/255');
    });

    it('accepts exactly 255 characters', async () => {
      await fillValid();
      typeInto(q<HTMLTextAreaElement>(el, '#description'), 'a'.repeat(255));
      await fixture.whenStable();
      expect(feedback()).toEqual([]);
      expect(text(q(el, '.form-text'))).toContain('255/255');
    });

    it('rejects 256 characters and turns the counter red', async () => {
      typeInto(q<HTMLTextAreaElement>(el, '#description'), 'a'.repeat(256));
      await fixture.whenStable();
      expect(feedback()).toContain('Description cannot be longer than 255 characters');
      expect(q(el, '.form-text').classList).toContain('text-danger');
    });

    it('does not save an invalid form', async () => {
      await submit();
      expect(method).not.toHaveBeenCalled();
      expect(navigate).not.toHaveBeenCalled();
    });

    it('saves a valid form with the typed values', async () => {
      await fillValid();
      await submit();
      expect(method).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Mug',
          description: 'Nice mug',
          price: 4.5,
          amountOfStock: 3,
        }),
      );
    });

    it('goes to the new item page after creating', async () => {
      await fillValid();
      await submit();
      expect(navigate).toHaveBeenCalledWith(['/items', 'new-id']);
    });

    it('goes to the overview when the saved item has no id', async () => {
      method.mockReturnValue(of({} as ItemInterface));
      await fillValid();
      await submit();
      expect(navigate).toHaveBeenCalledWith(['/items']);
    });

    it('disables the submit button while saving', async () => {
      const pending = new Subject<ItemInterface>();
      method.mockReturnValue(pending);
      await fillValid();
      await submit();
      expect(q<HTMLButtonElement>(el, 'button[type=submit]').disabled).toBe(true);
      pending.next(makeItem({ id: 'x' }));
      pending.complete();
      await fixture.whenStable();
      expect(q<HTMLButtonElement>(el, 'button[type=submit]').disabled).toBe(false);
    });

    it('re-enables the button and stays on the page when saving fails', async () => {
      method.mockReturnValue(throwError(() => new Error('500')));
      await fillValid();
      await submit();
      expect(q<HTMLButtonElement>(el, 'button[type=submit]').disabled).toBe(false);
      expect(navigate).not.toHaveBeenCalled();
      expect(input('name').value).toBe('Mug');
    });

    it('cancel resets the form and goes back to the overview', async () => {
      typeInto(input('name'), 'Draft');
      await fixture.whenStable();
      q<HTMLButtonElement>(el, 'button.btn-secondary').click();
      await fixture.whenStable();
      expect(navigate).toHaveBeenCalledWith(['/items']);
      expect(input('name').value).toBe('');
    });
  });

  describe('update mode', () => {
    let method: Mock<AnyFn>;
    const item = makeItem({ id: 'abc', name: 'Old name', price: 2 });

    beforeEach(async () => {
      method = vi.fn<AnyFn>(() => of(item));
      await setup({ editable: true, methodName: 'update', item, method });
    });

    it('shows the title with the id', () => {
      expect(text(q(el, '.navbar-text'))).toBe('update item abc');
    });

    it('fills the fields with the item', () => {
      expect(input('name').value).toBe('Old name');
      expect(input('price').value).toBe('2');
      expect(q<HTMLTextAreaElement>(el, '#description').value).toBe('A coffee mug');
    });

    it('saves the edited values', async () => {
      typeInto(input('name'), 'New name');
      await fixture.whenStable();
      await submit();
      expect(method).toHaveBeenCalledWith(expect.objectContaining({ id: 'abc', name: 'New name' }));
      expect(navigate).toHaveBeenCalledWith(['/items', 'abc']);
    });

    it('falls back to the input item id when the response has none', async () => {
      method.mockReturnValue(of({} as ItemInterface));
      await submit();
      expect(navigate).toHaveBeenCalledWith(['/items', 'abc']);
    });

    it('cancel goes back to the detail page', async () => {
      q<HTMLButtonElement>(el, 'button.btn-secondary').click();
      await fixture.whenStable();
      expect(navigate).toHaveBeenCalledWith(['/items', 'abc']);
    });
  });

  describe('read-only mode', () => {
    beforeEach(async () => {
      await setup({ editable: false, item: makeItem({ id: 'ro' }) });
    });

    it('disables every field', () => {
      for (const id of ['name', 'price', 'stock']) {
        expect(input(id).disabled).toBe(true);
      }
      expect(q<HTMLTextAreaElement>(el, '#description').disabled).toBe(true);
    });

    it('shows Edit (to the update page) and Back (to the overview)', () => {
      const [edit, back] = qa<HTMLButtonElement>(el, 'button');
      expect(text(edit)).toBe('Edit');
      expect(text(back)).toBe('Back');
      const navigateByUrl = vi
        .spyOn(TestBed.inject(Router), 'navigateByUrl')
        .mockResolvedValue(true);
      edit.click();
      expect(String(navigateByUrl.mock.calls[0][0])).toBe('/items/ro/update');
      back.click();
      expect(String(navigateByUrl.mock.calls[1][0])).toBe('/items');
    });
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { UpdateItemComponent } from './update-item.component';
import { ItemService } from '../../../core/services/item/item.service';
import { FormItemComponent } from '../../forms/form-item/form-item.component';
import { makeItem, text } from '../../../../testing/fixtures';

describe('UpdateItemComponent', () => {
  let fixture: ComponentFixture<UpdateItemComponent>;
  const getOneItem = vi.fn();
  const updateItem = vi.fn();

  async function setup() {
    TestBed.configureTestingModule({
      imports: [UpdateItemComponent],
      providers: [
        provideRouter([]),
        { provide: ItemService, useValue: { getOneItem, updateItem } },
      ],
    });
    fixture = TestBed.createComponent(UpdateItemComponent);
    fixture.componentRef.setInput('id', 'abc');
    await fixture.whenStable();
  }

  const form = () =>
    fixture.debugElement.query((d) => d.componentInstance instanceof FormItemComponent)
      ?.componentInstance as FormItemComponent | undefined;

  beforeEach(() => {
    getOneItem.mockReset();
    updateItem.mockReset();
  });

  it('loads the item from the route id and passes it to the form', async () => {
    getOneItem.mockReturnValue(of(makeItem({ id: 'abc', name: 'loaded' })));
    await setup();
    expect(getOneItem).toHaveBeenCalledWith('abc');
    expect(form()!.item()!.name).toBe('loaded');
    expect(form()!.methodName()).toBe('update');
    expect(form()!.editable()).toBe(true);
  });

  it('saves through updateItem with the route id', async () => {
    getOneItem.mockReturnValue(of(makeItem({ id: 'abc' })));
    updateItem.mockReturnValue(of(makeItem({ id: 'abc' })));
    await setup();
    const edited = makeItem({ id: 'abc', name: 'edited' });
    form()!.method()!(edited).subscribe();
    expect(updateItem).toHaveBeenCalledWith('abc', edited);
  });

  it('leaves navigation to the form (no navigation of its own)', async () => {
    getOneItem.mockReturnValue(of(makeItem({ id: 'abc' })));
    updateItem.mockReturnValue(of(makeItem({ id: 'abc' })));
    await setup();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate');
    form()!.method()!(makeItem()).subscribe();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('shows an error when the item cannot be loaded', async () => {
    getOneItem.mockReturnValue(throwError(() => new Error('404')));
    await setup();
    expect(text(fixture.nativeElement)).toContain('Could not load this item.');
    expect(form()).toBeUndefined();
  });
});

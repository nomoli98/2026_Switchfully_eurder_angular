import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { CreateItemComponent } from './create-item.component';
import { ItemService } from '../../../core/services/item/item.service';
import { FormItemComponent } from '../../forms/form-item/form-item.component';
import { makeItem } from '../../../../testing/fixtures';

describe('CreateItemComponent', () => {
  it('renders an editable create form wired to ItemService.createItem', async () => {
    const createItem = vi.fn(() => of(makeItem({ id: 'n1' })));
    TestBed.configureTestingModule({
      imports: [CreateItemComponent],
      providers: [provideRouter([]), { provide: ItemService, useValue: { createItem } }],
    });
    const fixture = TestBed.createComponent(CreateItemComponent);
    await fixture.whenStable();

    const form = fixture.debugElement.query((d) => d.componentInstance instanceof FormItemComponent)
      .componentInstance as FormItemComponent;
    expect(form.editable()).toBe(true);
    expect(form.methodName()).toBe('create');

    const item = makeItem();
    form.method()!(item).subscribe();
    expect(createItem).toHaveBeenCalledWith(item);
  });

  it('leaves navigation to the form (no navigation of its own)', async () => {
    TestBed.configureTestingModule({
      imports: [CreateItemComponent],
      providers: [
        provideRouter([]),
        { provide: ItemService, useValue: { createItem: () => of(makeItem()) } },
      ],
    });
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate');
    const fixture = TestBed.createComponent(CreateItemComponent);
    await fixture.whenStable();
    const form = fixture.debugElement.query((d) => d.componentInstance instanceof FormItemComponent)
      .componentInstance as FormItemComponent;
    form.method()!(makeItem()).subscribe();
    expect(navigate).not.toHaveBeenCalled();
  });
});

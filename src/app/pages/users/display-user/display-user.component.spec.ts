import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { DisplayUserComponent } from './display-user.component';
import { UserService } from '../../../core/services/user/user.service';
import { FormUserComponent } from '../../forms/form-user/form-user.component';
import { makeUser } from '../../../../testing/fixtures';

describe('DisplayUserComponent', () => {
  it('loads the customer from the route id into a read-only form', async () => {
    const getOneUser = vi.fn(() => of(makeUser({ id: 'u3' })));
    TestBed.configureTestingModule({
      imports: [DisplayUserComponent],
      providers: [provideRouter([]), { provide: UserService, useValue: { getOneUser } }],
    });
    const fixture = TestBed.createComponent(DisplayUserComponent);
    fixture.componentRef.setInput('id', 'u3');
    await fixture.whenStable();

    expect(getOneUser).toHaveBeenCalledWith('u3');
    const form = fixture.debugElement.query((d) => d.componentInstance instanceof FormUserComponent)
      .componentInstance as FormUserComponent;
    expect(form.editable()).toBe(false);
    expect(form.user()!.id).toBe('u3');
  });
});

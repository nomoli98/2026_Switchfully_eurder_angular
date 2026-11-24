import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { UpdateUserComponent } from './update-user.component';
import { UserService } from '../../../core/services/user/user.service';
import { FormUserComponent } from '../../forms/form-user/form-user.component';
import { makeUser } from '../../../../testing/fixtures';
import { UserReq } from '../../../core/dtos/requests/user-request.dto';

describe('UpdateUserComponent', () => {
  it('loads the customer and saves through updateUser with its id', async () => {
    const getOneUser = vi.fn(() => of(makeUser({ id: 'u5', firstname: 'Loaded' })));
    const updateUser = vi.fn(() => of(makeUser({ id: 'u5' })));
    TestBed.configureTestingModule({
      imports: [UpdateUserComponent],
      providers: [
        provideRouter([]),
        { provide: UserService, useValue: { getOneUser, updateUser } },
      ],
    });
    const fixture = TestBed.createComponent(UpdateUserComponent);
    fixture.componentRef.setInput('id', 'u5');
    await fixture.whenStable();

    expect(getOneUser).toHaveBeenCalledWith('u5');
    const form = fixture.debugElement.query((d) => d.componentInstance instanceof FormUserComponent)
      .componentInstance as FormUserComponent;
    expect(form.user()!.firstname).toBe('Loaded');
    expect(form.methodName()).toBe('update');

    const req = { firstname: 'x' } as UserReq;
    form.method()!(req).subscribe();
    expect(updateUser).toHaveBeenCalledWith('u5', req);
  });
});

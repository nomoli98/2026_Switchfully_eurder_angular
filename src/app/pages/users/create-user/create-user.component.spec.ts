import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { CreateUserComponent } from './create-user.component';
import { UserService } from '../../../core/services/user/user.service';
import { FormUserComponent } from '../../forms/form-user/form-user.component';
import { makeUser } from '../../../../testing/fixtures';
import { UserReq } from '../../../core/dtos/requests/user-request.dto';

describe('CreateUserComponent', () => {
  it('renders an editable create form wired to UserService.createUser', async () => {
    const createUser = vi.fn(() => of(makeUser()));
    TestBed.configureTestingModule({
      imports: [CreateUserComponent],
      providers: [provideRouter([]), { provide: UserService, useValue: { createUser } }],
    });
    const fixture = TestBed.createComponent(CreateUserComponent);
    await fixture.whenStable();
    const form = fixture.debugElement.query((d) => d.componentInstance instanceof FormUserComponent)
      .componentInstance as FormUserComponent;
    expect(form.editable()).toBe(true);
    expect(form.methodName()).toBe('create');
    const req = { firstname: 'x' } as UserReq;
    form.method()!(req).subscribe();
    expect(createUser).toHaveBeenCalledWith(req);
  });
});

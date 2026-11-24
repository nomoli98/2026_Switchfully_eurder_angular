import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { UserService } from '../../core/services/user/user.service';
import { AuthService } from '../../core/services/auth/auth.service';
import { makeUser, q, text, typeInto } from '../../../testing/fixtures';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let el: HTMLElement;
  let auth: AuthService;
  let router: Router;
  const getOneUser = vi.fn();

  async function setup(
    users: ReturnType<typeof makeUser>[] | Error = [
      makeUser(),
      makeUser({ id: 'user-2', firstname: 'Grace', lastname: 'Hopper' }),
    ],
  ) {
    localStorage.clear();
    getOneUser.mockReset().mockImplementation((id: string) => of(makeUser({ id })));
    const getAllUsers = () => (users instanceof Error ? throwError(() => users) : of(users));
    TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideRouter([]), { provide: UserService, useValue: { getAllUsers, getOneUser } }],
    });
    auth = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    fixture = TestBed.createComponent(LoginComponent);
    await fixture.whenStable();
    el = fixture.nativeElement;
  }

  afterEach(() => localStorage.clear());

  it('lists the customers', async () => {
    await setup();
    const options = Array.from(el.querySelectorAll('option')).map((o) => text(o));
    expect(options).toEqual(['Select a customer', 'Ada Lovelace', 'Grace Hopper']);
  });

  it('shows an error when submitting without choosing', async () => {
    await setup();
    q<HTMLFormElement>(el, 'form').dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    expect(text(q(el, '[data-testid="login-error"]'))).toBe('Please choose a customer.');
    expect(auth.isLoggedIn()).toBe(false);
  });

  it('logs in as the chosen customer and goes home', async () => {
    await setup();
    typeInto(q<HTMLSelectElement>(el, 'select'), 'user-2');
    q<HTMLFormElement>(el, 'form').dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    expect(getOneUser).toHaveBeenCalledWith('user-2');
    expect(auth.user()?.id).toBe('user-2');
    expect(router.navigateByUrl).toHaveBeenCalledWith('/');
  });

  it('goes back to returnUrl after logging in', async () => {
    await setup();
    fixture.componentRef.setInput('returnUrl', '/basket');
    typeInto(q<HTMLSelectElement>(el, 'select'), 'user-1');
    q<HTMLFormElement>(el, 'form').dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/basket');
  });

  it('ignores a returnUrl that leaves the app', async () => {
    await setup();
    fixture.componentRef.setInput('returnUrl', '//evil.com');
    typeInto(q<HTMLSelectElement>(el, 'select'), 'user-1');
    q<HTMLFormElement>(el, 'form').dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/');
  });

  it('shows an error when the customer cannot be loaded', async () => {
    await setup();
    getOneUser.mockReturnValue(throwError(() => new Error('500')));
    typeInto(q<HTMLSelectElement>(el, 'select'), 'user-1');
    q<HTMLFormElement>(el, 'form').dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    expect(text(q(el, '[data-testid="login-error"]'))).toBe('Could not log in, please try again.');
    expect(auth.isLoggedIn()).toBe(false);
  });

  it('tells the user when the customers cannot be loaded', async () => {
    await setup(new Error('down'));
    expect(text(q(el, '[role="alert"]'))).toContain('Could not load the customers');
  });

  it('shows who is logged in, with a logout button', async () => {
    await setup();
    auth.login(makeUser());
    await fixture.whenStable();
    expect(text(q(el, '[data-testid="logged-in-as"]'))).toContain('Ada Lovelace');
    q<HTMLButtonElement>(el, 'button.btn-outline-secondary').click();
    await fixture.whenStable();
    expect(auth.isLoggedIn()).toBe(false);
    expect(el.querySelector('form')).not.toBeNull();
  });
});

import { computed, effect, Service, signal } from '@angular/core';
import { UserInterface } from '../../interfaces/user.interface';

export const AUTH_STORAGE_KEY = 'eurder-user';

/**
 * Frontend-only "login": the backend has no authentication, so logging in means
 * choosing which existing customer you are. Orders are then placed with that customer's id.
 * The customer is kept in localStorage so a page refresh doesn't log you out.
 */
@Service()
export class AuthService {
  private readonly _user = signal<UserInterface | null>(this.restore());

  /** The logged-in customer, or null */
  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => this._user() !== null);

  constructor() {
    effect(() => {
      const user = this._user();
      try {
        if (user) {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
        } else {
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      } catch {
        // storage unavailable (private mode): the login still works for this visit
      }
    });
  }

  login(user: UserInterface) {
    this._user.set(user);
  }

  logout() {
    this._user.set(null);
  }

  private restore(): UserInterface | null {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!saved) {
        return null;
      }
      const user = JSON.parse(saved) as UserInterface;
      return user?.id ? user : null;
    } catch {
      return null;
    }
  }
}

import { TestBed } from '@angular/core/testing';
import { AUTH_STORAGE_KEY, AuthService } from './auth.service';
import { makeUser } from '../../../../testing/fixtures';

describe('AuthService', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('starts logged out', () => {
    const service = TestBed.inject(AuthService);
    expect(service.user()).toBeNull();
    expect(service.isLoggedIn()).toBe(false);
  });

  it('login sets the user and saves it', () => {
    const service = TestBed.inject(AuthService);
    service.login(makeUser());
    TestBed.tick();
    expect(service.user()?.id).toBe('user-1');
    expect(service.isLoggedIn()).toBe(true);
    expect(JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY)!).id).toBe('user-1');
  });

  it('logout clears the user and the storage', () => {
    const service = TestBed.inject(AuthService);
    service.login(makeUser());
    TestBed.tick();
    service.logout();
    TestBed.tick();
    expect(service.user()).toBeNull();
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
  });

  it('restores the user after a refresh', () => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(makeUser({ id: 'saved' })));
    expect(TestBed.inject(AuthService).user()?.id).toBe('saved');
  });

  it.each(['not json', '{}', 'null'])('ignores invalid saved data %s', (saved) => {
    localStorage.setItem(AUTH_STORAGE_KEY, saved);
    expect(TestBed.inject(AuthService).user()).toBeNull();
  });
});

import { Component, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { UserService } from '../../core/services/user/user.service';
import { AuthService } from '../../core/services/auth/auth.service';

/** Only allow navigating back inside the app (no "//evil.com" or absolute urls) */
function safeReturnUrl(url: string | undefined): string {
  return url && url.startsWith('/') && !url.startsWith('//') ? url : '/';
}

@Component({
  imports: [RouterLink],
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly _userService = inject(UserService);
  private readonly _router = inject(Router);
  protected readonly authService = inject(AuthService);

  /** ?returnUrl=/basket — where to go after logging in (bound by withComponentInputBinding) */
  readonly returnUrl = input<string>();

  protected readonly loadError = signal(false);
  protected readonly customers = toSignal(
    this._userService.getAllUsers().pipe(
      catchError(() => {
        this.loadError.set(true);
        return of([]);
      }),
    ),
  );

  protected readonly selectedId = signal('');
  protected readonly isLoading = signal(false);
  protected readonly error = signal('');

  protected onSelect(event: Event) {
    this.selectedId.set((event.target as HTMLSelectElement).value);
    this.error.set('');
  }

  protected onSubmit(event: Event) {
    event.preventDefault();
    const id = this.selectedId();
    if (!id) {
      this.error.set('Please choose a customer.');
      return;
    }

    // The overview may only contain names, so fetch the full customer before logging in
    this.isLoading.set(true);
    this._userService.getOneUser(id).subscribe({
      next: (user) => {
        this.isLoading.set(false);
        this.authService.login(user);
        this._router.navigateByUrl(safeReturnUrl(this.returnUrl()));
      },
      error: () => {
        this.isLoading.set(false);
        this.error.set('Could not log in, please try again.');
      },
    });
  }

  protected logout() {
    this.authService.logout();
  }
}

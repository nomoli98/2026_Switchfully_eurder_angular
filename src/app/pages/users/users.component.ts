import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { UserService } from '../../core/services/user/user.service';
import { UsersTableComponent } from './users-table/users-table.component';

@Component({
  imports: [UsersTableComponent],
  selector: 'app-users',
  templateUrl: './users.component.html',
})
export class UsersComponent {
  private readonly _userService = inject(UserService);

  private readonly _users = toSignal(this._userService.getAllUsers(), {
    initialValue: [],
  });

  protected readonly _search = signal('');

  protected readonly _filteredUsers = computed(() => {
    const term = this._search().trim().toLowerCase();
    return term
      ? this._users().filter((u) => u.lastname.toLowerCase().includes(term))
      : this._users();
  });
}

import { Component, input } from '@angular/core';
import { UserInterface } from '../../../core/interfaces/user.interface';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-users-table',
  templateUrl: './users-table.component.html',
})
export class UsersTableComponent {
  _users = input.required<UserInterface[]>();
}

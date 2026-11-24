import { Component, inject } from '@angular/core';
import { FormUserComponent } from '../../forms/form-user/form-user.component';
import { UserReq } from '../../../core/dtos/requests/user-request.dto';
import { UserService } from '../../../core/services/user/user.service';

@Component({
  imports: [FormUserComponent],
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
})
export class CreateUserComponent {
  private readonly _userService = inject(UserService);

  create = (u: UserReq) => this._userService.createUser(u);
}

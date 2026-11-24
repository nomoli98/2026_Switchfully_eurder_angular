import { Component, inject, input } from '@angular/core';
import { FormUserComponent } from '../../forms/form-user/form-user.component';
import { UserService } from '../../../core/services/user.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { UserReq } from '../../../core/dtos/requests/user-request.dto';

@Component({
  imports: [FormUserComponent],
  selector: 'app-update-user',
  templateUrl: './update-user.component.html',
})
export class UpdateUserComponent {
  private readonly _userService = inject(UserService);
  readonly id = input.required<string>();

  protected readonly _user = toSignal(
    toObservable(this.id).pipe(switchMap((id) => this._userService.getOneUser(id))),
  );

  update = (u: UserReq) => this._userService.updateUser(this._user()!.id, u);
}

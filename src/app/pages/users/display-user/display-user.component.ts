import { Component, inject, input } from '@angular/core';
import { FormUserComponent } from '../../forms/form-user/form-user.component';
import { UserService } from '../../../core/services/user.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';

@Component({
  imports: [FormUserComponent],
  selector: 'app-display-user',
  templateUrl: './display-user.component.html',
})
export class DisplayUserComponent {
  private readonly _userService = inject(UserService);
  readonly id = input.required<string>();

  protected readonly _user = toSignal(
    toObservable(this.id).pipe(switchMap((id) => this._userService.getOneUser(id))),
  );

}

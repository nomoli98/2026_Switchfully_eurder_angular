import { Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { disabled, email, form, FormField, pattern, required } from '@angular/forms/signals';
import { Observable } from 'rxjs';
import { Router, RouterLink } from '@angular/router';
import { UserReq } from '../../../core/dtos/requests/user-request.dto';
import { UserInterface } from '../../../core/interfaces/user.interface';

@Component({
  imports: [FormField, RouterLink],
  selector: 'app-form-user',
  templateUrl: './form-user.component.html',
})
export class FormUserComponent {
  editable = input.required<boolean>();
  method = input<(user: UserReq) => Observable<UserInterface>>();

  private readonly router = inject(Router);
  methodName = input<'update' | 'create'>();
  user = input<UserInterface>();

  private readonly initial: UserReq = {
    firstname: '',
    lastname: '',
    email: { localPart: '', domain: '', complete: '' },
    address: { streetName: '', houseNumber: '', postalCode: '', country: '' },
    phoneNumber: { number: '', countryCallingCode: '' },
  };

  model = linkedSignal<UserReq>(() => {
    const user = this.user();
    return user ? this.toUserReq(user) : structuredClone(this.initial);
  });

  isLoading = signal(false);
  title = computed(() => `${this.methodName() ?? ''} user ${this.user()?.id ?? ''}`);

  form = form(this.model, (u) => {
    disabled(u, () => !this.editable());

    required(u.firstname, { message: 'Please enter a first name.' });
    required(u.lastname, { message: 'Please enter a last name.' });

    required(u.email.complete, { message: 'Please enter an email address.' });
    email(u.email.complete, { message: 'Please enter a valid email address.' });

    required(u.phoneNumber.countryCallingCode, { message: 'Required.' });
    pattern(u.phoneNumber.countryCallingCode, /^\+?\d{1,4}$/, {
      message: 'Invalid code (e.g. +32).',
    });
    required(u.phoneNumber.number, { message: 'Please enter a phone number.' });
    pattern(u.phoneNumber.number, /^[\d\s\/.-]{6,20}$/, {
      message: 'Please enter a valid phone number.',
    });

    required(u.address.streetName, { message: 'Please enter a street name.' });
    required(u.address.houseNumber, { message: 'Please enter a house number.' });
    required(u.address.postalCode, { message: 'Please enter a postal code.' });
    required(u.address.country, { message: 'Please enter a country.' });
  });

  onSubmit(event: Event) {
    event.preventDefault();

    const saveUser = this.method();
    if (!saveUser || this.form().invalid()) {
      return;
    }

    this.isLoading.set(true);
    saveUser(this.toPayload(this.model())).subscribe({
      next: (saved) => {
        this.isLoading.set(false);
        this.resetErrors();
        const id = saved?.id ?? this.user()?.id;
        this.router.navigate(id ? ['/customers', id] : ['/customers']);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  protected cancel() {
    this.resetErrors();
    const id = this.user()?.id;
    this.router.navigate(this.methodName() === 'update' && id ? ['/customers', id] : ['/customers']);
  }

  protected resetErrors() {
    this.model.set(structuredClone(this.initial));
    this.form().reset();
  }

  private toPayload(value: UserReq): UserReq {
    const complete = value.email.complete.trim();
    const at = complete.lastIndexOf('@');
    return {
      ...value,
      email: {
        complete,
        localPart: at > -1 ? complete.slice(0, at) : complete,
        domain: at > -1 ? complete.slice(at + 1) : '',
      },
    };
  }

  private toUserReq(user: UserInterface): UserReq {
    return {
      firstname: user.firstname,
      lastname: user.lastname,
      email: { ...user.email },
      address: { ...user.address },
      phoneNumber: { ...user.phoneNumber },
    };
  }
}

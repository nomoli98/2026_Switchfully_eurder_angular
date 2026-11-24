import { AddressInterface } from './address.interface';
import { EmailInterface } from './email.interface';
import { PhoneInterface } from './phone.interface';

export interface UserInterface {
  address: AddressInterface;
  email: EmailInterface;
  firstname: string;
  id: string;
  lastname: string;
  phoneNumber: PhoneInterface;
}

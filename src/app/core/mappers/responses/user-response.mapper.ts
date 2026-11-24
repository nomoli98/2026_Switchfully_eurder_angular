import { PhoneInterface } from '../../interfaces/phone.interface';
import { EmailInterface } from '../../interfaces/email.interface';
import { AddressInterface } from '../../interfaces/address.interface';
import { UserRes } from '../../dtos/responses/user-response.dto';
import { UserInterface } from '../../interfaces/user.interface';

export function UserRestoEntity(APIres: UserRes): UserInterface {
  const address: AddressInterface = {
    country: APIres.address?.country ?? '',
    houseNumber: APIres.address?.houseNumber ?? '',
    postalCode: APIres.address?.postalCode ?? '',
    streetName: APIres.address?.streetName ?? '',
  };

  const email: EmailInterface = {
    complete: APIres.email?.complete ?? '',
    domain: APIres.email?.domain ?? '',
    localPart: APIres.email?.localPart ?? '',
  };

  const phone: PhoneInterface = {
    countryCallingCode: APIres.phoneNumber?.countryCallingCode ?? '',
    number: APIres.phoneNumber?.number ?? '',
  };

  return {
    id: APIres.id,
    firstname: APIres.firstname ?? '',
    lastname: APIres.lastname ?? '',
    address,
    email,
    phoneNumber: phone,
  };
}

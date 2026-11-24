import { UserRestoEntity } from './user-response.mapper';
import { UserRes } from '../../dtos/responses/user-response.dto';
import { makeUserRes } from '../../../../testing/fixtures';

describe('UserRestoEntity', () => {
  it('maps a complete API response to a user entity', () => {
    const res = makeUserRes();

    expect(UserRestoEntity(res)).toEqual({
      id: 'user-1',
      firstname: 'Jane',
      lastname: 'Doe',
      email: { complete: 'jane@doe.com', localPart: 'jane', domain: 'doe.com' },
      address: { streetName: 'Main street', houseNumber: '12B', postalCode: '1000', country: 'Belgium' },
      phoneNumber: { countryCallingCode: '+32', number: '470 12 34 56' },
    });
  });

  it('falls back to empty strings when nested objects are missing', () => {
    const partial = { id: 'u2', firstname: 'Bob', lastname: 'Smith' } as unknown as UserRes;

    const user = UserRestoEntity(partial);

    expect(user.address).toEqual({ streetName: '', houseNumber: '', postalCode: '', country: '' });
    expect(user.email).toEqual({ complete: '', localPart: '', domain: '' });
    expect(user.phoneNumber).toEqual({ countryCallingCode: '', number: '' });
  });

  it('falls back to empty strings for missing names and nested fields', () => {
    const partial = {
      id: 'u3',
      address: { country: 'BE' },
      email: { complete: 'a@b.c' },
      phoneNumber: {},
    } as unknown as UserRes;

    const user = UserRestoEntity(partial);

    expect(user.firstname).toBe('');
    expect(user.lastname).toBe('');
    expect(user.address.country).toBe('BE');
    expect(user.address.streetName).toBe('');
    expect(user.email.complete).toBe('a@b.c');
    expect(user.email.domain).toBe('');
    expect(user.phoneNumber.number).toBe('');
  });

  it('returns new nested objects rather than sharing references with the response', () => {
    const res = makeUserRes();
    const user = UserRestoEntity(res);

    expect(user.address).not.toBe(res.address);
    expect(user.email).not.toBe(res.email);
    expect(user.phoneNumber).not.toBe(res.phoneNumber);
  });
});

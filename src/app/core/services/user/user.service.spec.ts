import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UserService } from './user.service';
import { makeUser, makeUserRes } from '../../../../testing/fixtures';
import { UserReq } from '../../dtos/requests/user-request.dto';

const URL = 'http://localhost:9001/customers';

const req: UserReq = {
  firstname: 'Ada',
  lastname: 'Lovelace',
  email: { localPart: 'ada', domain: 'example.com', complete: 'ada@example.com' },
  address: { streetName: 'Main street', houseNumber: '1', postalCode: '1000', country: 'Belgium' },
  phoneNumber: { number: '470123456', countryCallingCode: '+32' },
};

describe('UserService', () => {
  let service: UserService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UserService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('getAllUsers GETs /customers and maps them', () => {
    let result: unknown;
    service.getAllUsers().subscribe((r) => (result = r));
    const r = http.expectOne(URL);
    expect(r.request.method).toBe('GET');
    r.flush([makeUserRes({ id: 'a' }), makeUserRes({ id: 'b' })]);
    expect(result).toEqual([makeUser({ id: 'a' }), makeUser({ id: 'b' })]);
  });

  it('getOneUser GETs /customers/:id', () => {
    let result: unknown;
    service.getOneUser('u1').subscribe((r) => (result = r));
    const r = http.expectOne(`${URL}/u1`);
    expect(r.request.method).toBe('GET');
    r.flush(makeUserRes({ id: 'u1' }));
    expect(result).toEqual(makeUser({ id: 'u1' }));
  });

  it('createUser POSTs the request body unchanged', () => {
    let result: unknown;
    service.createUser(req).subscribe((r) => (result = r));
    const r = http.expectOne(URL);
    expect(r.request.method).toBe('POST');
    expect(r.request.body).toEqual(req);
    r.flush(makeUserRes({ id: 'new' }));
    expect(result).toEqual(makeUser({ id: 'new' }));
  });

  it('updateUser PUTs to /customers/:id', () => {
    service.updateUser('u9', req).subscribe();
    const r = http.expectOne(`${URL}/u9`);
    expect(r.request.method).toBe('PUT');
    expect(r.request.body).toEqual(req);
    r.flush(makeUserRes({ id: 'u9' }));
  });
});

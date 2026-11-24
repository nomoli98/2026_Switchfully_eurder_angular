import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { UserService } from './user.service';
import { API_URL, makeUser, makeUserReq, makeUserRes } from '../../../testing/fixtures';

describe('UserService', () => {
  let service: UserService;
  let http: HttpTestingController;
  const url = `${API_URL}/customers`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UserService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('getAllUsers GETs /customers and maps every user', () => {
    let result: unknown;
    service.getAllUsers().subscribe((r) => (result = r));

    const req = http.expectOne(url);
    expect(req.request.method).toBe('GET');
    req.flush([makeUserRes({ id: 'a' }), makeUserRes({ id: 'b', lastname: 'Smith' })]);

    expect(result).toEqual([makeUser({ id: 'a' }), makeUser({ id: 'b', lastname: 'Smith' })]);
  });

  it('getOneUser GETs /customers/:id', () => {
    let result: unknown;
    service.getOneUser('a').subscribe((r) => (result = r));

    const req = http.expectOne(`${url}/a`);
    expect(req.request.method).toBe('GET');
    req.flush(makeUserRes({ id: 'a' }));

    expect(result).toEqual(makeUser({ id: 'a' }));
  });

  it('getOneUser fills in missing nested data with empty strings', () => {
    let result: any;
    service.getOneUser('a').subscribe((r) => (result = r));
    http.expectOne(`${url}/a`).flush({ id: 'a', firstname: 'X', lastname: 'Y' });
    expect(result.address.country).toBe('');
    expect(result.email.complete).toBe('');
  });

  it('createUser POSTs the request body as-is', () => {
    const body = makeUserReq();
    let result: unknown;
    service.createUser(body).subscribe((r) => (result = r));

    const req = http.expectOne(url);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush(makeUserRes({ id: 'new' }));

    expect(result).toEqual(makeUser({ id: 'new' }));
  });

  it('updateUser PUTs to /customers/:id', () => {
    const body = makeUserReq({ firstname: 'Janet' });
    let result: unknown;
    service.updateUser('a', body).subscribe((r) => (result = r));

    const req = http.expectOne(`${url}/a`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(body);
    req.flush(makeUserRes({ id: 'a', firstname: 'Janet' }));

    expect(result).toEqual(makeUser({ id: 'a', firstname: 'Janet' }));
  });

  it('propagates HTTP errors', () => {
    let status = 0;
    service.createUser(makeUserReq()).subscribe({ error: (e) => (status = e.status) });
    http.expectOne(url).flush({}, { status: 500, statusText: 'Server Error' });
    expect(status).toBe(500);
  });
});

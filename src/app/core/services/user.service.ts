import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserReq } from '../dtos/requests/user-request.dto';
import { UserRes } from '../dtos/responses/user-response.dto';
import { map, Observable } from 'rxjs';
import { UserRestoEntity } from '../mappers/responses/user-response.mapper';
import { ItemInterface } from '../interfaces/item.interface';
import { UserInterface } from '../interfaces/user.interface';
import { ItemAPIRes } from '../dtos/responses/item-response.dto';
import { ItemRestoEntity } from '../mappers/responses/item-response.mapper';

@Service()
export class UserService {
  private readonly _http = inject(HttpClient);
  private readonly _url = 'http://localhost:9001/customers';

  createUser(user: UserReq) {
    return this._http.post<UserRes>(this._url, user).pipe(map(UserRestoEntity));
  }

  updateUser(id: string, user: UserReq): Observable<UserInterface> {
    return this._http.put<UserRes>(`${this._url}/${id}`, user).pipe(map(UserRestoEntity));
  }

  getAllUsers() {
    return this._http.get<UserRes[]>(this._url).pipe(map((users) => users.map(UserRestoEntity)));
  }

  getOneItem(id: string) {
    return this._http.get<UserRes>(`${this._url}/${id}`).pipe(map(UserRestoEntity));
  }
}

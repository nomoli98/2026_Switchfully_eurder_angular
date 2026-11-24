import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ItemInterface } from '../../interfaces/item.interface';
import { ItemRestoEntity } from '../../mappers/responses/item-response.mapper';
import { toItemReq } from '../../mappers/requests/item-request.mapper';
import { ItemAPIRes } from '../../dtos/responses/item-response.dto';

@Service()
export class ItemService {
  private readonly _http = inject(HttpClient);
  private readonly _url = 'http://localhost:9001/items';

  createItem(item: ItemInterface): Observable<ItemInterface> {
    return this._http.post<ItemAPIRes>(this._url, toItemReq(item)).pipe(map(ItemRestoEntity));
  }

  updateItem(id: string, item: ItemInterface): Observable<ItemInterface> {
    return this._http.put<ItemAPIRes>(`${this._url}/${id}`, toItemReq(item)).pipe(map(ItemRestoEntity));
  }

  getAllItems() {
    return this._http.get<ItemAPIRes[]>(this._url).pipe(map((items) => items.map(ItemRestoEntity)));
  }

  getOneItem(id: string) {
    return this._http.get<ItemAPIRes>(`${this._url}/${id}`).pipe(map(ItemRestoEntity));
  }
}

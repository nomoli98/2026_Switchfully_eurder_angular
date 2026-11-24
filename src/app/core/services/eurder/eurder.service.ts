import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EurderRequestDto } from '../../dtos/requests/eurder-request.dto';
import { EurderInterface } from '../../interfaces/eurder.interface';
import { EurderResponseDto } from '../../dtos/responses/eurder-response.dto';
import { EurderResToEntity } from '../../mappers/responses/eurder-response.mapper';
import { map, Observable } from 'rxjs';

@Service()
export class EurderService {
  private readonly _http = inject(HttpClient);
  private readonly _url = 'http://localhost:9001/orders';

  createEurder(request: EurderRequestDto): Observable<EurderInterface> {
    return this._http.post<EurderResponseDto>(this._url, request).pipe(map(EurderResToEntity));
  }

  getAllEurders() {
    return this._http
      .get<EurderResponseDto[]>(this._url)
      .pipe(map((e) => e.map(EurderResToEntity)));
  }

  getAllEurderForOneCustomer(customerId : string) {
    return this._http
      .get<EurderResponseDto[]>(`${this._url}/customers/${customerId}`)
      .pipe(map((e) => e.map(EurderResToEntity)));
  }
}

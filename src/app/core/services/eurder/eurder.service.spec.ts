import { TestBed } from '@angular/core/testing';
import { EurderService } from './eurder.service';

describe('EurderService', () => {
  let service: EurderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EurderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

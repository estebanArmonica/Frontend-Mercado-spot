import { TestBed } from '@angular/core/testing';

import { EtlService } from './etl-service';

describe('EtlService', () => {
  let service: EtlService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EtlService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

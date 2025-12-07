import { TestBed } from '@angular/core/testing';

import { PicpayService } from './picpay.service';

describe('PicpayService', () => {
  let service: PicpayService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PicpayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

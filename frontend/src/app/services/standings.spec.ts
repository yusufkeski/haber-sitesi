import { TestBed } from '@angular/core/testing';

import { Standings } from './standings';

describe('Standings', () => {
  let service: Standings;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Standings);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

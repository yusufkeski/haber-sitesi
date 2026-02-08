import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColumnPostDetail } from './column-post-detail';

describe('ColumnPostDetail', () => {
  let component: ColumnPostDetail;
  let fixture: ComponentFixture<ColumnPostDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColumnPostDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ColumnPostDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

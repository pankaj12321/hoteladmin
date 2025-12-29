import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Pcustomer } from './pcustomer';

describe('Pcustomer', () => {
  let component: Pcustomer;
  let fixture: ComponentFixture<Pcustomer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pcustomer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Pcustomer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

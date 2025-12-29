import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllDriver } from './all-driver';

describe('AllDriver', () => {
  let component: AllDriver;
  let fixture: ComponentFixture<AllDriver>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllDriver]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllDriver);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

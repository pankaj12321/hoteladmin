import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Expensis } from './expensis';

describe('Expensis', () => {
  let component: Expensis;
  let fixture: ComponentFixture<Expensis>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Expensis]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Expensis);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

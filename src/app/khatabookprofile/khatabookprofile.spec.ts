import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Khatabookprofile } from './khatabookprofile';

describe('Khatabookprofile', () => {
  let component: Khatabookprofile;
  let fixture: ComponentFixture<Khatabookprofile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Khatabookprofile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Khatabookprofile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

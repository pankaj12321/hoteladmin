import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Allattendance } from './allattendance';

describe('Allattendance', () => {
  let component: Allattendance;
  let fixture: ComponentFixture<Allattendance>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Allattendance]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Allattendance);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

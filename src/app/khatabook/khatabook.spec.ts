import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Khatabook } from './khatabook';

describe('Khatabook', () => {
  let component: Khatabook;
  let fixture: ComponentFixture<Khatabook>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Khatabook]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Khatabook);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

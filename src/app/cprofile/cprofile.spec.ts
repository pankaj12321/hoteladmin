import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cprofile } from './cprofile';

describe('Cprofile', () => {
  let component: Cprofile;
  let fixture: ComponentFixture<Cprofile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cprofile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Cprofile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Pcprofile } from './pcprofile';

describe('Pcprofile', () => {
  let component: Pcprofile;
  let fixture: ComponentFixture<Pcprofile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pcprofile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Pcprofile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

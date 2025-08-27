import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AngularHaversineGeolocation } from './angular-haversine-geolocation';

describe('AngularHaversineGeolocation', () => {
  let component: AngularHaversineGeolocation;
  let fixture: ComponentFixture<AngularHaversineGeolocation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AngularHaversineGeolocation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AngularHaversineGeolocation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

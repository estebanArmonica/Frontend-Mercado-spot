import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EtlProcessComponent } from './etl-process.component';

describe('EtlProcessComponent', () => {
  let component: EtlProcessComponent;
  let fixture: ComponentFixture<EtlProcessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EtlProcessComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EtlProcessComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

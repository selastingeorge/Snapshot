import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScanRegionPresetsComponent } from './scan-region-presets.component';

describe('ScanRegionPresetsComponent', () => {
  let component: ScanRegionPresetsComponent;
  let fixture: ComponentFixture<ScanRegionPresetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScanRegionPresetsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ScanRegionPresetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

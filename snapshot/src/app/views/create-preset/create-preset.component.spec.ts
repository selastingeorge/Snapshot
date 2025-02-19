import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePresetComponent } from './create-preset.component';

describe('CreatePresetComponent', () => {
  let component: CreatePresetComponent;
  let fixture: ComponentFixture<CreatePresetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatePresetComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreatePresetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

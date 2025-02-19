import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Phase2HomeComponent } from './phase2-home.component';

describe('Phase2HomeComponent', () => {
  let component: Phase2HomeComponent;
  let fixture: ComponentFixture<Phase2HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Phase2HomeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Phase2HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BatchweightComponent } from './batchweight.component';

describe('BatchweightComponent', () => {
  let component: BatchweightComponent;
  let fixture: ComponentFixture<BatchweightComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BatchweightComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BatchweightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

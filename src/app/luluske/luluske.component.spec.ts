import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LuluskeComponent } from './luluske.component';

describe('LuluskeComponent', () => {
  let component: LuluskeComponent;
  let fixture: ComponentFixture<LuluskeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LuluskeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LuluskeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

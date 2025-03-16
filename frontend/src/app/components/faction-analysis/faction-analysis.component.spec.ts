import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FactionAnalysisComponent } from './faction-analysis.component';

describe('FactionAnalysisComponent', () => {
  let component: FactionAnalysisComponent;
  let fixture: ComponentFixture<FactionAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FactionAnalysisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FactionAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewemployeeDetailsPage } from './view-employee-details.page';

describe('ViewemployeeDetailsPage', () => {
  let component: ViewemployeeDetailsPage;
  let fixture: ComponentFixture<ViewemployeeDetailsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewemployeeDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

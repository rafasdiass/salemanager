import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardemployeePage } from './dashboard-employee.page';

describe('DashboardemployeePage', () => {
  let component: DashboardemployeePage;
  let fixture: ComponentFixture<DashboardemployeePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardemployeePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

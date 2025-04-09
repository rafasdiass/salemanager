import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardclientPage } from './dashboard-client.page';

describe('DashboardclientPage', () => {
  let component: DashboardclientPage;
  let fixture: ComponentFixture<DashboardclientPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardclientPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

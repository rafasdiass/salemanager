import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminAppointmentsListPage } from './admin-appointments-list.page';

describe('AdminAppointmentsListPage', () => {
  let component: AdminAppointmentsListPage;
  let fixture: ComponentFixture<AdminAppointmentsListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminAppointmentsListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

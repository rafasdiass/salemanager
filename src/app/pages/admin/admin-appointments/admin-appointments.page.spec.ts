import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminAppointmentsPage } from './admin-appointments.page';

describe('AdminAppointmentsPage', () => {
  let component: AdminAppointmentsPage;
  let fixture: ComponentFixture<AdminAppointmentsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminAppointmentsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

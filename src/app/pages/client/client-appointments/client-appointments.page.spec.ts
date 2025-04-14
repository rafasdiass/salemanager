import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClientAppointmentsPage } from './client-appointments.page';

describe('ClientAppointmentsPage', () => {
  let component: ClientAppointmentsPage;
  let fixture: ComponentFixture<ClientAppointmentsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientAppointmentsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

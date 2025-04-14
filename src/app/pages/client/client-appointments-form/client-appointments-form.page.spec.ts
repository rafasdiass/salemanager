import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClientAppointmentsFormPage } from './client-appointments-form.page';

describe('ClientAppointmentsFormPage', () => {
  let component: ClientAppointmentsFormPage;
  let fixture: ComponentFixture<ClientAppointmentsFormPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientAppointmentsFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

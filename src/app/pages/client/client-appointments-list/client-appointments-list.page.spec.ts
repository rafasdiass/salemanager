import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClientAppointmentsListPage } from './client-appointments-list.page';

describe('ClientAppointmentsListPage', () => {
  let component: ClientAppointmentsListPage;
  let fixture: ComponentFixture<ClientAppointmentsListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientAppointmentsListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

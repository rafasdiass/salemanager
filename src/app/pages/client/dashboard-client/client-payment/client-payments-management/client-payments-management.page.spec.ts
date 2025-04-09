import { ComponentFixture, TestBed } from '@angular/core/testing';
import { clientPaymentsManagementPage } from './client-payments-management.page';

describe('clientPaymentsManagementPage', () => {
  let component: clientPaymentsManagementPage;
  let fixture: ComponentFixture<clientPaymentsManagementPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(clientPaymentsManagementPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

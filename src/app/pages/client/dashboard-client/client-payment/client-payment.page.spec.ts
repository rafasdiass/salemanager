import { ComponentFixture, TestBed } from '@angular/core/testing';
import { clientPaymentPage } from './client-payment.page';

describe('clientPaymentPage', () => {
  let component: clientPaymentPage;
  let fixture: ComponentFixture<clientPaymentPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(clientPaymentPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

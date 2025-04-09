import { ComponentFixture, TestBed } from '@angular/core/testing';
import { clientPaymentsHistoryPage } from './client-payments-history.page';

describe('clientPaymentsHistoryPage', () => {
  let component: clientPaymentsHistoryPage;
  let fixture: ComponentFixture<clientPaymentsHistoryPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(clientPaymentsHistoryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

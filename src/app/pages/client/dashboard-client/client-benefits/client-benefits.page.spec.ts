import { ComponentFixture, TestBed } from '@angular/core/testing';
import { clientBenefitsPage } from './client-benefits.page';

describe('clientBenefitsPage', () => {
  let component: clientBenefitsPage;
  let fixture: ComponentFixture<clientBenefitsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(clientBenefitsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VendaFormPage } from './venda-form.page';

describe('VendaFormPage', () => {
  let component: VendaFormPage;
  let fixture: ComponentFixture<VendaFormPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VendaFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

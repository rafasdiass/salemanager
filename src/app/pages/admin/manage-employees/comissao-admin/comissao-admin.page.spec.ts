import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComissaoAdminPage } from './comissao-admin.page';

describe('ComissaoAdminPage', () => {
  let component: ComissaoAdminPage;
  let fixture: ComponentFixture<ComissaoAdminPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ComissaoAdminPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

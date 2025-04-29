import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProdutoFormPage } from './produto-form.page';

describe('ProdutoFormPage', () => {
  let component: ProdutoFormPage;
  let fixture: ComponentFixture<ProdutoFormPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ProdutoFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

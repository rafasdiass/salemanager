import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PreencherFichaAdesaoPage } from './preencher-ficha-adesao.page';

describe('PreencherFichaAdesaoPage', () => {
  let component: PreencherFichaAdesaoPage;
  let fixture: ComponentFixture<PreencherFichaAdesaoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PreencherFichaAdesaoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

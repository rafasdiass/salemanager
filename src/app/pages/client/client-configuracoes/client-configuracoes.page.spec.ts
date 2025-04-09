import { ComponentFixture, TestBed } from '@angular/core/testing';
import { clientConfiguracoesPage } from './client-configuracoes.page';

describe('clientConfiguracoesPage', () => {
  let component: clientConfiguracoesPage;
  let fixture: ComponentFixture<clientConfiguracoesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(clientConfiguracoesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

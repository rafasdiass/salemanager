import { ComponentFixture, TestBed } from '@angular/core/testing';
import { clientMensagensPage } from './client-mensagens.page';

describe('clientMensagensPage', () => {
  let component: clientMensagensPage;
  let fixture: ComponentFixture<clientMensagensPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(clientMensagensPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

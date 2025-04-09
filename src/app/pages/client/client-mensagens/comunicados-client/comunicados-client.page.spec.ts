import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComunicadosclientPage } from './comunicados-client.page';

describe('ComunicadosclientPage', () => {
  let component: ComunicadosclientPage;
  let fixture: ComponentFixture<ComunicadosclientPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ComunicadosclientPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { clientPersonalInfoPage } from './client-personal-info.page';

describe('clientPersonalInfoPage', () => {
  let component: clientPersonalInfoPage;
  let fixture: ComponentFixture<clientPersonalInfoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(clientPersonalInfoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

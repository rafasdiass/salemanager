import { ComponentFixture, TestBed } from '@angular/core/testing';
import { clientPreferencesPage } from './client-preferences.page';

describe('clientPreferencesPage', () => {
  let component: clientPreferencesPage;
  let fixture: ComponentFixture<clientPreferencesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(clientPreferencesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

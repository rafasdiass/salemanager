import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginSelectorPage } from './login-selector.page';

describe('LoginSelectorPage', () => {
  let component: LoginSelectorPage;
  let fixture: ComponentFixture<LoginSelectorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginSelectorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

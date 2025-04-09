import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavbarclientPage } from './navbar-client.page';

describe('NavbarclientPage', () => {
  let component: NavbarclientPage;
  let fixture: ComponentFixture<NavbarclientPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NavbarclientPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

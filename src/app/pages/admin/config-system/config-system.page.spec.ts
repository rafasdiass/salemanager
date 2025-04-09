import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfigSystemPage } from './config-system.page';

describe('ConfigSystemPage', () => {
  let component: ConfigSystemPage;
  let fixture: ComponentFixture<ConfigSystemPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigSystemPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

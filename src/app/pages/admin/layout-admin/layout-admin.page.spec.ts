import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LayoutAdminPage } from './layout-admin.page';

describe('LayoutAdminPage', () => {
  let component: LayoutAdminPage;
  let fixture: ComponentFixture<LayoutAdminPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LayoutAdminPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

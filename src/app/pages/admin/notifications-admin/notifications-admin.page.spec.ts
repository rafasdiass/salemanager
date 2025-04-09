import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationsAdminPage } from './notifications-admin.page';

describe('NotificationsAdminPage', () => {
  let component: NotificationsAdminPage;
  let fixture: ComponentFixture<NotificationsAdminPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationsAdminPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

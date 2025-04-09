import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationsHistoryPage } from './notifications-history.page';

describe('NotificationsHistoryPage', () => {
  let component: NotificationsHistoryPage;
  let fixture: ComponentFixture<NotificationsHistoryPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationsHistoryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

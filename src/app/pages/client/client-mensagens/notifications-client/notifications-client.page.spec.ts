import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationsclientPage } from './notifications-client.page';

describe('NotificationsclientPage', () => {
  let component: NotificationsclientPage;
  let fixture: ComponentFixture<NotificationsclientPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationsclientPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

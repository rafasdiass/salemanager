import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationsCreateFormPage } from './notifications-create-form.page';

describe('NotificationsCreateFormPage', () => {
  let component: NotificationsCreateFormPage;
  let fixture: ComponentFixture<NotificationsCreateFormPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationsCreateFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

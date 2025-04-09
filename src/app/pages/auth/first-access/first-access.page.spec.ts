import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FirstAccessPage } from './first-access.page';

describe('FirstAccessPage', () => {
  let component: FirstAccessPage;
  let fixture: ComponentFixture<FirstAccessPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FirstAccessPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

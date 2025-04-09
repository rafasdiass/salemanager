import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApproveclientsPage } from './approve-clients.page';

describe('ApproveclientsPage', () => {
  let component: ApproveclientsPage;
  let fixture: ComponentFixture<ApproveclientsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ApproveclientsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

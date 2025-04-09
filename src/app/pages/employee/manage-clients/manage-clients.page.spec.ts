import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManageclientsPage } from './manage-clients.page';

describe('ManageclientsPage', () => {
  let component: ManageclientsPage;
  let fixture: ComponentFixture<ManageclientsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageclientsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManageemployeesPage } from './manage-employees.page';

describe('ManageemployeesPage', () => {
  let component: ManageemployeesPage;
  let fixture: ComponentFixture<ManageemployeesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageemployeesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

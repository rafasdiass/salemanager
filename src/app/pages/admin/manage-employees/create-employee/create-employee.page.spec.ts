import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateemployeePage } from './create-employee.page';

describe('CreateemployeePage', () => {
  let component: CreateemployeePage;
  let fixture: ComponentFixture<CreateemployeePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateemployeePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComissaoemployeePage } from './comissao-employee.page';

describe('ComissaoemployeePage', () => {
  let component: ComissaoemployeePage;
  let fixture: ComponentFixture<ComissaoemployeePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ComissaoemployeePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

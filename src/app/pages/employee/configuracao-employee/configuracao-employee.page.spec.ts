import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfiguracaoemployeePage } from './configuracao-employee.page';

describe('ConfiguracaoemployeePage', () => {
  let component: ConfiguracaoemployeePage;
  let fixture: ComponentFixture<ConfiguracaoemployeePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfiguracaoemployeePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SeedPage } from './seed.page';

describe('SeedPage', () => {
  let component: SeedPage;
  let fixture: ComponentFixture<SeedPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SeedPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

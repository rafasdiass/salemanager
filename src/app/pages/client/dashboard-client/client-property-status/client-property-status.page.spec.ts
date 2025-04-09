import { ComponentFixture, TestBed } from '@angular/core/testing';
import { clientPropertyStatusPage } from './client-property-status.page';

describe('clientPropertyStatusPage', () => {
  let component: clientPropertyStatusPage;
  let fixture: ComponentFixture<clientPropertyStatusPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(clientPropertyStatusPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

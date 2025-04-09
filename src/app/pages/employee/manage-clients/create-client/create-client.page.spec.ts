import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateclientPage } from './create-client.page';

describe('CreateclientPage', () => {
  let component: CreateclientPage;
  let fixture: ComponentFixture<CreateclientPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateclientPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

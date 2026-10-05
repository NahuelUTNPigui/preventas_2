import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileImageUploaderComponent } from './file-image-uploader.component';

describe('FileImageUploaderComponent', () => {
  let component: FileImageUploaderComponent;
  let fixture: ComponentFixture<FileImageUploaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FileImageUploaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileImageUploaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

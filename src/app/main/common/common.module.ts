import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomDateParserFormatter, DatePickerComponent } from './components/date-picker/date-picker.component';
import { NgbDatepickerModule, NgbModule, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { BrowserModule } from '@angular/platform-browser';
import { FileImageUploaderComponent } from './components/file-image-uploader/file-image-uploader.component';
import { ImageUploaderService } from './services/image-uploader.service';



@NgModule({
  declarations: [
    DatePickerComponent,
    FileImageUploaderComponent,
  ],
  imports: [
    CommonModule,
    NgbDatepickerModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    BrowserModule
  ],
  providers: [
    ImageUploaderService,
    { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter }
  ],
  exports: [
    DatePickerComponent,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    FileImageUploaderComponent
  ]
})
export class TplCommonModule { }

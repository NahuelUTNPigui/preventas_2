import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ImageUploaderService } from '../../services/image-uploader.service';
import { environment } from 'environments/environment';
interface HtmlInputEvent extends Event {
  target: HTMLInputElement & EventTarget;
}

@Component({
  selector: 'app-file-image-uploader',
  templateUrl: './file-image-uploader.component.html',
  styleUrls: ['./file-image-uploader.component.scss']
})
export class FileImageUploaderComponent implements OnInit {
  @Input() codMascota:number
  photoSelected: string | ArrayBuffer;
  file: File;

  constructor(private imageUploaderService: ImageUploaderService, private router: Router) { }

  ngOnInit() {
    if(this.codMascota!=0){
      this.photoSelected=environment.apiUrl+"/mascotas/"+this.codMascota+".png"
    }
  }
  async onDeletePhoto() {
    this.photoSelected = null
    await FileImageUploaderComponent.createFile('../../../assets/images/no-img.png',
     'no-img.png', 'image/png')
      .then((file) => {
        this.imageUploaderService.savePhotoAdded(file);
      });
  }

  onPhotoSelected(event: HtmlInputEvent): void {
    if (event.target.files && event.target.files[0]) {
      this.file = <File>event.target.files[0];
      // image preview
      const reader = new FileReader();
      reader.onload = e => this.photoSelected = reader.result;
      reader.readAsDataURL(this.file);
      this.imageUploaderService.savePhotoAdded(this.file);
    }
  }
  static async createFile(path: string, name: string, type: string): Promise<File> {
    let response = await fetch(path);
    let data = await response.blob();
    let metadata = {
      type: type
    };
    return new File([data], name, metadata);
  }
}

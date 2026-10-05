import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ImageModel } from '../models/images.model';
import { EndpointRoutesEnum } from '../enums';
import { UserService } from '../../../auth/service/user.service';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';

@Injectable()
export class ImageUploaderService {

  URI = `${environment.apiUrl}/api/pets/foto`;
  photoFile: File;
  token = '';
  constructor(private http: HttpClient, private userService: UserService) {
    this.token = JSON.parse(localStorage.getItem('currentUser')).token;
    this.photoFile = null;
  }

  createPhoto(petId: string, photo: File) {
    const formData = new FormData();
    //formData.append('petId', petId);
    formData.append('file', photo,petId);
    //const route = `${this.URI}${EndpointRoutesEnum.PHOTOS}${EndpointRoutesEnum.PETPHOTO}`;
    const route = `${environment.apiUrl}/api/pets/foto/${petId}`;
    
    return this.http.post<any>(route, formData, {
      headers: { 'x-access-token': this.token}
    });
  }
  uploadPhoto(petId: string, photo: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', photo);
  
      const route = `${environment.apiUrl}/api/pets/foto/${petId}`;
  
      this.http.post(route, formData, { headers: { 'x-access-token': this.token } })
        .subscribe(
          (response) => {
            resolve(response); // Resuelve la promesa cuando la foto se carga con éxito
          },
          (error) => {
            reject(error); // Rechaza la promesa en caso de error
          }
        );
    });
  }
  
  getPhotos() {
    return this.http.get<ImageModel[]>(this.URI);
  }

  getPhoto(id: string) {
    return this.http.get<ImageModel>(`${this.URI}/${id}`);
  }

  deletePhoto(id: string) {
    return this.http.delete(`${this.URI}/${id}`);
  }

  updatePhoto(id: string, title: string, description: string) {
    return this.http.put(`${this.URI}/${id}`, {title, description});
  }

  savePhotoAdded(photo: File) {
    this.photoFile = photo;
  }

  getPhotoRecientlyAdded(): File {
    return this.photoFile;
  }

  resetPhotoFile() {
    this.photoFile = null;
  }

}

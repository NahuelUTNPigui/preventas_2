import { Injectable } from '@angular/core';
import { EndpointRoutesEnum } from '../enums';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
@Injectable({
  providedIn: 'root'
})
export class EnvioMailsService {
  URI = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) { }

  recoverPasswordEmail(email: string): Observable<any> {
    const route = `${this.URI}/envioMails/recuperarContrasenia`;

    return this.http.post<any>(route, {email}, {
    });
  }
  confirmDirectionEmail(email:string, token:string): Observable<any> {
    const route = `${this.URI}/envioMails/confirmarCorreo`;
    return this.http.post<any>(route, {email,token}, {
    });
  }

  confirmTurno(email:string,fechaTurno:string,horaTurno:string):Observable<any> {
    const route = `${this.URI}/envioMails/confirmarTurno`;
    return this.http.post<any>(route, {email,fechaTurno,horaTurno}, {
    });
  }

  confirmPassUser(email:string, pass:string): Observable<any> {
    const route = `${this.URI}/envioMails/confirmarUserFromVet`;
    return this.http.post<any>(route, {email,pass}, {
    });
  }

}

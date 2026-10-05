import { Injectable } from '@angular/core';
import { EndpointRoutesEnum } from '../enums';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../../auth/service/user.service';
import { Observable } from 'rxjs';
// import { AttentionsModelData } from '../../attentions-register/model/atenttionsData';
// import { RecordatorioData } from '../../pets/model/recordatorio-model';
import { environment } from 'environments/environment';
@Injectable({
  providedIn: 'root'
})
export class HomeService {

  endpointBase = `${environment.apiUrl}/api`;
  token = '';
  codResponsable = '';
  codVet = '';
  constructor(private httpClient: HttpClient, private userService: UserService) {
    // this.token = this.userService.getCurrentUserToken();
    this.codResponsable = JSON.parse(localStorage.getItem('currentUser')).email
    this.codVet = JSON.parse(localStorage.getItem('currentUser')).cod_vet
   }


  //  getAtenttionsNotValued(): Observable<[AttentionsModelData]> {
  //   const untilDate = new Date()
  //   const untilDateString = `${untilDate.getFullYear()}-${untilDate.getMonth() + 1}-${untilDate.getDate() + 1}` 
  //   const sinceDate = new Date(untilDate.getFullYear(),untilDate.getMonth() - 2, untilDate.getDay());
  //   const sinceDateString = `${sinceDate.getFullYear()}-${sinceDate.getMonth()}-${sinceDate.getDate()}` 
  //   const route = `${this.endpointBase}/pets/atenciones/allpets?noPoints=true&&fechaDesde=${sinceDateString}&&fechaHasta=${untilDateString}`
  //   return this.httpClient.get<any>(route, {
  //     headers: { 'x-access-token': this.token }
  //   });
  //  }

  //  getNextEventsVet(): Observable<any> {
  //   const route = `${this.endpointBase}/usuarios/turnos/where?codResponsable=${this.codResponsable}`
  //   return this.httpClient.get<any>(route, {
  //     headers: { 'x-access-token': this.token }
  //   });
  //  } 

  //  getAllVets(): Observable<any> {
  //   const route = `${this.endpointBase}/vets/allcomplete`
    
  //   return this.httpClient.get<any>(route, {
  //     headers: { 'x-access-token': this.token }
  //   });
  //  }

  //  puntuarVeterinaria(codMascota: number, codAtencion: number, estrellas: number): Observable<any> {
  //   const route = `${this.endpointBase}/pets/atenciones/${codMascota}/atencion_points/${codAtencion}`;
  //   return this.httpClient.post<any>(route, {estrellas}, {
  //     headers: { 'x-access-token': this.token }
  //   });
  //  }

  //  getAllRecordatorios(): Observable<RecordatorioData[]> {
  //   const route = `${this.endpointBase}/pets/recordatorios/recordatorios/usuario`;
  //   return this.httpClient.get<any>(route, {
  //     headers: { 'x-access-token': this.token }
  //   });
  //  }

  //  getAllTurnos(): Observable<any> {
  //   const url = `${environment.apiUrl}/api/vets/turno/${this.codVet}/calendar-events`;
  //   return this.httpClient.get(url, {headers: { 'x-access-token': this.token }})
  // }
  // getAllTurnosProximos():Observable<any>{
  //   const url = `${environment.apiUrl}/api/vets/turno/${this.codVet}/calendar-events-where?codVeterinario=${this.codVet}&atendido=false&cancelado=false`;
  //   return this.httpClient.get(url, {headers: { 'x-access-token': this.token }})

  // }

}

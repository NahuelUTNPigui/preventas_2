import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { RemitoData } from 'app/main/remito/model/remito-model';

@Injectable({
  providedIn: 'root'
})
export class RemitoStateService {
  private ultimoRemitoSeleccionadoSubject: BehaviorSubject<RemitoData | null> = new BehaviorSubject<RemitoData | null>(null);
  ultimoRemitoSeleccionado$: Observable<RemitoData | null> = this.ultimoRemitoSeleccionadoSubject.asObservable();

  constructor() { }

  seleccionarUltimoRemito(remito: RemitoData): void {
    this.ultimoRemitoSeleccionadoSubject.next(remito);
  }

  obtenerUltimoRemitoSeleccionado(): Observable<RemitoData | null> {
    return this.ultimoRemitoSeleccionado$;
  }
  
}

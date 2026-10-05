import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from 'environments/environment';
import { User, Role } from 'app/auth/models';
import { ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  //public
  public currentUser: Observable<User>;

  //private
  private currentUserSubject: BehaviorSubject<User>;

  /**
   *
   * @param {HttpClient} _http
   * @param {ToastrService} _toastrService
   */
  constructor(private _http: HttpClient, private _toastrService: ToastrService) {
    this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  // getter: currentUserValue
  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  /**
   *  Confirms if user is admin
   */
  get isAdmin() {
    return this.currentUser && this.currentUserSubject.value.role === Role.Admin;
  }

  /**
   * User login
   *
   * @param identity
   * @param password
   * @returns user
   */

  login(identity: string, password: string) {
    const adminsEndpoint = `${environment.apiUrl}/api/admins/auth-with-password`;
    const usersEndpoint = `${environment.apiUrl}/api/collections/users/auth-with-password`;
  
    // Try admins/auth-with-password first
    return this._http.post<any>(adminsEndpoint, { identity, password }).pipe(
      map(user => {
        if (user && user.token) {
          user.role = 'Admin'
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }

        return user;
      }),
      catchError(adminsError => {
        // If admins/auth-with-password fails, try users/auth-with-password
        return this._http.post<any>(usersEndpoint, { identity, password }).pipe(
          map(user => {
            if (user && user.token) {
              user.role = 'User'
              localStorage.setItem('currentUser', JSON.stringify(user));
              setTimeout(() => {
                this._toastrService.success(
                  'Has ingresado a Preventas',
                  '👋 Bienvenid@, ' + user.record.username,
                  { toastClass: 'toast ngx-toastr', closeButton: true }
                );
              }, 2500);
  
              // notify
              this.currentUserSubject.next(user);
            }
  
            return user;
          })
        );
      })
    );
  }
  /**
   * User logout
   *
   */
  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
    // notify
    this.currentUserSubject.next(null);
  }

  getCurrentUserToken(): string {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    return user.token;
  }
  getCurrentUserRole(): string {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    return user.role;
  }
}

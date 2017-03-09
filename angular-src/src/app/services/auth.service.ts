import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { environment } from '../../environments/environment';
import 'rxjs/add/operator/map';
import { tokenNotExpired } from 'angular2-jwt';

@Injectable()
export class AuthService {
  private baseUrl: string;
  authToken: any;
  user: any;

  constructor(private http: Http) {
    this.baseUrl = environment.baseUrl + '/api';
    console.log(this.baseUrl);
  }

  getHeaders(): Headers{
    this.authToken = localStorage.getItem('id_token');
    let result = new Headers();
    result.append('Content-Type', 'application/json');
    result.append('Accept', 'application/json');
    if (this.authToken)
      result.append('Authorization', this.authToken);
    return result;
  }

  registerUser(user){
    const headers = this.getHeaders();
    return this.http.post(this.baseUrl + '/auth/register', user, {headers: headers})
      .map(res => res.json());
  }

  authenticateUser(user){
    const headers = this.getHeaders();
    return this.http.post(this.baseUrl + '/auth', user, {headers: headers})
      .map(res => res.json());
  }

  getProfile(){
    const headers = this.getHeaders();
    return this.http.get(this.baseUrl + '/auth/profile', {headers: headers})
      .map(res => res.json());
  }

  storeUserData(token, user){
    localStorage.setItem('id_token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.authToken = token;
    this.user = user;
  }

  loggedIn(){
    return tokenNotExpired();
  }

  logout(){
    this.authToken = null;
    this.user = null;
    localStorage.clear();
  }
}

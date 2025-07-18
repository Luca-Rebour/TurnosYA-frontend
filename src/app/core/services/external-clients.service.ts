import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateExternalClient } from '../../shared/models/create-external-client.model';

@Injectable({
  providedIn: 'root'
})
export class ExternalClientService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  createExternalClient(clientData: CreateExternalClient): Observable<any> {
    return this.http.post(`${this.apiUrl}/external-clients`, clientData);
  }
}

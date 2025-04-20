import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from 'environments/environment';
import { HttpHeaders } from '@angular/common/http';
import { activity } from 'app/models/activity.model';

@Injectable({
  providedIn: 'root'
})
export class ActivitiesService {

  apiUrl = environment.apiUrl + '/activities';
  constructor(private http: HttpClient) { }


  getActivities(): Observable<Array<activity>> {

        const headers = new HttpHeaders({
          Authorization: `Bearer ${localStorage.getItem('token')}`
        });

    return this.http.get<Array<activity>>(`${this.apiUrl}/userActivities`, { headers }).pipe(
      tap((res) => {
        console.log('Activities:', res);
      }
      )
    );

  }
}

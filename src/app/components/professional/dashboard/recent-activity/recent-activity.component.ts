import { NgClass, NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { activity } from 'app/models/activity.model';
import { ActivitiesService } from 'app/services/activities.service';

@Component({
  selector: 'app-recent-activity',
  standalone: true,
  imports: [NgClass, NgFor],
  templateUrl: './recent-activity.component.html',
  styleUrl: './recent-activity.component.css'
})
export class RecentActivityComponent {

  activities: Array<activity> = [];

  constructor(private _activitiesService: ActivitiesService) { }

  ngOnInit() {
    this._activitiesService.getActivities().subscribe(
      (res) => {
        console.log('Activities:', res);
        this.activities = res;
      }
    );
    
  }

  getIconBgColor(type: string): string {
    switch (type) {
      case 'AppointmentCreated': return 'bg-emerald-100';
      case 'AppointmentCancelled': return 'bg-rose-100';
      case 'AppointmentRescheduled': return 'bg-amber-100';
      default: return 'bg-gray-100';
    }
  }
  
  getIconColor(type: string): string {
    switch (type) {
      case 'AppointmentCreated': return 'text-emerald-600';
      case 'AppointmentCancelled': return 'text-rose-600';
      case 'AppointmentRescheduled': return 'text-amber-600';
      default: return 'text-gray-600';
    }
  }
  
  getIcon(type: string): string {
    switch (type) {
      case 'AppointmentCreated':
        return `<path d="M8 2v4"></path><path d="M16 2v4"></path><rect width="18" height="18" x="3" y="4" rx="2"></rect><path d="M3 10h18"></path>`;
      case 'AppointmentCancelled':
        return `<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>`;
      case 'AppointmentRescheduled':
        return `<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>`;
      default:
        return `<circle cx="12" cy="12" r="10"></circle>`;
    }
  }
  

}

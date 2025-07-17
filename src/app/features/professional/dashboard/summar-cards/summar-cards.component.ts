import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import {  LucideAngularModule, Calendar, Users, Clock } from 'lucide-angular';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { SummaryData } from '../../../../shared/models/summary-data.model';

@Component({
  selector: 'app-summar-cards',
  standalone: true,
  imports: [NgFor, LucideAngularModule],
  templateUrl: './summar-cards.component.html',
  styleUrl: './summar-cards.component.css'
})
export class SummarCardsComponent {
  readonly Calendar = Calendar;
  readonly Users = Users;
  readonly Clock = Clock;

  todayAppointments: number = 0;
  thisWeekAppointments: number = 0;
  activeClients: number = 0;
  pendingConfirmations: number = 0;
  summaryCards: { title: string; value: number; icon: any; iconColor: string; iconBg: string }[] = [];

  constructor(private _dashboardService: DashboardService) {}

  ngOnInit() {
    this._dashboardService.getProfessionalSummary().subscribe((data: SummaryData) => {
      this.summaryCards = [
        { title: "Today's Appointments", value: data.todayAppointments, icon: this.Calendar, iconColor: "text-blue-500", iconBg: "bg-blue-100" },
        { title: "This Week", value: data.thisWeekAppointments, icon: this.Clock, iconColor: "text-yellow-500", iconBg: "bg-yellow-100" },
        { title: "Active Clients", value: data.activeClients, icon: this.Users, iconColor: "text-green-500", iconBg: "bg-green-100" },
        { title: "Pending Confirmations", value: data.pendingConfirmations, icon: this.Clock, iconColor: "text-red-500", iconBg: "bg-red-100" }
      ];
    });
  }


}

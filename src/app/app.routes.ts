import { Routes } from '@angular/router';
import { AuthComponent } from './features/auth/auth.component';
import { DashboardComponent } from './features/professional/dashboard/dashboard.component';

export const routes: Routes = [
    {path: '', redirectTo: 'auth', pathMatch: 'full'},
    {path: 'auth', component: AuthComponent},
    {path: 'professional/dashboard', component: DashboardComponent},
];

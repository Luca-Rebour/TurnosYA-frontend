import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { DashboardComponent } from './components/professional/dashboard/dashboard.component';
import { AuthComponent } from './components/auth/auth.component';
import { LayoutComponent } from './components/professional/layout/layout.component';
import { AppointmentsResolver } from './resolvers/appointment-resolver.resolver';

export const routes: Routes = [
    { path: 'auth', component: AuthComponent },
    { path: '', redirectTo: 'professional', pathMatch: 'full' },
    {
        path: 'professional',
        component: LayoutComponent,
        children: [
            { path: '', component: DashboardComponent, resolve: { appointments: AppointmentsResolver } },
            { path: 'dashboard', component: DashboardComponent, resolve: { appointments: AppointmentsResolver }}
        ],
        canActivate: [authGuard] 
    }
];

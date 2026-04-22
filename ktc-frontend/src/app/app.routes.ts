import { Routes } from '@angular/router';

import { LoginComponent }    from './features/auth/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { AtmListComponent }  from './features/atm/atm-list.component';
import { AtmFormComponent }  from './features/atm/atm-form.component';
import { authGuard }         from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login',     component: LoginComponent },

  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: 'dashboard',      component: DashboardComponent },
      { path: 'atms',           component: AtmListComponent },
      { path: 'atms/create',    component: AtmFormComponent },
      { path: 'atms/:id/edit',  component: AtmFormComponent },
    ]
  },

  { path: '',   redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
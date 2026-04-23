import { Routes } from '@angular/router';

import { LoginComponent } from './features/auth/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { AtmListComponent } from './features/atm/atm-list.component';
import { AtmFormComponent } from './features/atm/atm-form.component';
import { GroupComponent } from './features/group/group.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },

  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },

      // Structure Administration (recommandée)
      {
        path: 'admin',
        children: [
          { path: 'atms',           component: AtmListComponent },
          { path: 'atms/create',    component: AtmFormComponent },
          { path: 'atms/:id/edit',  component: AtmFormComponent },
          // Tu ajouteras plus tard : businesses, branches, regions...
        ]
      },

      // Redirections pour compatibilité
      { path: 'atms', redirectTo: 'admin/atms', pathMatch: 'full' },
      { path: 'atms/create', redirectTo: 'admin/atms/create', pathMatch: 'full' },
      { path: 'atms/:id/edit', redirectTo: 'admin/atms/:id/edit', pathMatch: 'full' },

      { path: 'groups', component: GroupComponent },
    ]
  },

  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
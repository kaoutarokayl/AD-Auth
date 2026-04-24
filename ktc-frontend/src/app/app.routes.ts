import { Routes } from '@angular/router';

import { LoginComponent } from './features/auth/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { AdminLayoutComponent } from './features/admin/admin-layout.component';
import { AtmListComponent } from './features/atm/atm-list.component';
import { AtmFormComponent } from './features/atm/atm-form.component';
import { AtmMapComponent } from './features/atm/atm-map.component';      // ← NEW
import { GroupComponent } from './features/group/group.component';
import { authGuard } from './core/guards/auth.guard';
import { BusinessListComponent } from './features/business/business-list.component';
import { BusinessFormComponent } from './features/business/business-form.component';
import { RegionListComponent } from './features/region/region-list.component';
import { RegionFormComponent } from './features/region/region-form.component';
import { BranchFormComponent } from './features/branch/branch-form.component';
import { BranchListComponent } from './features/branch/branch-list.component';
import { GroupFormComponent } from './features/group/components/group-form.component';


export const routes: Routes = [
  { path: 'login', component: LoginComponent },

  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },

      // === ADMINISTRATION LAYOUT ===
      {
        path: 'admin',
        component: AdminLayoutComponent,
        children: [
          { path: '', redirectTo: 'atms', pathMatch: 'full' },

          // ── ATMs ──────────────────────────────────────────────────────────
          { path: 'atms',           component: AtmListComponent },
          { path: 'atms/map',       component: AtmMapComponent },   // ← NEW — must be BEFORE :id/edit
          { path: 'atms/create',    component: AtmFormComponent },
          { path: 'atms/:id/edit',  component: AtmFormComponent },

          // ── Businesses ────────────────────────────────────────────────────
          { path: 'businesses',          component: BusinessListComponent },
          { path: 'businesses/create',   component: BusinessFormComponent },
          { path: 'businesses/:id/edit', component: BusinessFormComponent },

          // ── Regions ───────────────────────────────────────────────────────
          { path: 'regions',          component: RegionListComponent },
          { path: 'regions/create',   component: RegionFormComponent },
          { path: 'regions/:id/edit', component: RegionFormComponent },

          // ── Branches ──────────────────────────────────────────────────────
          { path: 'branches',          component: BranchListComponent },
          { path: 'branches/create',   component: BranchFormComponent },
          { path: 'branches/:id/edit', component: BranchFormComponent },

          // ── Groups ────────────────────────────────────────────────────────
          { path: 'groups',          component: GroupComponent },
          { path: 'groups/create',   component: GroupFormComponent },
          { path: 'groups/:id/edit', component: GroupFormComponent }
        ]
      }
    ]
  },

  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
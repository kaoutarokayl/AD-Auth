import { Component, HostListener, inject, signal } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  private authService = inject(AuthService);
  roles = this.authService.currentUserRoles;
  user = this.authService.currentUser;
  isProfileOpen = signal(false);

  toggleProfile(event?: Event) {
    event?.stopPropagation();
    this.isProfileOpen.update((v) => !v);
  }

  closeProfile() {
    this.isProfileOpen.set(false);
  }

  @HostListener('document:click')
  onDocumentClick() {
    this.closeProfile();
  }

  logout() {
    this.authService.logout();
  }
}

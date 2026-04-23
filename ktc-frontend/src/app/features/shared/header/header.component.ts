import { Component, HostListener, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  private authService = inject(AuthService);

  roles = this.authService.currentUserRoles;
  user  = this.authService.currentUser;

  isProfileOpen = signal(false);
  isSupportOpen = signal(false);

  userInitial = computed(() => {
    const name = this.user()?.username || '?';
    return name.charAt(0).toUpperCase();
  });

  primaryRole = computed(() => {
    const r = this.roles();
    if (!r || r.length === 0) return 'Utilisateur';
    return r[0];
  });

  toggleProfile(event?: Event) {
    event?.stopPropagation();
    this.isSupportOpen.set(false); // ferme l'autre
    this.isProfileOpen.update(v => !v);
  }

  toggleSupport(event?: Event) {
    event?.stopPropagation();
    this.isProfileOpen.set(false); // ferme l'autre
    this.isSupportOpen.update(v => !v);
  }

  closeSupport() {
    this.isSupportOpen.set(false);
  }

  @HostListener('document:click')
  onDocumentClick() {
    this.isProfileOpen.set(false);
    this.isSupportOpen.set(false);
  }

  logout() {
    this.authService.logout();
  }
}
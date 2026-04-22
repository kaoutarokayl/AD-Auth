import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GroupService, Group } from '../../../core/services/group.service';
import { GroupDetailsComponent } from './group-details.component';

@Component({
  selector: 'app-group-list',
  standalone: true,
  imports: [CommonModule, RouterModule, GroupDetailsComponent],
  templateUrl: './group-list.component.html',
  styleUrls: ['./group-list.component.css']
})
export class GroupListComponent implements OnInit {
  private readonly groupService = inject(GroupService);

  groups: Group[] = [];
  loading = false;
  selectedGroupId: number | null = null;
  errorMessage = '';

  ngOnInit(): void {
    this.loadGroups();
  }

  loadGroups(): void {
    this.loading = true;
    this.errorMessage = '';

    this.groupService.getAllGroups().subscribe({
      next: (data) => {
        this.groups = data;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement des groupes';
        console.error(err);
        this.loading = false;
      }
    });
  }

  selectGroup(groupId: number): void {
    this.selectedGroupId = groupId;
  }

  deleteGroup(groupId: number, event: Event): void {
    event.stopPropagation();

    if (confirm('Êtes-vous sûr de vouloir supprimer ce groupe?')) {
      this.groupService.deleteGroup(groupId).subscribe({
        next: () => {
          this.groups = this.groups.filter(g => g.groupId !== groupId);
          if (this.selectedGroupId === groupId) {
            this.selectedGroupId = null;
          }
        },
        error: (err) => {
          console.error('Erreur lors de la suppression:', err);
          alert('Erreur lors de la suppression du groupe');
        }
      });
    }
  }
}

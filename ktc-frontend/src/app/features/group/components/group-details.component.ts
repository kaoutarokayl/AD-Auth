import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GroupService, GroupDetails, ClientAtm } from '../../../core/services/group.service';

@Component({
  selector: 'app-group-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './group-details.component.html',
  styleUrls: ['./group-details.component.css']
})
export class GroupDetailsComponent implements OnInit {
  @Input() groupId!: number;

  private readonly groupService = inject(GroupService);

  groupDetails: GroupDetails | null = null;
  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    if (this.groupId) {
      this.loadGroupDetails();
    }
  }

  loadGroupDetails(): void {
    this.loading = true;
    this.errorMessage = '';

    this.groupService.getGroupDetails(this.groupId).subscribe({
      next: (data) => {
        this.groupDetails = data;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement des détails du groupe';
        console.error(err);
        this.loading = false;
      }
    });
  }

  removeClient(clientId: number): void {
    if (confirm('Êtes-vous sûr de vouloir retirer ce client du groupe?')) {
      this.groupService.removeClientFromGroup(this.groupId, clientId).subscribe({
        next: () => {
          if (this.groupDetails?.clients) {
            this.groupDetails.clients = this.groupDetails.clients.filter(c => c.clientId !== clientId);
          }
        },
        error: (err) => {
          console.error('Erreur lors du retrait:', err);
          alert('Erreur lors du retrait du client');
        }
      });
    }
  }
}

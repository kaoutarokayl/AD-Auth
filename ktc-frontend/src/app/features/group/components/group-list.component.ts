import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GroupService, Group } from '../../../core/services/group.service';

@Component({
  selector: 'app-group-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './group-list.component.html',
  styleUrls: ['./group-list.component.css']
})
export class GroupListComponent implements OnInit {
  private readonly groupService = inject(GroupService);
  private readonly router       = inject(Router);

  // ── State ──────────────────────────────────────────────────────────────────
  groups      = signal<Group[]>([]);
  isLoading   = signal(false);
  error       = signal<string | null>(null);
  searchQuery = signal('');
  sortField   = signal<keyof Group>('groupName');
  sortAsc     = signal(true);

  // ── Computed ───────────────────────────────────────────────────────────────
  filtered = computed(() => {
    const q     = this.searchQuery().toLowerCase();
    const field = this.sortField();
    const asc   = this.sortAsc();

    return [...this.groups()]
      .filter(g => {
        return !q ||
          g.groupName?.toLowerCase().includes(q) ||
          String(g.groupId).includes(q) ||
          g.groupDescription?.toLowerCase().includes(q);
      })
      .sort((a, b) => {
        const va = a[field] ?? '';
        const vb = b[field] ?? '';
        const cmp = va < vb ? -1 : va > vb ? 1 : 0;
        return asc ? cmp : -cmp;
      });
  });

  totalCount = computed(() => this.groups().length);

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.load();
  }

  // ── Actions ────────────────────────────────────────────────────────────────
  load(): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.groupService.getAllGroups().subscribe({
      next: data => {
        this.groups.set(data);
        this.isLoading.set(false);
      },
      error: err => {
        this.error.set(err?.error?.message ?? 'Impossible de charger les groupes');
        this.isLoading.set(false);
      }
    });
  }

  goCreate(): void {
    this.router.navigate(['/admin/groups/create']);
  }

  goEdit(id: number): void {
    this.router.navigate(['/admin/groups', id, 'edit']);
  }

  confirmDelete(g: Group): void {
    if (!confirm(`Supprimer le groupe "${g.groupName}" (#${g.groupId}) ?`)) return;
    this.groupService.deleteGroup(g.groupId).subscribe({
      next: () => this.groups.update(list => list.filter(x => x.groupId !== g.groupId)),
      error: err => alert(err?.error?.message ?? 'Erreur lors de la suppression')
    });
  }

  // ── Sorting ────────────────────────────────────────────────────────────────
  sort(field: keyof Group): void {
    if (this.sortField() === field) {
      this.sortAsc.update(v => !v);
    } else {
      this.sortField.set(field);
      this.sortAsc.set(true);
    }
  }

  sortIcon(field: keyof Group): string {
    if (this.sortField() !== field) return '↕';
    return this.sortAsc() ? '↑' : '↓';
  }

  groupTypeLabel(typeId: number | undefined): string {
    const labels: Record<number, string> = {
      1: 'Tous les ATMs',
      2: 'Manuel',
      3: 'Schedulé',
      4: 'Dynamique'
    };
    return typeId ? (labels[typeId] ?? `Type ${typeId}`) : '—';
  }
}

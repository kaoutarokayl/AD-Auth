import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupService, Group, CreateGroupRequest, UpdateGroupRequest } from '../../../core/services/group.service';

@Component({
  selector: 'app-group-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './group-form.component.html',
  styleUrls: ['./group-form.component.css']
})
export class GroupFormComponent implements OnInit {
  private fb           = inject(FormBuilder);
  private groupService = inject(GroupService);
  private router       = inject(Router);
  private route        = inject(ActivatedRoute);

  // ── State ──────────────────────────────────────────────────────────────────
  isEdit     = signal(false);
  editId     = signal<number | null>(null);
  isLoading  = signal(true);
  isSaving   = signal(false);
  error      = signal<string | null>(null);
  successMsg = signal<string | null>(null);

  group      = signal<Group | null>(null);

  // ── Form ───────────────────────────────────────────────────────────────────
  form: FormGroup = this.fb.group({
    groupName:          ['', [Validators.required, Validators.minLength(2)]],
    groupTypeId:        [2],
    groupDescription:   [''],
    groupQuery:         [''],
    includeMothballed:  [false],
    evaluationInterval: [0]
  });

  get f() { return this.form.controls; }

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.isEdit.set(true);
        this.editId.set(Number(id));
        this.loadGroup(Number(id));
      } else {
        this.isLoading.set(false);
      }
    });
  }

  private loadGroup(id: number): void {
    this.groupService.getGroupDetails(id).subscribe({
      next: (details) => {
        const g: Group = {
          groupId: details.groupId,
          groupName: details.groupName,
          groupTypeId: details.groupTypeId,
          groupDescription: details.groupDescription,
          groupQuery: details.groupQuery,
          includeMothballed: details.includeMothballed,
          evaluationInterval: details.evaluationInterval
        };
        this.group.set(g);
        this.form.patchValue({
          groupName:          g.groupName,
          groupTypeId:        g.groupTypeId ?? 2,
          groupDescription:   g.groupDescription ?? '',
          groupQuery:         g.groupQuery ?? '',
          includeMothballed:  g.includeMothballed ?? false,
          evaluationInterval: g.evaluationInterval ?? 0
        });
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Erreur lors du chargement du groupe');
        this.isLoading.set(false);
      }
    });
  }

  // ── Actions ────────────────────────────────────────────────────────────────
  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.isSaving.set(true);
    this.error.set(null);

    if (this.isEdit() && this.group()) {
      const payload: UpdateGroupRequest = {
        groupId: this.group()!.groupId,
        ...this.form.value,
        groupTypeId:        Number(this.form.value.groupTypeId),
        evaluationInterval: Number(this.form.value.evaluationInterval)
      };
      this.groupService.updateGroup(payload).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.successMsg.set('Groupe mis à jour !');
          setTimeout(() => this.router.navigate(['/admin/groups']), 800);
        },
        error: err => {
          this.isSaving.set(false);
          this.error.set(err?.error?.message ?? 'Erreur lors de la mise à jour');
        }
      });
    } else {
      const payload: CreateGroupRequest = {
        ...this.form.value,
        groupTypeId:        Number(this.form.value.groupTypeId),
        evaluationInterval: Number(this.form.value.evaluationInterval)
      };
      this.groupService.createGroup(payload).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.successMsg.set('Groupe créé !');
          setTimeout(() => this.router.navigate(['/admin/groups']), 800);
        },
        error: err => {
          this.isSaving.set(false);
          this.error.set(err?.error?.message ?? 'Erreur lors de la création');
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/admin/groups']);
  }
}

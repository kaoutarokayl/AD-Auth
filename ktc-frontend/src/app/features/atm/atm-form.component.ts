import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  AtmService,
  BusinessDto,
  BranchDto,
  HardwareTypeDto,
  CreateOrUpdateAtmRequest
} from '../../core/services/atm.service';

@Component({
  selector: 'app-atm-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './atm-form.component.html',
  styleUrls: ['./atm-form.component.css']
})
export class AtmFormComponent implements OnInit {
  private fb         = inject(FormBuilder);
  private atmService = inject(AtmService);
  private router     = inject(Router);
  private route      = inject(ActivatedRoute);

  // ── State ──────────────────────────────────────────────────────────────────
  isEdit       = signal(false);
  editId       = signal<number | null>(null);
  isLoading    = signal(true);
  isSaving     = signal(false);
  error        = signal<string | null>(null);
  successMsg   = signal<string | null>(null);

  businesses   = signal<BusinessDto[]>([]);
  branches     = signal<BranchDto[]>([]);
  hardwareTypes = signal<HardwareTypeDto[]>([]);

  // ── Form ───────────────────────────────────────────────────────────────────
  form: FormGroup = this.fb.group({
    clientName:     ['', [Validators.required, Validators.minLength(2)]],
    networkAddress: ['', [Validators.required]],
    connectable:    [1,  [Validators.required]],
    active:         [true],
    detailsUnknown: [false],
    latitude:       [0,  [Validators.required, Validators.min(-90), Validators.max(90)]],
    longitude:      [0,  [Validators.required, Validators.min(-180), Validators.max(180)]],
    timezone:       ['UTC', [Validators.required]],
    comments:       [''],
    clientType:     [1],
    gridPosition:   [0],
    businessId:     [0],
    branchId:       [0],
    hardwareTypeId: [0],
    ownerId:        [0],
    deleteLater:    [false],
    subnet:         [''],
    level1RegionId: [0],
    level2RegionId: [0],
    level3RegionId: [0],
    level4RegionId: [0],
    level5RegionId: [0],
    salt:           [''],
    authHash:       [''],
    hypervisorActive: [false],
    mergeToClientId:  [0],
    featureFlags:     ['']
  });

  get f() { return this.form.controls; }

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit.set(true);
      this.editId.set(Number(idParam));
    }

    // Load businesses, hardware types in parallel, then optionally the ATM
    forkJoin({
      businesses:    this.atmService.getBusinesses(),
      hardwareTypes: this.atmService.getHardwareTypes(),
      branches:      this.atmService.getBranches()
    }).subscribe({
      next: ({ businesses, hardwareTypes, branches }) => {
        this.businesses.set(businesses);
        this.hardwareTypes.set(hardwareTypes);
        this.branches.set(branches);

        if (this.isEdit() && this.editId()) {
          this.atmService.getClientById(this.editId()!).subscribe({
            next: atm => {
              this.form.patchValue({
                clientName:     atm.clientName,
                networkAddress: atm.networkAddress,
                connectable:    atm.connectable,
                active:         atm.active,
                detailsUnknown: atm.detailsUnknown,
                latitude:       atm.latitude,
                longitude:      atm.longitude,
                timezone:       atm.timezone,
                comments:       atm.comments ?? '',
                clientType:     atm.clientType,
                businessId:     atm.businessId,
                branchId:       atm.branchId,
                hardwareTypeId: atm.hardwareTypeId
              });
              this.isLoading.set(false);
            },
            error: () => {
              this.error.set('ATM introuvable');
              this.isLoading.set(false);
            }
          });
        } else {
          this.isLoading.set(false);
        }
      },
      error: () => {
        this.error.set('Impossible de charger les données de référence');
        this.isLoading.set(false);
      }
    });
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.error.set(null);
    this.successMsg.set(null);

    const payload: CreateOrUpdateAtmRequest = {
      ...this.form.value,
      connectable:    Number(this.form.value.connectable),
      businessId:     Number(this.form.value.businessId),
      branchId:       Number(this.form.value.branchId),
      hardwareTypeId: Number(this.form.value.hardwareTypeId)
    };

    const obs = this.isEdit()
      ? this.atmService.updateClient(this.editId()!, payload)
      : this.atmService.createClient(payload);

    obs.subscribe({
      next: (res) => {
        this.isSaving.set(false);
        this.successMsg.set(res.message);
        setTimeout(() => this.router.navigate(['/atms']), 1000);
      },
      error: (err) => {
        this.isSaving.set(false);
        this.error.set(err?.error?.message ?? 'Erreur lors de l\'enregistrement');
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/atms']);
  }
}
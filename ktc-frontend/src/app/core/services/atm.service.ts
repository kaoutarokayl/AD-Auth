import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// ── Models calqués sur vos DTOs C# ──────────────────────────────────────────

export interface ClientAtm {
  clientId: number;
  ktcGuid: string;
  clientName: string;
  networkAddress: string;
  connectable: number;          // 1=Non connectable | 2=IP Statique | 3=IP Dynamique
  detailsUnknown: boolean;
  latitude: number;
  longitude: number;
  timezone: string;
  comments?: string;
  businessId: number;
  branchId: number;
  hardwareTypeId: number;
  hardwareTypeName?: string;
  active: boolean;
  clientType: number;
}

export interface BusinessDto {
  businessId: number;
  businessName: string;
  displayId: string;
}

export interface BusinessDetailsDto extends BusinessDto {
  additionalInfo?: string;
}

export interface BranchDto {
  branchId: number;
  branchName: string;
  displayId: string;
  additionalInfo?: string;
  businessId: number;
  level1RegionId: number;
  level2RegionId: number;
  level3RegionId: number;
  level4RegionId: number;
  level5RegionId: number;
}

export interface RegionDto {
  regionId: number;
  regionName: string;
  displayId: string;
}

export interface RegionDetailsDto extends RegionDto {
  businessId: number;
  regionLevel: number;
  parentRegionId: number;
  additionalInfo?: string;
}

export interface HardwareTypeDto {
  hardwareTypeId: number;
  name: string;
  description: string;
  typeGroup: string;
  canBeConfigured: boolean;
  canBeMonitored: boolean;
}

export interface CreateOrUpdateAtmRequest {
  clientName: string;
  networkAddress: string;
  connectable: number;
  detailsUnknown: boolean;
  latitude: number;
  longitude: number;
  timezone: string;
  comments?: string;
  clientType: number;
  gridPosition: number;
  businessId: number;
  branchId: number;
  hardwareTypeId: number;
  ownerId: number;
  deleteLater: boolean;
  active: boolean;
  subnet: string;
  level1RegionId: number;
  level2RegionId: number;
  level3RegionId: number;
  level4RegionId: number;
  level5RegionId: number;
  salt: string;
  authHash: string;
  hypervisorActive: boolean;
  mergeToClientId: number;
  featureFlags: string;
}

export interface CreateBranchRequest {
  branchName: string;
  displayId?: string;
  businessId: number;
  level1RegionId: number;
  level2RegionId: number;
  level3RegionId: number;
  level4RegionId: number;
  level5RegionId: number;
  additionalInfo?: string;
}

export interface CreateBusinessRequest {
  businessName: string;
  displayId?: string;
  additionalInfo?: string;
}

export interface CreateRegionRequest {
  regionName: string;
  displayId?: string;
  businessId: number;
  regionLevel: number;
  parentRegionId: number;
  additionalInfo?: string;
}

// ── Service ──────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class AtmService {
  private readonly http = inject(HttpClient);
  private readonly BASE = 'http://localhost:5239/api/atm';

  // ── Clients / ATMs ────────────────────────────────────────────────────────

  getClients(): Observable<ClientAtm[]> {
    return this.http.get<ClientAtm[]>(`${this.BASE}/clients`);
  }

  getClientById(id: number): Observable<ClientAtm> {
    return this.http.get<ClientAtm>(`${this.BASE}/clients/${id}`);
  }

  createClient(req: CreateOrUpdateAtmRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.BASE}/clients`, req);
  }

  updateClient(id: number, req: CreateOrUpdateAtmRequest): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.BASE}/clients/${id}`, req);
  }

  deleteClient(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.BASE}/clients/${id}`);
  }

  // ── Businesses ────────────────────────────────────────────────────────────

  getBusinesses(): Observable<BusinessDto[]> {
    return this.http.get<BusinessDto[]>(`${this.BASE}/businesses`);
  }

  getBusinessById(id: number): Observable<BusinessDetailsDto> {
    return this.http.get<BusinessDetailsDto>(`${this.BASE}/businesses/${id}`);
  }

  createBusiness(req: CreateBusinessRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.BASE}/businesses`, req);
  }

  updateBusiness(id: number, req: Partial<CreateBusinessRequest>): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.BASE}/businesses/${id}`, req);
  }

  deleteBusiness(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.BASE}/businesses/${id}`);
  }

  // ── Branches ──────────────────────────────────────────────────────────────

  getBranches(): Observable<BranchDto[]> {
    return this.http.get<BranchDto[]>(`${this.BASE}/branches`);
  }

  getBranchById(id: number): Observable<BranchDto> {
    return this.http.get<BranchDto>(`${this.BASE}/branches/${id}`);
  }

  createBranch(req: CreateBranchRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.BASE}/branches`, req);
  }

  updateBranch(id: number, req: CreateBranchRequest): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.BASE}/branches/${id}`, req);
  }

  deleteBranch(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.BASE}/branches/${id}`);
  }

  // ── Regions ───────────────────────────────────────────────────────────────

  getRegions(): Observable<RegionDto[]> {
    return this.http.get<RegionDto[]>(`${this.BASE}/regions`);
  }

  getRegionById(id: number): Observable<RegionDetailsDto> {
    return this.http.get<RegionDetailsDto>(`${this.BASE}/regions/${id}`);
  }

  createRegion(req: CreateRegionRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.BASE}/regions`, req);
  }

  updateRegion(id: number, req: CreateRegionRequest): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.BASE}/regions/${id}`, req);
  }

  deleteRegion(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.BASE}/regions/${id}`);
  }

  // ── Hardware Types ────────────────────────────────────────────────────────

  getHardwareTypes(): Observable<HardwareTypeDto[]> {
    return this.http.get<HardwareTypeDto[]>(`${this.BASE}/hardwaretypes`);
  }

  getHardwareTypesByBusiness(businessId: number): Observable<HardwareTypeDto[]> {
    return this.http.get<HardwareTypeDto[]>(`${this.BASE}/businesses/${businessId}/hardwaretypes`);
  }
}
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ClientAtm } from './atm.service';

// Re-export ClientAtm for convenience
export type { ClientAtm } from './atm.service';

// ── Models pour les groupes ──────────────────────────────────────────

export interface Group {
  groupId: number;
  groupName: string;
  groupTypeId?: number;
  groupQuery?: string;
  groupDescription?: string;
  includeMothballed?: boolean;
  evaluationInterval?: number;
  lastChangedTimestamp?: Date;
}

export interface GroupDetails extends Group {
  clients?: ClientAtm[];
}

export interface ClientGroup {
  groupId: number;
  clientId: number;
}

export interface CreateGroupRequest {
  groupName: string;
  groupTypeId?: number;
  groupQuery?: string;
  groupDescription?: string;
  includeMothballed?: boolean;
  evaluationInterval?: number;
}

export interface UpdateGroupRequest extends CreateGroupRequest {
  groupId: number;
}

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5239/api/group';

  // ── Récupérer tous les groupes ──
  getAllGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(this.apiUrl);
  }

  // ── Récupérer les détails d'un groupe avec ses clients ──
  getGroupDetails(groupId: number): Observable<GroupDetails> {
    return this.http.get<GroupDetails>(`${this.apiUrl}/${groupId}`);
  }

  // ── Récupérer les clients d'un groupe ──
  getGroupClients(groupId: number): Observable<ClientAtm[]> {
    return this.http.get<ClientAtm[]>(`${this.apiUrl}/${groupId}/clients`);
  }

  // ── Créer un nouveau groupe ──
  createGroup(request: CreateGroupRequest): Observable<any> {
    return this.http.post(this.apiUrl, request);
  }

  // ── Mettre à jour un groupe ──
  updateGroup(request: UpdateGroupRequest): Observable<any> {
    return this.http.put(this.apiUrl, request);
  }

  // ── Ajouter un client à un groupe ──
  addClientToGroup(groupId: number, clientId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${groupId}/add-client/${clientId}`, {});
  }

  // ── Retirer un client d'un groupe ──
  removeClientFromGroup(groupId: number, clientId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${groupId}/remove-client/${clientId}`);
  }

  // ── Supprimer un groupe ──
  deleteGroup(groupId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${groupId}`);
  }
}

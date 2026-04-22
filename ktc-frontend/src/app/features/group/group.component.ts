import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GroupListComponent } from './components/group-list.component';

@Component({
  selector: 'app-group',
  standalone: true,
  imports: [CommonModule, GroupListComponent],
  template: '<app-group-list></app-group-list>',
  styleUrls: ['./group.component.css']
})
export class GroupComponent {}

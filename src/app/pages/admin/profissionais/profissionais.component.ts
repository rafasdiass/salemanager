import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfissionaisFormComponent } from './profissionais-form/profissionais-form.component';
import { ProfissionaisListComponent } from './profissionais-list/profissionais-list.component';

@Component({
  selector: 'app-profissionais',
  standalone: true,
  imports: [
    CommonModule,
    ProfissionaisFormComponent,
    ProfissionaisListComponent,
  ],
  templateUrl: './profissionais.component.html',
  styleUrls: ['./profissionais.component.scss'],
})
export class ProfissionaisComponent {}

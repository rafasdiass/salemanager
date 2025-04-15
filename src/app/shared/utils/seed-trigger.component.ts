import { Component } from '@angular/core';
import { FirestoreSeedService } from '../../shared/services/firestore-seed.service';

@Component({
  selector: 'app-seed-trigger',
  template: `<button (click)="runSeed()">Executar Seed</button>`,
})
export class SeedTriggerComponent {
  constructor(private seedService: FirestoreSeedService) {}

  async runSeed() {
    await this.seedService.seedDatabase();
    alert('✅ Seed executado com sucesso!');
  }
}

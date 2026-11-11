import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { LuluskeComponent } from './luluske.component';

@Component({
  selector: 'app-luluske-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './luluske-results.component.html',
  styleUrls: ['./luluske-shared.css', './luluske-results.component.css']
})
export class LuluskeResultsComponent {
  @Input({ required: true }) scoreData!: LuluskeComponent['scoreData'];
  @Input({ required: true }) minimumPercent!: LuluskeComponent['minimumPercent'];
  @Input({ required: true }) failureReasons: string[] = [];
  @Input() validationErrors: string[] = [];
}

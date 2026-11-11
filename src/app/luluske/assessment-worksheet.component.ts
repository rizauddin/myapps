import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { LuluskeComponent } from './luluske.component';

type EditableColumn = 'assignment' | 'weightage' | 'totalMarks' | 'score';

@Component({
    selector: 'app-assessment-worksheet',
    imports: [CommonModule],
    templateUrl: './assessment-worksheet.component.html',
    styleUrls: ['./luluske-shared.css', './assessment-worksheet.component.css']
})
export class AssessmentWorksheetComponent {
  @Input({ required: true }) tableData!: LuluskeComponent['tableData'];
  @Input({ required: true }) totalWeight = 100;
  @Input({ required: true }) commitValue!: (column: string, row: number, value: string) => string | null;
  @Input() calculationValid = true;
  @Input() weightTotalValid = true;
  readonly assessmentIndices = [0, 1, 2, 3];
  readonly fields: { column: EditableColumn; label: string }[] = [
    { column: 'weightage', label: 'Weight (%)' },
    { column: 'totalMarks', label: 'Total marks' },
    { column: 'score', label: 'Score' },
  ];
  activeEdit: { column: EditableColumn; row: number; label: string } | null = null;
  draftValue = '';
  editError = '';
  private editTrigger: HTMLButtonElement | null = null;

  @ViewChild('editInput') set editInput(input: ElementRef<HTMLInputElement> | undefined) {
    if (input) {
      input.nativeElement.focus();
      input.nativeElement.select();
    }
  }

  assessmentRole(index: number): string {
    return index === 3 ? 'Final examination' : `Carry ${index + 1}`;
  }

  beginEdit(column: EditableColumn, row: number, label: string, trigger: HTMLButtonElement): void {
    // Keep an unfinished draft until it is explicitly applied or cancelled.
    if (this.activeEdit) {
      if (this.activeEdit.column === column && this.activeEdit.row === row) {
        trigger.closest('tbody')?.querySelector<HTMLInputElement>('input')?.focus();
      } else {
        this.editError = 'Apply or cancel your current edit before editing another field.';
      }
      return;
    }
    this.editTrigger = trigger;
    this.draftValue = String(this.tableData[column][row]);
    this.editError = '';
    this.activeEdit = { column, row, label };
  }

  applyEdit(): void {
    if (!this.activeEdit) return;
    const { column, row } = this.activeEdit;
    const error = this.commitValue(column, row, this.draftValue);
    if (error) {
      this.editError = error;
      return;
    }
    this.cancelEdit();
  }

  cancelEdit(): void {
    this.activeEdit = null;
    this.editError = '';
    this.editTrigger?.focus();
    this.editTrigger = null;
  }

}

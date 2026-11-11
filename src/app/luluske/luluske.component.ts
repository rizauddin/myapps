import { Component } from '@angular/core';
import { LuluskeResultsComponent } from './luluske-results.component';
import { AssessmentWorksheetComponent } from './assessment-worksheet.component';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';

@Component({
    selector: 'app-luluske',
    imports: [
        CommonModule, LuluskeResultsComponent, AssessmentWorksheetComponent,
    ],
    templateUrl: './luluske.component.html',
    styleUrls: ['./luluske-shared.css', './luluske.component.css']
})
export class LuluskeComponent {

  public constructor(private titleService: Title) { }

  ngOnInit(): void {
    this.titleService.setTitle('luluske?');
    this.updateGrade();
  }

  tableData = {
    weightage: [20, 20, 10, 50],
    totalMarks: [100, 100, 100, 100],
    assignment: ['Quiz', 'Test', 'Project', 'Final Exam'],
    score: [80, 75, 70, 60],
  };

  scoreData = {
    carryMarks: 60,
    finalExam: 50,
    carryPercent: 0,
    finalExamPercent: 0,
    finalMarks: 20,
    grade: 'C',
    result: 'Pass',
  };

  readonly minimumPercent = { carry: 50, finalExam: 20, overall: 50 };
  failureReasons: string[] = [];

  get carryWeight(): number {
    return this.tableData.weightage.slice(0, 3).reduce((total, weight) => total + weight, 0);
  }

  get totalWeight(): number {
    return this.tableData.weightage.reduce((total, weight) => total + weight, 0);
  }

  get hasValidWeightTotal(): boolean {
    return Number.isFinite(this.totalWeight) && Math.abs(this.totalWeight - 100) < 1e-9;
  }

  get validationErrors(): string[] {
    const errors: string[] = [];
    for (let row = 0; row < 4; row++) {
      const error = this.numericFieldError('totalMarks', row, this.tableData.totalMarks[row])
        || this.numericFieldError('score', row, this.tableData.score[row])
        || this.numericFieldError('weightage', row, this.tableData.weightage[row]);
      if (error) errors.push(`${this.tableData.assignment[row] || `Assessment ${row + 1}`}: ${error}`);
    }
    if (!this.hasValidWeightTotal) errors.push(`The total weight must be 100%. It is now ${this.totalWeight}%.`);
    if (!(this.carryWeight > 0)) errors.push('The combined carry weight must be greater than 0%.');
    if (!(this.tableData.weightage[3] > 0)) errors.push('The final exam weight must be greater than 0%.');
    return errors;
  }

  private numericFieldError(column: string, row: number, value: number): string | null {
    if (!Number.isFinite(value)) return 'Please enter a valid number';
    if (column === 'score') {
      if (value < 0) return 'The score must be 0 or greater.';
      if (value > this.tableData.totalMarks[row]) return 'The score cannot exceed the total marks.';
    } else if (column === 'totalMarks') {
      if (value <= 0) return 'Total marks must be greater than 0.';
      if (value < this.tableData.score[row]) {
        return `Total marks cannot be less than the current score (${this.tableData.score[row]}). Reduce the score first.`;
      }
    } else if (column === 'weightage' && (value < 0 || value > 100)) {
      return 'The weight must be between 0% and 100%.';
    }
    return null;
  }

  get examSuggestions(): { target: string; score: number | null; message: string }[] {
    const weights = this.tableData.weightage;
    const examTotal = this.tableData.totalMarks[3];
    const validInputs = this.validationErrors.length === 0;

    return [{ target: 'Pass the course', minimum: this.minimumPercent.overall },
      { target: 'Get an A or higher', minimum: 80 }].map(({ target, minimum }) => {
      if (!validInputs) {
        return { target, score: null, message: 'Enter valid scores, positive total marks, and weights totaling 100% with both components weighted.' };
      }
      if (this.scoreData.carryPercent < this.minimumPercent.carry) {
        return { target, score: null, message: 'Not achievable with the current carry marks. You must first pass the carry component (at least 50%).' };
      }

      const requiredPercent = Math.max(this.minimumPercent.finalExam,
        (minimum - this.scoreData.carryMarks) / weights[3] * 100);
      // Recommend whole marks, rounding up so the target is met.
      const score = Math.ceil(requiredPercent / 100 * examTotal);
      if (score > examTotal) {
        return { target, score: null, message: 'Not achievable with the current carry marks, even with full marks in the final exam.' };
      }
      return { target, score, message: `Score at least ${score} out of ${examTotal} in the final exam.` };
    });
  }

  readonly gradeScale = [
    { grade: 'F', interval: '≤ 29' }, { grade: 'E', interval: '> 29 to 39' },
    { grade: 'D', interval: '> 39 to 43' }, { grade: 'D+', interval: '> 43 to 46' },
    { grade: 'C-', interval: '> 46 to 49' }, { grade: 'C', interval: '> 49 to 54' },
    { grade: 'C+', interval: '> 54 to 59' }, { grade: 'B-', interval: '> 59 to 64' },
    { grade: 'B', interval: '> 64 to 69' }, { grade: 'B+', interval: '> 69 to 74' },
    { grade: 'A-', interval: '> 74 to 79' }, { grade: 'A', interval: '> 79 to 89' },
    { grade: 'A+', interval: '> 89' },
  ];
  announcement = '';
  readonly commitAssessment = (column: string, row: number, value: string): string | null => {
    const error = this.commitCell(column, row, value);
    if (error) return error;
    this.announcement = this.validationErrors.length
      ? `Assessment updated. Check inputs before calculating. ${this.validationErrors.join(' ')}`
      : `Assessment updated. Overall marks ${this.scoreData.finalMarks}, grade ${this.scoreData.grade}, ${this.scoreData.result}. `
        + this.examSuggestions.map(suggestion => `${suggestion.target}: ${suggestion.message}`).join(' ');
    return null;
  };

  // Both editing entry points share validation and leave committed values unchanged on error.
  editCell(column: string, rowIndex: number): void {
    const newValue = prompt('Enter new value');
    if (newValue === null) return;
    const error = this.commitCell(column, rowIndex, newValue);
    if (error) alert(error);
  }

  private commitCell(column: string, rowIndex: number, newValue: string): string | null {
    if (!Number.isInteger(rowIndex) || rowIndex < 0 || rowIndex >= 4) return 'Please select a valid assessment.';
    if (column === 'weightage' || column === 'totalMarks' || column === 'score') {
      if (!newValue.trim()) return 'Please enter a valid number';
      const numericValue = Number(newValue);
      const error = this.numericFieldError(column, rowIndex, numericValue);
      if (error) return error;
      this.tableData[column][rowIndex] = numericValue;
      this.updateGrade();
    } else if (column === 'assignment') {
      this.tableData[column][rowIndex] = newValue;
    } else {
      return 'Please select a valid assessment field.';
    }
    return null;
  }

  // Clamp only decorative bar widths; calculation values remain untouched.
  barWidth(value: number): number {
    return Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0;
  }

  updateGrade(): void {
    if (this.validationErrors.length) {
      // Do not present stale marks, NaN-derived grades or a course Pass for invalid data.
      this.scoreData = {
        carryMarks: NaN, finalExam: NaN, carryPercent: NaN, finalExamPercent: NaN,
        finalMarks: NaN, grade: '—', result: 'Check inputs',
      };
      this.failureReasons = [];
      return;
    }
    this.scoreData.carryMarks = this.tableData.score[0] / this.tableData.totalMarks[0] * this.tableData.weightage[0] + this.tableData.score[1] / this.tableData.totalMarks[1] * this.tableData.weightage[1] + this.tableData.score[2] / this.tableData.totalMarks[2] * this.tableData.weightage[2]

    this.scoreData.finalExam = this.tableData.score[3] / this.tableData.totalMarks[3] * this.tableData.weightage[3];

    this.scoreData.finalMarks = this.scoreData.carryMarks + this.scoreData.finalExam;

    this.scoreData.carryPercent = this.carryWeight > 0
      ? this.scoreData.carryMarks / this.carryWeight * 100 : 0;
    this.scoreData.finalExamPercent = this.tableData.weightage[3] > 0
      ? this.scoreData.finalExam / this.tableData.weightage[3] * 100 : 0;

    this.failureReasons = [];
    if (!(this.scoreData.carryPercent >= this.minimumPercent.carry)) {
      this.failureReasons.push(`Carry marks are below ${this.minimumPercent.carry}% of the maximum carry marks.`);
    }
    if (!(this.scoreData.finalExamPercent >= this.minimumPercent.finalExam)) {
      this.failureReasons.push(`The final exam score is below ${this.minimumPercent.finalExam}% of the maximum final exam marks.`);
    }
    if (!(this.scoreData.finalMarks >= this.minimumPercent.overall)) {
      this.failureReasons.push(`The overall score is below ${this.minimumPercent.overall}%.`);
    }
    this.scoreData.result = this.failureReasons.length === 0 ? 'Pass' : 'Fail';

    if (this.scoreData.finalMarks <= 29) this.scoreData.grade = 'F'
    else if (this.scoreData.finalMarks <= 39) this.scoreData.grade = 'E'
    else if (this.scoreData.finalMarks <= 43) this.scoreData.grade = 'D'
    else if (this.scoreData.finalMarks <= 46) this.scoreData.grade = 'D+'
    else if (this.scoreData.finalMarks <= 49) this.scoreData.grade = 'C-'
    else if (this.scoreData.finalMarks <= 54) this.scoreData.grade = 'C'
    else if (this.scoreData.finalMarks <= 59) this.scoreData.grade = 'C+'
    else if (this.scoreData.finalMarks <= 64) this.scoreData.grade = 'B-'
    else if (this.scoreData.finalMarks <= 69) this.scoreData.grade = 'B'
    else if (this.scoreData.finalMarks <= 74) this.scoreData.grade = 'B+'
    else if (this.scoreData.finalMarks <= 79) this.scoreData.grade = 'A-'
    else if (this.scoreData.finalMarks <= 89) this.scoreData.grade = 'A'
    else this.scoreData.grade = 'A+'
  }
}

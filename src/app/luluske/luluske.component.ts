import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-luluske',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './luluske.component.html',
  styleUrl: './luluske.component.css'
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

  totalWeight = 100;
  readonly minimumPercent = { carry: 50, finalExam: 20, overall: 50 };
  failureReasons: string[] = [];

  get carryWeight(): number {
    return this.tableData.weightage.slice(0, 3).reduce((total, weight) => total + weight, 0);
  }

  get examSuggestions(): { target: string; score: number | null; message: string }[] {
    const weights = this.tableData.weightage;
    const examTotal = this.tableData.totalMarks[3];
    const validInputs = weights.every(weight => Number.isFinite(weight) && weight >= 0)
      && Math.abs(weights.reduce((sum, weight) => sum + weight, 0) - 100) < 1e-9
      && this.carryWeight > 0 && weights[3] > 0
      && this.tableData.totalMarks.every(total => Number.isFinite(total) && total > 0)
      && this.tableData.score.slice(0, 3).every((score, index) =>
        Number.isFinite(score) && score >= 0 && score <= this.tableData.totalMarks[index]);

    return [{ target: 'Pass the course', minimum: this.minimumPercent.overall },
      { target: 'Get an A or higher', minimum: 80 }].map(({ target, minimum }) => {
      if (!validInputs) {
        return { target, score: null, message: 'Enter valid carry scores, positive total marks, and weights totaling 100% with both components weighted.' };
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

  editCell(column: string, rowIndex: number): void {
    // Implement your edit logic here
    // For instance, prompt for a new value and update the cell's content
    const newValue = prompt('Enter new value');
    if (newValue !== null) {
      // Update the model with the new value
      if (column === 'weightage' || column === 'totalMarks' || column === 'score') {
        const numericValue = Number(newValue);

        // Verify that the score does not exceed total marks
        // if (column==='score') {
        //   if numericValue > 
        // }

        if (!isNaN(numericValue)) {
          // Verify that the total weight = 100
          if (column === 'weightage') {
            this.totalWeight = 0;
            for (let i = 0; i <= 3; i++) {
              if (i != rowIndex) this.totalWeight += this.tableData[column][i]
              else this.totalWeight += numericValue;
            }
            //if (this.totalWeight != 100) alert('Please check the total weight');
          }

          this.tableData[column][rowIndex] = numericValue;
          this.updateGrade();
        } else {
          alert('Please enter a valid number');
        }

      } else if (column === 'assignment') {
        this.tableData[column][rowIndex] = newValue;
      }
    }
  }

  updateGrade(): void {
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

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

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

  constructor() {}

  ngOnInit(): void {
    this.updateGrade();
  }

  tableData = {
    weightage: [30, 10, 10, 50],
    totalMarks: [40, 30, 30, 100],
    assignment: ['Test', 'Lab', 'Project', 'Final Exam'],
    score: [15, 10, 20, 70],
  };

  scoreData = {
    carryMarks: 60,
    finalExam: 50,
    finalMarks: 20,
    grade: 'C',
    result: 'Pass',
  };

  totalWeight = 100;

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

    this.scoreData.result = this.scoreData.finalMarks >= 50 && 'Pass' || 'Fail';

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

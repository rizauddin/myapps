import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { LuluskeComponent } from './luluske.component';

describe('Luluske assessment validation', () => {
  let component: LuluskeComponent;

  beforeEach(() => {
    component = new LuluskeComponent(TestBed.inject(Title));
    component.ngOnInit();
  });

  for (let row = 0; row < 4; row++) {
    ['score', 'totalMarks', 'weightage'].forEach(column => {
      ['', ' ', 'NaN', 'Infinity', '-Infinity', '1e309', '-1'].forEach(value => {
        it(`rejects ${JSON.stringify(value)} for ${column} at assessment ${row + 1}`, () => {
          const before = JSON.stringify(component.tableData);
          const results = { ...component.scoreData };
          expect(component.commitAssessment(column, row, value)).not.toBeNull();
          expect(JSON.stringify(component.tableData)).toBe(before);
          expect(component.scoreData).toEqual(results);
        });
      });
    });

    it(`allows score equal to total at assessment ${row + 1}`, () => {
      expect(component.commitAssessment('score', row, '100')).toBeNull();
      expect(component.tableData.score[row]).toBe(100);
      expect(component.validationErrors).toEqual([]);
    });

    it(`allows a zero score but not zero total marks at assessment ${row + 1}`, () => {
      expect(component.commitAssessment('score', row, '0')).toBeNull();
      expect(component.commitAssessment('totalMarks', row, '0')).toContain('greater than 0');
    });

    it(`allows a total matching the current score at assessment ${row + 1}`, () => {
      expect(component.commitAssessment('totalMarks', row, String(component.tableData.score[row]))).toBeNull();
      expect(component.validationErrors).toEqual([]);
    });

    it(`rejects weight above 100 at assessment ${row + 1}`, () => {
      expect(component.commitAssessment('weightage', row, '100.01')).toContain('between 0% and 100%');
    });

    it(`blocks results for an invalid stored score at assessment ${row + 1}`, () => {
      for (const score of [-1, 101, NaN, Infinity]) {
        component.tableData.score[row] = score;
        component.updateGrade();
        expect(component.validationErrors.length).toBeGreaterThan(0);
        expect(component.scoreData.result).toBe('Check inputs');
        expect(component.scoreData.grade).toBe('—');
        expect(component.examSuggestions.every(target => target.score === null)).toBeTrue();
      }
    });
  }

  it('supports fixing the Project score before lowering its total marks', () => {
    expect(component.commitAssessment('totalMarks', 2, '30')).toContain('current score (70)');
    expect(component.tableData.totalMarks[2]).toBe(100);
    expect(component.commitAssessment('score', 2, '30')).toBeNull();
    expect(component.commitAssessment('totalMarks', 2, '30')).toBeNull();
    expect(component.scoreData.carryMarks).toBe(41);
    expect(component.scoreData.finalMarks).toBe(71);
    expect(component.scoreData.grade).toBe('B+');
  });

  it('keeps both component weights positive while allowing a zero individual carry weight', () => {
    component.tableData.weightage = [0, 30, 20, 50];
    component.updateGrade();
    expect(component.validationErrors).toEqual([]);
    component.tableData.weightage = [0, 0, 0, 100];
    component.updateGrade();
    expect(component.validationErrors.join(' ')).toContain('combined carry weight');
    component.tableData.weightage = [40, 40, 20, 0];
    component.updateGrade();
    expect(component.validationErrors.join(' ')).toContain('final exam weight');
  });

  it('reports the same validation error in the legacy prompt editor', () => {
    spyOn(window, 'prompt').and.returnValue('30');
    const alert = spyOn(window, 'alert');
    component.editCell('totalMarks', 2);
    expect(alert).toHaveBeenCalledWith('Total marks cannot be less than the current score (70). Reduce the score first.');
    expect(component.tableData.totalMarks[2]).toBe(100);
  });

  it('rejects invalid assessment indices and field names', () => {
    for (const row of [-1, 4, 1.5]) expect(component.commitAssessment('score', row, '10')).not.toBeNull();
    expect(component.commitAssessment('unknown', 0, '10')).not.toBeNull();
    expect(component.scoreData.finalMarks).toBe(68);
  });
});

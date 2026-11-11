import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { LuluskeComponent } from './luluske.component';

describe('Luluske calculation characterisation', () => {
  let component: LuluskeComponent;

  beforeEach(() => {
    component = new LuluskeComponent(TestBed.inject(Title));
    component.ngOnInit();
  });

  const transitions: [number, string, string][] = [
    [29, 'F', 'E'], [39, 'E', 'D'], [43, 'D', 'D+'], [46, 'D+', 'C-'],
    [49, 'C-', 'C'], [54, 'C', 'C+'], [59, 'C+', 'B-'], [64, 'B-', 'B'],
    [69, 'B', 'B+'], [74, 'B+', 'A-'], [79, 'A-', 'A'], [89, 'A', 'A+'],
  ];
  transitions.forEach(([boundary, before, after]) => {
    [-0.001, 0, 0.001].forEach(offset => {
      it(`preserves the unrounded grade at ${boundary + offset}`, () => {
        component.tableData.score = Array(4).fill(boundary + offset);
        component.updateGrade();
        expect(component.scoreData.grade).toBe(offset > 0 ? after : before);
      });
    });
  });

  it('keeps fractional grade boundaries independent of the 80-overall A target', () => {
    component.tableData.score[3] = 83;
    component.updateGrade();
    expect(component.scoreData.finalMarks).toBe(79.5);
    expect(component.scoreData.grade).toBe('A');
    expect(component.examSuggestions[1].score).toBe(84);
  });

  it('does not round a near-passing overall mark before deciding pass/fail', () => {
    component.tableData.score = [50, 50, 50, 49.998];
    component.updateGrade();
    expect(component.scoreData.finalMarks).toBeCloseTo(49.999, 10);
    expect(component.scoreData.result).toBe('Fail');
  });

  it('uses one weight tolerance for validation and suggestion guards', () => {
    const value = 20 + 1e-10;
    component.commitAssessment('weightage', 0, String(value));
    expect(component.hasValidWeightTotal).toBeTrue();
    expect(component.validationErrors).toEqual([]);
    expect(component.examSuggestions[0].score).not.toBeNull();
    component.commitAssessment('weightage', 0, String(20 + 1e-8));
    expect(component.examSuggestions[0].score).toBeNull();
  });

  it('rejects zero denominators without changing marks, grade or result', () => {
    const before = { ...component.scoreData };
    expect(component.commitAssessment('totalMarks', 0, '0')).toContain('greater than 0');
    expect(component.tableData.totalMarks[0]).toBe(100);
    expect(component.scoreData).toEqual(before);
  });

  it('withholds misleading results for invalid data introduced outside the editor', () => {
    component.tableData.totalMarks[0] = 0;
    component.updateGrade();
    expect(component.scoreData.finalMarks).toBeNaN();
    expect(component.scoreData.grade).toBe('—');
    expect(component.scoreData.result).toBe('Check inputs');
    expect(component.examSuggestions[0].score).toBeNull();
    component.tableData.totalMarks[0] = 100;
    component.updateGrade();
    expect(component.scoreData.finalMarks).toBe(68);
    expect(component.scoreData.grade).toBe('B');
    expect(component.scoreData.result).toBe('Pass');
  });

  it('retains whole-mark ceiling for fractional examination totals', () => {
    component.tableData.score = [100, 100, 100, 0];
    component.tableData.totalMarks[3] = 1.5;
    component.updateGrade();
    expect(component.examSuggestions.map(target => target.score)).toEqual([1, 1]);
    component.tableData.score = [60, 60, 60, 0];
    component.updateGrade();
    expect(component.examSuggestions[1].score).toBeNull();
  });
});

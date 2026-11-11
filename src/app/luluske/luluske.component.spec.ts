import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';

import { LuluskeComponent } from './luluske.component';

describe('LuluskeComponent', () => {
  let component: LuluskeComponent;
  let fixture: ComponentFixture<LuluskeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LuluskeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LuluskeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('initializes the page title, defaults, and weighted results', () => {
    expect(TestBed.inject(Title).getTitle()).toBe('luluske?');
    expect(component.tableData.assignment).toEqual(['Quiz', 'Test', 'Project', 'Final Exam']);
    expect(component.tableData.weightage).toEqual([20, 20, 10, 50]);
    expect(component.tableData.totalMarks).toEqual([100, 100, 100, 100]);
    expect(component.totalWeight).toBe(100);
    expect(component.tableData.score).toEqual([80, 75, 70, 60]);
    expect(component.scoreData.carryMarks).toBe(38);
    expect(component.scoreData.finalExam).toBe(30);
    expect(component.scoreData.finalMarks).toBe(68);
    expect(component.scoreData.grade).toBe('B');
    expect(component.scoreData.carryPercent).toBeCloseTo(76, 10);
    expect(component.scoreData.finalExamPercent).toBe(60);
    expect(component.scoreData.result).toBe('Pass');
  });

  const gradeRanges: [number, number, string][] = [
    [0, 29, 'F'], [30, 39, 'E'], [40, 43, 'D'], [44, 46, 'D+'],
    [47, 49, 'C-'], [50, 54, 'C'], [55, 59, 'C+'], [60, 64, 'B-'],
    [65, 69, 'B'], [70, 74, 'B+'], [75, 79, 'A-'], [80, 89, 'A'],
    [90, 100, 'A+'],
  ];

  gradeRanges.forEach(([lower, upper, grade]) => {
    [lower, upper].forEach(mark => {
      it(`assigns ${grade} and ${mark >= 50 ? 'Pass' : 'Fail'} at ${mark} marks`, () => {
        component.tableData.totalMarks = [100, 100, 100, 100];
        component.tableData.score = [mark, mark, mark, mark];
        component.updateGrade();

        expect(component.scoreData.finalMarks).toBeCloseTo(mark, 10);
        expect(component.scoreData.grade).toBe(grade);
        expect(component.scoreData.result).toBe(mark >= 50 ? 'Pass' : 'Fail');
      });
    });
  });

  it('passes at exactly 50 but fails just below 50', () => {
    component.tableData.totalMarks = [100, 100, 100, 100];
    component.tableData.score = [50, 50, 50, 49.98];
    component.updateGrade();
    expect(component.scoreData.result).toBe('Fail');

    component.tableData.score[3] = 50;
    component.updateGrade();
    expect(component.scoreData.result).toBe('Pass');
  });

  it('renames an assignment through its labelled editor', () => {
    const header: HTMLButtonElement = fixture.nativeElement.querySelector('.name-button');
    header.click();
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('#assessment-value');
    input.value = 'Weekly Quiz';
    input.dispatchEvent(new Event('input'));
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit', { cancelable: true }));
    fixture.detectChanges();

    expect(component.tableData.assignment[0]).toBe('Weekly Quiz');
    expect(header.textContent?.trim()).toBe('Weekly Quiz');
  });

  it('recalculates and renders results after a score edit', () => {
    spyOn(window, 'prompt').and.returnValue('40');
    component.editCell('score', 0);
    fixture.detectChanges();

    expect(component.tableData.score[0]).toBe(40);
    expect(component.scoreData.carryMarks).toBe(30);
    expect(component.scoreData.finalMarks).toBe(60);
    expect(component.scoreData.grade).toBe('B-');
    const results = fixture.nativeElement.querySelector('[data-testid="overall-marks"]');
    expect(results.textContent).toContain('60');
  });

  it('recalculates when total marks change', () => {
    spyOn(window, 'prompt').and.returnValue('200');
    component.editCell('totalMarks', 0);

    expect(component.tableData.totalMarks[0]).toBe(200);
    expect(component.scoreData.finalMarks).toBe(60);
    expect(component.scoreData.grade).toBe('B-');
  });

  it('shows a weight warning and clears it when the total returns to 100', () => {
    const prompt = spyOn(window, 'prompt').and.returnValues('30', '20');
    component.editCell('weightage', 0);
    fixture.detectChanges();

    expect(component.totalWeight).toBe(110);
    expect(component.scoreData.finalMarks).toBeNaN();
    expect(component.scoreData.result).toBe('Check inputs');
    expect(fixture.nativeElement.textContent).toContain('It is now 110.');

    component.editCell('weightage', 0);
    fixture.detectChanges();
    expect(prompt).toHaveBeenCalledTimes(2);
    expect(component.totalWeight).toBe(100);
    expect(fixture.nativeElement.textContent).not.toContain('The total weight must be 100');
  });

  ['score', 'totalMarks', 'weightage'].forEach(column => {
    it(`rejects nonnumeric ${column} without changing data or results`, () => {
      spyOn(window, 'prompt').and.returnValue('invalid');
      const alert = spyOn(window, 'alert');
      const previousData = JSON.stringify(component.tableData);
      const previousResults = { ...component.scoreData };
      component.editCell(column, 0);

      expect(alert).toHaveBeenCalledWith('Please enter a valid number');
      expect(JSON.stringify(component.tableData)).toBe(previousData);
      expect(component.scoreData).toEqual(previousResults);
      expect(component.totalWeight).toBe(100);
    });
  });

  it('leaves data and results unchanged when editing is cancelled', () => {
    spyOn(window, 'prompt').and.returnValue(null);
    const previousData = JSON.stringify(component.tableData);
    const previousResults = { ...component.scoreData };
    component.editCell('score', 0);
    component.editCell('assignment', 0);

    expect(JSON.stringify(component.tableData)).toBe(previousData);
    expect(component.scoreData).toEqual(previousResults);
  });

  describe('component pass requirements', () => {
    beforeEach(() => {
      component.tableData.totalMarks = [100, 100, 100, 100];
    });

    [
      { carry: 49.99, exam: 100, result: 'Fail', total: 74.995 },
      { carry: 100, exam: 19.99, result: 'Fail', total: 59.995 },
      { carry: 50, exam: 50, result: 'Pass', total: 50 },
      { carry: 100, exam: 20, result: 'Pass', total: 60 },
      { carry: 50, exam: 20, result: 'Fail', total: 35 },
    ].forEach(({ carry, exam, result, total }) => {
      it(`returns ${result} for carry ${carry}% and final exam ${exam}%`, () => {
        component.tableData.score = [carry, carry, carry, exam];
        component.updateGrade();

        expect(component.scoreData.carryPercent).toBeCloseTo(carry, 10);
        expect(component.scoreData.finalExamPercent).toBeCloseTo(exam, 10);
        expect(component.scoreData.finalMarks).toBeCloseTo(total, 10);
        expect(component.scoreData.result).toBe(result);
      });
    });

    it('uses each component weight when weights change', () => {
      component.tableData.weightage = [10, 10, 20, 60];
      component.tableData.score = [50, 50, 50, 50];
      component.updateGrade();

      expect(component.carryWeight).toBe(40);
      expect(component.scoreData.carryMarks).toBe(20);
      expect(component.scoreData.finalExam).toBe(30);
      expect(component.scoreData.carryPercent).toBe(50);
      expect(component.scoreData.finalExamPercent).toBe(50);
      expect(component.scoreData.result).toBe('Pass');

      component.tableData.score = [49, 49, 49, 100];
      component.updateGrade();
      expect(component.scoreData.finalMarks).toBeCloseTo(79.6, 10);
      expect(component.scoreData.result).toBe('Fail');
    });

    it('normalizes raw scores against their own total marks', () => {
      component.tableData.totalMarks = [40, 30, 30, 200];
      component.tableData.score = [20, 15, 15, 40];
      component.updateGrade();

      expect(component.scoreData.carryPercent).toBe(50);
      expect(component.scoreData.finalExamPercent).toBe(20);
      expect(component.scoreData.finalMarks).toBe(35);
      expect(component.failureReasons).toEqual(['The overall score is below 50%.']);
    });

    it('shows why a passing total still fails and clears reasons after correction', () => {
      component.tableData.score = [100, 100, 100, 19.99];
      component.updateGrade();
      fixture.detectChanges();

      expect(component.scoreData.grade).toBe('B-');
      expect(component.scoreData.result).toBe('Fail');
      const status: HTMLElement = fixture.nativeElement.querySelector('[role="status"]');
      expect(status.textContent).toContain('The final exam score is below 20%');

      spyOn(window, 'prompt').and.returnValue('20');
      component.editCell('score', 3);
      fixture.detectChanges();
      expect(component.scoreData.result).toBe('Pass');
      expect(component.failureReasons).toEqual([]);
      expect(fixture.nativeElement.querySelector('[role="status"]')).toBeNull();
    });

    it('reports both failing components', () => {
      component.tableData.score = [49, 49, 49, 19];
      component.updateGrade();
      expect(component.scoreData.result).toBe('Fail');
      expect(component.failureReasons.length).toBe(3);
      expect(component.failureReasons[0]).toContain('Carry marks');
      expect(component.failureReasons[1]).toContain('The final exam score');
    });

    it('withholds results when a required component has zero weight', () => {
      component.tableData.weightage = [0, 0, 0, 100];
      component.tableData.score = [100, 100, 100, 100];
      component.updateGrade();
      expect(component.scoreData.carryPercent).toBeNaN();
      expect(component.scoreData.result).toBe('Check inputs');

      component.tableData.weightage = [40, 40, 20, 0];
      component.updateGrade();
      expect(component.scoreData.finalExamPercent).toBeNaN();
      expect(component.scoreData.result).toBe('Check inputs');
    });
  });


  describe('final exam score suggestions', () => {
    function setCarry(percent: number): void {
      component.tableData.score = [percent, percent, percent, 0];
      component.updateGrade();
    }

    it('suggests 50 out of 100 to pass when carry marks are barely passing', () => {
      setCarry(50);
      expect(component.examSuggestions[0].score).toBe(50);
      expect(component.examSuggestions[1].score).toBeNull();
      expect(component.examSuggestions[1].message).toContain('even with full marks');
    });

    it('suggests the minimum exam score for passing and an A with 60% carry', () => {
      setCarry(60);
      expect(component.examSuggestions.map(suggestion => suggestion.score)).toEqual([40, 100]);
      component.tableData.score[3] = 100;
      component.updateGrade();
      expect(component.scoreData.finalMarks).toBe(80);
      expect(component.scoreData.grade).toBe('A');
      expect(component.scoreData.result).toBe('Pass');
    });

    it('enforces the final exam minimum even with full carry marks', () => {
      setCarry(100);
      expect(component.examSuggestions.map(suggestion => suggestion.score)).toEqual([20, 60]);
    });

    it('does not suggest passing or an A when the carry component fails', () => {
      setCarry(49.99);
      component.examSuggestions.forEach(suggestion => {
        expect(suggestion.score).toBeNull();
        expect(suggestion.message).toContain('first pass the carry component');
      });
    });

    it('rounds up for changed weights and gives the smallest whole passing score', () => {
      component.tableData.weightage = [10, 10, 10, 70];
      setCarry(60);
      const score = component.examSuggestions[0].score!;
      expect(score).toBe(46);
      component.tableData.score[3] = score;
      component.updateGrade();
      expect(component.scoreData.result).toBe('Pass');
      component.tableData.score[3] = score - 1;
      component.updateGrade();
      expect(component.scoreData.result).toBe('Fail');
    });

    it('uses the final exam total marks and ignores the currently entered exam score', () => {
      component.tableData.totalMarks[3] = 200;
      setCarry(60);
      expect(component.examSuggestions.map(suggestion => suggestion.score)).toEqual([80, 200]);
      component.tableData.score[3] = 160;
      component.updateGrade();
      expect(component.examSuggestions.map(suggestion => suggestion.score)).toEqual([80, 200]);
    });

    it('updates the displayed suggestions after editing carry scores', () => {
      setCarry(60);
      fixture.detectChanges();
      const section: HTMLElement = fixture.nativeElement.querySelector('#exam-targets');
      expect(section.textContent).toContain('Score at least 40 out of 100');
      spyOn(window, 'prompt').and.returnValue('100');
      component.editCell('score', 0);
      fixture.detectChanges();
      expect(section.textContent).toContain('Score at least 24 out of 100');
      expect(section.textContent).toContain('Score at least 84 out of 100');
    });

    it('withholds suggestions for invalid scores, totals, or weights', () => {
      setCarry(60);
      const invalidInputs = [
        () => component.tableData.weightage[0] = 30,
        () => component.tableData.weightage = [40, 40, 20, 0],
        () => component.tableData.totalMarks[0] = 0,
        () => component.tableData.totalMarks[3] = 0,
        () => component.tableData.score[0] = 101,
        () => component.tableData.score[0] = -1,
        () => component.tableData.score[0] = NaN,
      ];
      invalidInputs.forEach(invalidate => {
        component.tableData.weightage = [20, 20, 10, 50];
        component.tableData.totalMarks = [100, 100, 100, 100];
        setCarry(60);
        invalidate();
        component.updateGrade();
        component.examSuggestions.forEach(suggestion => {
          expect(suggestion.score).toBeNull();
          expect(suggestion.message).toContain('Enter valid');
        });
      });
    });
  });

});

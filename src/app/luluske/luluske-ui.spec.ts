import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LuluskeComponent } from './luluske.component';

describe('Luluske redesigned worksheet', () => {
  let fixture: ComponentFixture<LuluskeComponent>;
  let component: LuluskeComponent;
  let root: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [LuluskeComponent] }).compileComponents();
    fixture = TestBed.createComponent(LuluskeComponent);
    component = fixture.componentInstance;
    root = fixture.nativeElement;
    fixture.detectChanges();
  });

  function openField(index: number): HTMLInputElement {
    root.querySelectorAll<HTMLButtonElement>('.cell-button')[index].click();
    fixture.detectChanges();
    return root.querySelector<HTMLInputElement>('#assessment-value')!;
  }

  function enter(value: string): void {
    const input = root.querySelector<HTMLInputElement>('#assessment-value')!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  function apply(): void {
    root.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    fixture.detectChanges();
  }

  it('renders 16 labelled edit buttons with no duplicate fields', () => {
    const buttons = root.querySelectorAll<HTMLButtonElement>('.cell-button');
    expect(buttons.length).toBe(16);
    expect(new Set(Array.from(buttons, button => button.getAttribute('aria-label'))).size).toBe(16);
    expect(root.querySelectorAll('main').length).toBe(1);
    expect(root.querySelector('h1')?.textContent).toBe('luluske?');
    expect(root.querySelector('[data-testid="course-result"]')?.textContent).toBe('Pass');
  });

  for (let row = 0; row < 4; row++) {
    ['assignment', 'weightage', 'totalMarks', 'score'].forEach((column, field) => {
      it(`commits the ${column} field at position ${row} to the matching assessment`, () => {
        const input = openField(row * 4 + field);
        const value = column === 'assignment' ? 'New assessment' : column === 'totalMarks' ? '120' : '42';
        expect(document.activeElement).toBe(input);
        enter(value);
        apply();
        const data = component.tableData as unknown as Record<string, (number | string)[]>;
        expect(data[column][row]).toBe(column === 'assignment' ? value : Number(value));
        expect(root.querySelector('form')).toBeNull();
        expect(document.activeElement).toBe(root.querySelectorAll('.cell-button')[row * 4 + field]);
      });
    });
  }

  it('holds draft changes until Apply and announces committed results and targets', () => {
    openField(3);
    enter('40');
    fixture.detectChanges();
    expect(component.tableData.score[0]).toBe(80);
    expect(component.scoreData.finalMarks).toBe(68);
    apply();
    expect(component.scoreData.finalMarks).toBe(60);
    expect(root.querySelector('[aria-live="polite"]')?.textContent).toContain('grade B-, Pass');
    expect(root.querySelector('[aria-live="polite"]')?.textContent).toContain('Pass the course:');
  });

  it('rejects invalid text inline and leaves committed data unchanged', () => {
    openField(3);
    enter('10abc');
    apply();
    expect(component.tableData.score[0]).toBe(80);
    expect(component.scoreData.finalMarks).toBe(68);
    expect(root.querySelector('#edit-error')?.textContent).toBe('Please enter a valid number');
    expect(root.querySelector('input')?.getAttribute('aria-invalid')).toBe('true');
    expect(root.querySelector('input')?.getAttribute('aria-describedby')).toContain('edit-error');
    enter('90');
    apply();
    expect(component.tableData.score[0]).toBe(90);
  });

  it('cancels with Escape and returns focus without changing state', () => {
    openField(3);
    enter('0');
    root.querySelector('input')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(component.tableData.score[0]).toBe(80);
    expect(root.querySelector('form')).toBeNull();
    expect(document.activeElement).toBe(root.querySelectorAll('.cell-button')[3]);
  });

  it('does not commit or discard a draft on blur or when another field is selected', () => {
    const input = openField(3);
    enter('88');
    input.dispatchEvent(new Event('blur'));
    root.querySelectorAll<HTMLButtonElement>('.cell-button')[7].click();
    fixture.detectChanges();
    expect(root.querySelector<HTMLInputElement>('input')?.value).toBe('88');
    expect(component.tableData.score[0]).toBe(80);
    expect(root.querySelector('#edit-error')?.textContent).toContain('Apply or cancel');
    root.querySelector<HTMLButtonElement>('.secondary-button')!.click();
    fixture.detectChanges();
    expect(root.querySelector('form')).toBeNull();
  });

  ['0', '1e2', '0x10', '49.999'].forEach(value => {
    it(`preserves Number conversion for score input ${JSON.stringify(value)}`, () => {
      openField(3);
      enter(value);
      apply();
      expect(component.tableData.score[0]).toBe(Number(value));
      expect(root.querySelector('#edit-error')).toBeNull();
    });
  });

  it('allows blank and duplicate names without changing positional roles', () => {
    openField(0);
    enter('');
    apply();
    expect(component.tableData.assignment[0]).toBe('');
    expect(root.querySelector('.name-button')?.getAttribute('aria-label')).toContain('Carry 1');
    openField(12);
    enter('Quiz');
    apply();
    expect(component.tableData.assignment[3]).toBe('Quiz');
    expect(root.querySelectorAll('.role-chip')[3].textContent).toBe('Final examination');
    expect(component.scoreData.finalMarks).toBe(68);
  });

  it('withholds results for unbalanced weights and restores them after correction', () => {
    openField(1);
    enter('30');
    apply();
    expect(component.totalWeight).toBe(110);
    expect(component.scoreData.result).toBe('Check inputs');
    expect(root.querySelector('#weight-warning')?.textContent).toContain('It is now 110');
    expect(root.querySelector('[data-testid="course-result"]')).toBeNull();
    expect(root.querySelector('#exam-targets')?.textContent).toContain('Enter valid');
    openField(5);
    enter('10');
    apply();
    expect(component.totalWeight).toBe(100);
    expect(component.scoreData.result).toBe('Pass');
    expect(root.querySelector('[data-testid="course-result"]')?.textContent).toBe('Pass');
    expect(root.querySelector('#weight-warning')).toBeNull();
  });

  ['', '   ', '-5', 'Infinity', '-Infinity', '1e309', '101'].forEach(value => {
    it(`rejects invalid score input ${JSON.stringify(value)} without changing the result`, () => {
      openField(3);
      enter(value);
      apply();
      expect(component.tableData.score[0]).toBe(80);
      expect(component.scoreData.finalMarks).toBe(68);
      expect(root.querySelector('#edit-error')?.textContent).not.toBe('');
      expect(root.querySelector('input')?.getAttribute('aria-invalid')).toBe('true');
    });
  });

  for (let row = 0; row < 4; row++) {
    it(`rejects a total below the existing score for assessment ${row + 1}`, () => {
      openField(row * 4 + 2);
      enter('30');
      apply();
      expect(component.tableData.totalMarks[row]).toBe(100);
      expect(component.scoreData.finalMarks).toBe(68);
      expect(root.querySelector('#edit-error')?.textContent).toContain('Total marks cannot be less than the current score');
      expect(root.querySelector('form')).not.toBeNull();
      enter('120');
      apply();
      expect(component.tableData.totalMarks[row]).toBe(120);
      expect(root.querySelector('form')).toBeNull();
    });

    it(`rejects a score above the total for assessment ${row + 1}`, () => {
      const original = component.tableData.score[row];
      openField(row * 4 + 3);
      enter('101');
      apply();
      expect(component.tableData.score[row]).toBe(original);
      expect(root.querySelector('#edit-error')?.textContent).toBe('The score cannot exceed the total marks.');
    });

    it(`warns about an invalid existing score in assessment ${row + 1}`, () => {
      component.tableData.score[row] = 101;
      component.updateGrade();
      fixture.detectChanges();
      expect(root.querySelector(`#score-warning-${row}`)?.textContent).toContain('cannot exceed');
      expect(root.querySelector('[data-testid="course-result"]')).toBeNull();
      expect(root.querySelector('#exam-targets .target-number')).toBeNull();
    });
  }

  it('shows independent grade and failure reasons even with a high overall mark', () => {
    component.tableData.score = [100, 100, 100, 19.99];
    component.updateGrade();
    fixture.detectChanges();
    expect(root.querySelector('[data-testid="letter-grade"]')?.textContent).toBe('B-');
    expect(root.querySelector('[data-testid="course-result"]')?.textContent).toBe('Fail');
    expect(root.querySelector('.failure-reasons')?.textContent).toContain('final exam score is below 20%');
    expect(root.querySelectorAll('.conditions .not-met').length).toBe(1);
  });
});

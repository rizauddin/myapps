import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'myapps2' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('myapps2');
  });

  it('should render the copyright range ending in the current year', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('footer')?.textContent)
      .toContain(`Copyright 2024-${new Date().getFullYear()}`);
  });

  it('limits the redesigned footer to Luluske and preserves other route styling', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.componentInstance.onRouteActivate({ layout: 'luluske' });
    fixture.detectChanges();
    const footer: HTMLElement = fixture.nativeElement.querySelector('footer');
    expect(footer.classList.contains('luluske-footer')).toBeTrue();
    expect(footer.classList.contains('bg-light')).toBeFalse();
    expect(footer.querySelector('p p')).toBeNull();
    expect(footer.querySelector('a')?.getAttribute('href')).toBe('https://www.rizauddin.com');

    fixture.componentInstance.onRouteActivate({});
    fixture.detectChanges();
    expect(footer.classList.contains('luluske-footer')).toBeFalse();
    expect(footer.classList.contains('bg-light')).toBeTrue();
  });
});

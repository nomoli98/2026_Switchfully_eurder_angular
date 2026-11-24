import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ThemeToggleComponent } from './theme-toggle.component';
import { Theme, ThemeService } from '../../core/services/theme.service';

describe('ThemeToggleComponent', () => {
  let fixture: ComponentFixture<ThemeToggleComponent>;
  let el: HTMLElement;
  const theme = signal<Theme>('light');
  const service = { theme, toggle: vi.fn(() => theme.update((t) => (t === 'dark' ? 'light' : 'dark'))) };

  beforeEach(async () => {
    theme.set('light');
    service.toggle.mockClear();
    await TestBed.configureTestingModule({
      imports: [ThemeToggleComponent],
      providers: [{ provide: ThemeService, useValue: service }],
    }).compileComponents();

    fixture = TestBed.createComponent(ThemeToggleComponent);
    el = fixture.nativeElement;
    await fixture.whenStable();
  });

  const button = () => el.querySelector('button') as HTMLButtonElement;

  it('offers to switch to dark while in light mode', () => {
    expect(button().getAttribute('aria-label')).toBe('Switch to dark theme');
    expect(button().textContent).toContain('Dark theme');
  });

  it('offers to switch to light while in dark mode', async () => {
    theme.set('dark');
    await fixture.whenStable();
    expect(button().getAttribute('aria-label')).toBe('Switch to light theme');
    expect(button().textContent).toContain('Light theme');
  });

  it('toggles the theme on click', async () => {
    button().click();
    await fixture.whenStable();
    expect(service.toggle).toHaveBeenCalledTimes(1);
    expect(button().getAttribute('aria-label')).toBe('Switch to light theme');
  });

  it('is a plain button so it never submits a form', () => {
    expect(button().type).toBe('button');
  });
});

import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { FooterComponent } from './footer.component';
import { q, text } from '../../../testing/fixtures';

describe('FooterComponent', () => {
  it('shows the brand linking home', async () => {
    TestBed.configureTestingModule({ imports: [FooterComponent], providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(FooterComponent);
    await fixture.whenStable();
    const brand = q<HTMLAnchorElement>(fixture.nativeElement, '.navbar-brand');
    expect(text(brand)).toBe('Örder');
    expect(brand.getAttribute('href')).toBe('/');
  });
});

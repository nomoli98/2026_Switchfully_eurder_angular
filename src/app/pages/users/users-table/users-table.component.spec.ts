import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { UsersTableComponent } from './users-table.component';
import { makeUser, q, qa, text } from '../../../../testing/fixtures';

describe('UsersTableComponent', () => {
  let fixture: ComponentFixture<UsersTableComponent>;
  let el: HTMLElement;
  let navigateByUrl: any;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [UsersTableComponent],
      providers: [provideRouter([])],
    });
    navigateByUrl = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    fixture = TestBed.createComponent(UsersTableComponent);
    fixture.componentRef.setInput('_users', [
      makeUser({ id: 'u1', firstname: 'Ada', lastname: 'Lovelace' }),
      makeUser({ id: 'u2', firstname: 'Grace', lastname: 'Hopper' }),
    ]);
    await fixture.whenStable();
    el = fixture.nativeElement;
  });

  it('has headers #, Firstname, Lastname', () => {
    expect(qa(el, 'thead th').slice(0, 3).map(text)).toEqual(['#', 'Firstname', 'Lastname']);
  });

  it('shows id, first name and last name in the matching columns', () => {
    const row = qa(el, 'tbody tr')[0];
    expect(text(row.querySelector('th'))).toBe('u1');
    expect(
      qa(row as HTMLElement, 'td')
        .slice(0, 2)
        .map(text),
    ).toEqual(['Ada', 'Lovelace']);
  });

  it('shows a row per customer', () => {
    expect(qa(el, 'tbody tr')).toHaveLength(2);
  });

  it('Add Customer goes to the create page', () => {
    const add = q<HTMLButtonElement>(el, 'thead button');
    expect(text(add)).toBe('Add Customer');
    add.click();
    expect(String(navigateByUrl.mock.calls[0][0])).toBe('/customers/new');
  });

  it('View and Edit go to the detail and edit pages', () => {
    const [view, edit] = qa<HTMLButtonElement>(qa(el, 'tbody tr')[1] as HTMLElement, 'button');
    view.click();
    edit.click();
    expect(navigateByUrl.mock.calls.map((c: unknown[]) => String(c[0]))).toEqual([
      '/customers/u2',
      '/customers/u2/edit',
    ]);
  });
});

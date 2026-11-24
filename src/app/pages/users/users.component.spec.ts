import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { UsersComponent } from './users.component';
import { UserService } from '../../core/services/user/user.service';
import { makeUser, q, qa, text, typeInto } from '../../../testing/fixtures';

describe('UsersComponent', () => {
  let fixture: ComponentFixture<UsersComponent>;
  let el: HTMLElement;

  beforeEach(async () => {
    const users = [
      makeUser({ id: '1', firstname: 'Ada', lastname: 'Lovelace' }),
      makeUser({ id: '2', firstname: 'Grace', lastname: 'Hopper' }),
      makeUser({ id: '3', firstname: 'Alan', lastname: 'Turing' }),
    ];
    TestBed.configureTestingModule({
      imports: [UsersComponent],
      providers: [
        provideRouter([]),
        { provide: UserService, useValue: { getAllUsers: () => of(users) } },
      ],
    });
    fixture = TestBed.createComponent(UsersComponent);
    await fixture.whenStable();
    el = fixture.nativeElement;
  });

  const ids = () => qa(el, 'tbody th').map(text);
  const search = async (term: string) => {
    typeInto(q<HTMLInputElement>(el, 'input[type=search]'), term);
    await fixture.whenStable();
  };

  it('lists every customer', () => {
    expect(ids()).toEqual(['1', '2', '3']);
  });

  it('filters on last name, case-insensitive', async () => {
    await search('HOP');
    expect(ids()).toEqual(['2']);
  });

  it('does not filter on first name', async () => {
    await search('ada');
    expect(ids()).toEqual([]);
  });

  it('shows everyone again when the search is cleared', async () => {
    await search('tur');
    await search('');
    expect(ids()).toHaveLength(3);
  });
});

import { routes } from './user.routes';
import { UsersComponent } from './users.component';
import { CreateUserComponent } from './create-user/create-user.component';
import { DisplayUserComponent } from './display-user/display-user.component';
import { UpdateUserComponent } from './update-user/update-user.component';

describe('user routes', () => {
  it.each([
    ['', UsersComponent],
    ['new', CreateUserComponent],
    [':id', DisplayUserComponent],
    [':id/edit', UpdateUserComponent],
  ])('"%s" loads the right page', async (path, component) => {
    const route = routes.find((r) => r.path === path)!;
    expect(await (route.loadComponent as () => Promise<unknown>)()).toBe(component);
  });

  it('declares "new" before ":id"', () => {
    const paths = routes.map((r) => r.path);
    expect(paths.indexOf('new')).toBeLessThan(paths.indexOf(':id'));
  });
});

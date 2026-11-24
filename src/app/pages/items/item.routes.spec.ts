import { routes } from './item.routes';
import { ItemsComponent } from './items.component';
import { CreateItemComponent } from './create-item/create-item.component';
import { DisplayItemComponent } from './display-item/display-item.component';
import { UpdateItemComponent } from './update-item/update-item.component';

describe('item routes', () => {
  it.each([
    ['', ItemsComponent],
    ['new', CreateItemComponent],
    [':id', DisplayItemComponent],
    [':id/update', UpdateItemComponent],
  ])('"%s" loads the right page', async (path, component) => {
    const route = routes.find((r) => r.path === path)!;
    expect(await (route.loadComponent as () => Promise<unknown>)()).toBe(component);
  });

  it('declares "new" before ":id" so it is not read as an id', () => {
    const paths = routes.map((r) => r.path);
    expect(paths.indexOf('new')).toBeLessThan(paths.indexOf(':id'));
  });
});

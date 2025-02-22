import { supabase } from './index';

export interface MenuItem {
  id: string;
  title: string;
  icon?: string;
  path?: string;
  children?: MenuItem[];
  permissions?: string[];
}

export class NavigationService {
  async getNavigationItems(userRole: string): Promise<MenuItem[]> {
    const { data: menuItems } = await supabase
      .from('navigation_menu')
      .select('*')
      .order('order_index', { ascending: true });

    return this.filterAndStructureMenu(menuItems || [], userRole);
  }

  private filterAndStructureMenu(items: any[], userRole: string): MenuItem[] {
    const rootItems = items.filter(item => !item.parent_id);
    return rootItems.map(item => this.buildMenuItem(item, items, userRole));
  }

  private buildMenuItem(item: any, allItems: any[], userRole: string): MenuItem {
    const children = allItems
      .filter(child => child.parent_id === item.id)
      .map(child => this.buildMenuItem(child, allItems, userRole));

    const menuItem: MenuItem = {
      id: item.id,
      title: item.title,
      icon: item.icon,
      path: item.path,
      permissions: item.permissions
    };

    if (children.length > 0) {
      menuItem.children = children;
    }

    return menuItem;
  }

  async saveNavigationStructure(items: MenuItem[]) {
    const { error } = await supabase
      .from('navigation_menu')
      .upsert(this.flattenMenuItems(items));

    if (error) throw error;
  }

  private flattenMenuItems(items: MenuItem[], parentId: string | null = null, order: number = 0): any[] {
    let flattened: any[] = [];
    
    items.forEach((item, index) => {
      flattened.push({
        id: item.id,
        title: item.title,
        icon: item.icon,
        path: item.path,
        parent_id: parentId,
        order_index: order + index,
        permissions: item.permissions
      });

      if (item.children) {
        flattened = flattened.concat(
          this.flattenMenuItems(item.children, item.id, (order + index) * 1000)
        );
      }
    });

    return flattened;
  }
}
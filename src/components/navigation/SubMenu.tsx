import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { MenuItem } from '../../services/api/NavigationService';

interface SubMenuProps {
  item: MenuItem;
  level?: number;
}

export function SubMenu({ item, level = 0 }: SubMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const hasChildren = item.children && item.children.length > 0;

  const handleClick = () => {
    if (hasChildren) {
      setIsOpen(!isOpen);
    } else if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <div className="menu-item-enter">
      <button
        onClick={handleClick}
        className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200
          ${level === 0 
            ? 'text-gray-900 hover:bg-gray-100' 
            : 'text-gray-700 hover:bg-gray-50'
          }
          ${level > 0 ? `pl-${4 + level * 4}` : ''}`}
      >
        {item.icon && (
          <span className="mr-3 text-gray-500">
            {/* Render icon component based on icon name */}
          </span>
        )}
        <span className="flex-1 text-left">{item.title}</span>
        {hasChildren && (
          <span className="ml-2">
            {isOpen ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            )}
          </span>
        )}
      </button>

      {hasChildren && isOpen && (
        <div className="mt-1 space-y-1">
          {item.children.map((child) => (
            <SubMenu key={child.id} item={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
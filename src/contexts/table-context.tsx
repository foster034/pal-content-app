'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface TableStyle {
  borderStyle: 'shadow' | 'border' | 'minimal' | 'none';
  cornerRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  backgroundColor: 'white' | 'gray' | 'transparent';
  headerStyle: 'gray' | 'dark' | 'primary' | 'minimal';
}

interface TableContextType {
  tableStyle: TableStyle;
  setTableStyle: (style: TableStyle) => void;
  updateTableStyleProperty: <K extends keyof TableStyle>(property: K, value: TableStyle[K]) => void;
  getTableClasses: () => {
    wrapper: string;
    table: string;
    header: string;
  };
}

const defaultTableStyle: TableStyle = {
  borderStyle: 'minimal',
  cornerRadius: 'lg',
  backgroundColor: 'white',
  headerStyle: 'gray',
};

const TableContext = createContext<TableContextType | undefined>(undefined);

export function TableProvider({ children }: { children: React.ReactNode }) {
  const [tableStyle, setTableStyle] = useState<TableStyle>(defaultTableStyle);

  // Load saved preferences on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tableStyle');
      if (saved) {
        try {
          setTableStyle(JSON.parse(saved));
        } catch (error) {
          console.error('Failed to parse saved table style:', error);
        }
      }
    }
  }, []);

  // Save preferences when changed
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tableStyle', JSON.stringify(tableStyle));
    }
  }, [tableStyle]);

  const updateTableStyleProperty = <K extends keyof TableStyle>(
    property: K,
    value: TableStyle[K]
  ) => {
    setTableStyle(prev => ({ ...prev, [property]: value }));
  };

  const getTableClasses = () => {
    const borderClasses = {
      shadow: 'shadow-md',
      border: 'border border-gray-200 dark:border-gray-700',
      minimal: 'border border-gray-100 dark:border-gray-800',
      none: '',
    };

    const radiusClasses = {
      none: '',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
    };

    const bgClasses = {
      white: 'bg-white dark:bg-gray-900',
      gray: 'bg-gray-50 dark:bg-gray-800',
      transparent: 'bg-transparent',
    };

    const headerClasses = {
      gray: 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-400',
      dark: 'bg-gray-800 dark:bg-gray-900 text-white',
      primary: 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
      minimal: 'bg-transparent text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700',
    };

    return {
      wrapper: `relative overflow-x-auto ${borderClasses[tableStyle.borderStyle]} ${radiusClasses[tableStyle.cornerRadius]} ${bgClasses[tableStyle.backgroundColor]}`,
      table: 'w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400',
      header: `text-xs uppercase ${headerClasses[tableStyle.headerStyle]}`,
    };
  };

  return (
    <TableContext.Provider value={{
      tableStyle,
      setTableStyle,
      updateTableStyleProperty,
      getTableClasses,
    }}>
      {children}
    </TableContext.Provider>
  );
}

export function useTable() {
  const context = useContext(TableContext);
  if (context === undefined) {
    throw new Error('useTable must be used within a TableProvider');
  }
  return context;
}
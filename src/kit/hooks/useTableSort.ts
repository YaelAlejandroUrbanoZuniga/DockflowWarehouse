import { useMemo, useState } from 'react';
import { faArrowDown, faArrowUp } from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

export type SortableValue = string | number | Date | null | undefined;
export type SortDirection = 'asc' | 'desc' | null;

export function useTableSort<T>(rows: T[], getValue: (row: T, key: string) => SortableValue) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const toggleSort = (key: string) => {
    if (key !== sortKey) {
      setSortKey(key);
      setSortDirection('asc');
    } else if (sortDirection === 'asc') {
      setSortDirection('desc');
    } else {
      setSortKey(null);
      setSortDirection(null);
    }
  };

  const sortedRows = useMemo(() => {
    if (sortKey === null || sortDirection === null) return rows;

    return [...rows].sort((a, b) => {
      const va = getValue(a, sortKey);
      const vb = getValue(b, sortKey);

      const aEmpty = va == null || va === '';
      const bEmpty = vb == null || vb === '';
      if (aEmpty && bEmpty) return 0;
      if (aEmpty) return 1;
      if (bEmpty) return -1;

      let cmp: number;
      if (va instanceof Date && vb instanceof Date) {
        cmp = va.getTime() - vb.getTime();
      } else if (typeof va === 'number' && typeof vb === 'number') {
        cmp = va - vb;
      } else {
        cmp = String(va).localeCompare(String(vb));
      }

      return sortDirection === 'asc' ? cmp : -cmp;
    });
  }, [rows, sortKey, sortDirection, getValue]);

  return { sortedRows, sortKey, sortDirection, toggleSort };
}

export function sortIcon(key: string, sortKey: string | null, sortDirection: SortDirection): { icon: IconDefinition; color: string } {
  if (sortKey !== key) return { icon: faArrowUp, color: '#D1D3D4' };
  return { icon: sortDirection === 'desc' ? faArrowDown : faArrowUp, color: '#000000' };
}

declare module 'react-window' {
  import React from 'react';

  export interface FixedSizeListProps {
    children: React.ComponentType<any>;
    height: number;
    itemCount: number;
    itemSize: number | ((index: number) => number);
    itemData?: any;
    overscanCount?: number;
    className?: string;
    style?: React.CSSProperties;
  }

  export class FixedSizeList extends React.Component<FixedSizeListProps> {
    scrollToItem(
      index: number,
      align?: 'auto' | 'smart' | 'center' | 'end' | 'start',
    ): void;
  }

  export function areEqual(prevProps: any, nextProps: any): boolean;
}

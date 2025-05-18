import { create } from 'zustand';
import { ChildResponseDto } from '@/types/models';

interface ChildrenState {
  children: ChildResponseDto[];
  currentChild: ChildResponseDto | null;
  setChildren: (children: ChildResponseDto[]) => void;
  setCurrentChild: (child: ChildResponseDto | null) => void;
  clearChildren: () => void;
}

export const useChildrenStore = create<ChildrenState>((set) => ({
  children: [],
  currentChild: null,
  setChildren: (children) => set({ children }),
  setCurrentChild: (child) => set({ currentChild: child }),
  clearChildren: () => set({ children: [], currentChild: null }),
}));

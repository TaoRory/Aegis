"use client";

import { useSyncExternalStore } from "react";

import { serverSpaceState, spaceStore } from "@/components/space/space-store";

type SpaceState = ReturnType<typeof spaceStore.get>;

/**
 * Đọc một trường nguyên thủy của store (zone, mode, ready…). Trả giá trị cũ nếu không đổi nên không re-render thừa.
 * SSR luôn nhận trạng thái mặc định (hub, bản phẳng).
 */
export function useSpace<K extends keyof SpaceState>(key: K): SpaceState[K] {
  return useSyncExternalStore(
    spaceStore.subscribe,
    () => spaceStore.get()[key],
    () => serverSpaceState[key],
  );
}

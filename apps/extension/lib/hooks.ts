import { useEffect, useState } from "react";
import type { WxtStorageItem } from "wxt/utils/storage";

/** Live value of a storage item; undefined until first read. */
export function useItem<T>(item: WxtStorageItem<T, Record<string, unknown>>): T | undefined {
  const [value, setValue] = useState<T>();
  useEffect(() => {
    void item.getValue().then(setValue);
    return item.watch((v) => setValue(v));
  }, [item]);
  return value;
}

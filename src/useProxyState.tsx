import { DependencyList, useEffect, useState } from "react";

export function useProxyState<S>(source: () => S, deps?: DependencyList): [S, () => void] {
    const [value, setValue] = useState<S>(source);
    let onValueChanged = () => setValue(s => source());
    useEffect(() => onValueChanged(), deps)
    return [value, onValueChanged];
}

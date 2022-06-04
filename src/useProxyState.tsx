import { useState } from "react";

export function useProxyState(source) {
    const [value, setValue] = useState(s => source());
    let onValueChanged = () => setValue(s => source());
    return [value, onValueChanged];
}

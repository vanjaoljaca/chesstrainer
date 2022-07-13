import { DependencyList, useEffect, useState } from "react";

// Does this hook even make sense??
// ok it kinda makes sense as useProxyState(() => trainer.orientation, [trainer])
// but does it? because is trainer changing?? deps is not deep compare is it??

// the basic idea of this is that a component shouldn't be modifying it's props
// so this kinda turns a prop into your internal state
// allowing the parent to own more of the control
// is this a good idea?
// feels very mvvm
// but i dont want to deal with a big back end and message parsing and copying into the view...

export function useProxyState<S>(source: () => S, deps?: DependencyList): [S, () => void] {
    deps = deps || [];
    const [value, setValue] = useState<S>(source);
    let onValueChanged = () => setValue(_ => source());
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => onValueChanged(), [source(), ...deps])
    return [value, onValueChanged];
}


export function useProxyStates(sources: (() => unknown)[], deps?: DependencyList): [...unknown[], () => void] {
    deps = deps || [];
    var values = [];
    var setValues = [];
    for (let s of sources) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        let [value, setValue] = useState(s);
        values.push(value);
        setValues.push(setValue);
    }
    let onProxyChanged = () => {
        for (let i = 0; i < sources.length; i++) {
            setValues[i]((_: any) => sources[i]());
        }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => onProxyChanged(), [...deps])
    return [...values, onProxyChanged];
}

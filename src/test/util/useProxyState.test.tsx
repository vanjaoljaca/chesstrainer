import React, { useState } from 'react';
import { render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event'
import { useProxyState, useRefreshingState } from "../../util/useProxyState";

// the basic idea of this is when you want to use a prop as your state
// you don't change the prop reference, you change the contents of the prop
// then you need to trigger a rerender without much drama
// i must be doing something weird

function TestComponent({ payload, nextValue }) {
    const [proxy, onPayloadChanged] = useProxyState(() => payload.data);
    function handleClick() {
        // pretend this is something that happens in the backend
        payload.data = nextValue;
        onPayloadChanged();
    }
    return <button onClick={handleClick}>{proxy}</button >;
}

test('renders learn react link', async () => {
    let original = 'original'
    let wrapper = { data: original }
    let nextValue = 'nextValid'

    render(<TestComponent payload={wrapper} nextValue={nextValue} />);

    // expect initial value to be good
    const btn = screen.getByText(original);
    expect(btn).toBeInTheDocument();
    // simulate change in backend, expect no update
    // this is to ensure that we are simulating react behavior
    wrapper.data = 'intermediate'
    expect(btn).toHaveTextContent(original);
    userEvent.click(btn); // triggers internal onChanged for useProxyState
    expect(btn).toHaveTextContent(nextValue);
});

test('blarg2', async () => {
    // with this method you don't even need to call trigger onChanged
    let original = 'original';
    let prop = { data: original }
    let view = renderHook((p) => useProxyState(() => p.data), { initialProps: prop });
    expect(view.result.current[0]).toBe(original)
    prop.data = 'intermediate'
    expect(view.result.current[0]).toBe(original)
    view.rerender(prop)
    expect(view.result.current[0]).toBe(prop.data)
    prop.data = 'nextValid'
    view.result.current[1](); // trigger onChanged
    expect(view.result.current[0]).toBe('intermediate') // saved from last render
    view.rerender(prop)
    expect(view.result.current[0]).toBe(prop.data)
})

test('proof that use state doesnt work as desired. this is not surprising. i thought useState had deps but it doesnt so this is silly', async () => {
    let original = 'original';
    let prop = { data: original }
    let view = renderHook((p) => useState(() => p.data), { initialProps: prop });
    expect(view.result.current[0]).toBe(original)
    prop.data = 'intermediate'
    expect(view.result.current[0]).toBe(original)
    view.rerender(prop)
    expect(view.result.current[0]).toBe(original)
    prop.data = 'nextValid'
    expect(view.result.current[0]).toBe(original)
    view.rerender(prop);
    expect(view.result.current[0]).toBe(original)
})

test('proxy states', async () => {
    // with this method you don't even need to call trigger onChanged
    // this is not that useful...
    let prop = { d1: '1', d2: '2', d3: '3' }
    let view = renderHook((p: any) => useRefreshingState([() => p.d1, () => p.d2, () => p.d3]), { initialProps: prop });

    expect(view.result.current[0]).toBe('1')
    expect(view.result.current[1]).toBe('2')
    expect(view.result.current[2]).toBe('3')
    prop.d1 = '7';
    expect(view.result.current[0]).toBe('1')
    view.rerender(prop)
    expect(view.result.current[0]).toBe('1')
    let triggerChanged = view.result.current[3]
    triggerChanged();
    view.rerender(prop)
    expect(view.result.current[0]).toBe('7')
})

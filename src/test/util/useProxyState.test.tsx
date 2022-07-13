import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event'
import { useProxyState } from "../../util/useProxyState";

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

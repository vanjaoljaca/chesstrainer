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
    expect(screen.getByText(original)).toBeInTheDocument();
    expect(screen.queryByText(nextValue)).not.toBeTruthy();

    // simulate change in backend, expect no update
    // this is to ensure that we are simulating react behavior
    wrapper.data = 'intermediate'
    expect(screen.queryByText(wrapper.data)).not.toBeTruthy();
    const btn = screen.getByText(original);
    expect(btn).toBeInTheDocument();
    expect(screen.queryByText(wrapper.data)).not.toBeTruthy();

    // click triggers internal 'onChanged()'
    userEvent.click(btn);

    // expect update
    const btn2 = screen.getByText(nextValue);
    expect(btn2).toBeInTheDocument();
    expect(screen.queryByText(original)).not.toBeTruthy();
});

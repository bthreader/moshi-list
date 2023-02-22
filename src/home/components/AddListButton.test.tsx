import React from 'react';
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event';
import AddListButton from "./AddListButton";

// Before each to define a local variable??

test('loads and displays speed dial icon', async () => {
    const mockOnChange = jest.fn(); 

    render(<AddListButton triggerListsChanged={mockOnChange}/>);

    expect(screen.getByLabelText('Add List Button')).toBeVisible();
})

test('clicking speed dial opens task dialog', async () => {
    const user = userEvent.setup()
    const mockOnChange = jest.fn(); 

    render(<AddListButton triggerListsChanged={mockOnChange}/>);

    await user.click(screen.getByLabelText('Add List Button'));
    expect(screen.getByLabelText('Add List Dialog')).toBeVisible();
})
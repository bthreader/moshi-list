import React from 'react';
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event';
import AddListButton from "./AddListButton";
import MockMsalContext from '../../core/MockMsalContext';

jest.mock('@azure/msal-react', () => ({
    useMsal: () => MockMsalContext,
}));

jest.mock('axios');

describe('AddListButton', () => {

    it('loads and displays speed dial icon', async () => {
        const mockOnSubmit = jest.fn(); 

        render(<AddListButton triggerListsChanged={mockOnSubmit}/>);

        expect(screen.getByLabelText('Add list button')).toBeVisible();
    })

    it('opens task dialog when button is clicked', async () => {
        const user = userEvent.setup()
        const mockOnSubmit = jest.fn(); 

        render(<AddListButton triggerListsChanged={mockOnSubmit}/>);

        await user.click(screen.getByLabelText('Add list button'));
        expect(screen.getByLabelText('Add list dialog')).toBeVisible();
    })

    it('calls the on submit function when add button is clicked on dialog',
        async () => {
            const user = userEvent.setup()
            const mockOnSubmit = jest.fn(); 

            render(<AddListButton triggerListsChanged={mockOnSubmit}/>);

            await user.click(screen.getByLabelText('Add list button'));
            await user.type(screen.getByLabelText('List name'), 'My List');
            await user.click(screen.getByLabelText('Submit add list'));
            expect(mockOnSubmit).toBeCalled();
        }
    )
})
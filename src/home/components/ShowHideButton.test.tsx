import React from 'react';
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event';
import AddListButton from "./AddListButton";
import MockMsalContext from '../../core/testing/MockMsalContext';
import ShowHideButton from './ShowHideButton';

jest.mock('@azure/msal-react', () => ({
    useMsal: () => MockMsalContext,
}));

jest.mock('axios');

describe('ShowHideButton', () => {

    it('displays a `show` prompt when completed tasks are hidden', () => {
        const mockSetShowComplete = jest.fn();

        render(<ShowHideButton setShowCompleted={mockSetShowComplete} showCompleted={false}/>);

        expect(screen.getByLabelText("Show completed tasks button")).toBeVisible();
        expect(screen.queryByLabelText("Hide completed tasks button")).toBeNull();
    })

    it('displays a `hide` prompt and a delete all button when completed tasks are hidden', () => {
        const mockSetShowComplete = jest.fn();

        render(<ShowHideButton setShowCompleted={mockSetShowComplete} showCompleted={true}/>);

        expect(screen.queryByLabelText("Show completed tasks button")).toBeNull();
        expect(screen.getByLabelText("Hide completed tasks button")).toBeVisible();
        expect(screen.getByLabelText("Delete all completed tasks button")).toBeVisible();
    })

    it('setShowComplete function is called with false when `hide` button is pressed', async () => {
        const mockSetShowComplete = jest.fn();
        const user = userEvent.setup()

        render(<ShowHideButton setShowCompleted={mockSetShowComplete} showCompleted={true}/>);

        await user.click(screen.getByLabelText("Hide completed tasks button"));

        expect(mockSetShowComplete).toBeCalledWith(false);
    })

    it('setShowComplete function is called with true when `show` button is pressed', async () => {
        const mockSetShowComplete = jest.fn();
        const user = userEvent.setup()

        render(<ShowHideButton setShowCompleted={mockSetShowComplete} showCompleted={false}/>);

        await user.click(screen.getByLabelText("Show completed tasks button"));

        expect(mockSetShowComplete).toBeCalledWith(true);
    })
})
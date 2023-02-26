import React from 'react';
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event';
import AddListButton from "./AddListButton";
import MockMsalContext from '../../core/testing/MockMsalContext';

jest.mock('@azure/msal-react', () => ({
    useMsal: () => MockMsalContext,
}));

jest.mock('axios');

describe('ShowHideButton', () => {

    it('by default is set to a `show` prompt', () => {
    })

    it('changes to a `hide` prompt after the user has clicked show', () => {
    })

    it('when the `hide` prompt is displayed, there is a delete all completed tasks button', () => {
    })

    it('clicking the delete all button triggers the delete all handler', () => {
    })
})
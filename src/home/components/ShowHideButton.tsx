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

    it('loads and displays speed dial icon but not dialog', () => {
    })
})
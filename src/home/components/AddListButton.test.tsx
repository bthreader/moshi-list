import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddListButton from './AddListButton';
import mockMsalContext from '../../core/testing/mockMsalContext';

jest.mock('@azure/msal-react', () => ({
  useMsal: () => mockMsalContext,
}));

jest.mock('axios');

describe('AddListButton', () => {
  it('loads and displays speed dial but not dialog', () => {
    const mockTriggerTasksChanged = jest.fn();

    render(<AddListButton triggerListsChanged={mockTriggerTasksChanged} />);

    expect(screen.getByLabelText('Add list button')).toBeVisible();
    expect(screen.queryByLabelText('Add list dialog')).toBeNull();
  });

  it('opens dialog when button is clicked', async () => {
    const user = userEvent.setup();
    const mockTriggerTasksChanged = jest.fn();

    render(<AddListButton triggerListsChanged={mockTriggerTasksChanged} />);

    await user.click(screen.getByLabelText('Add list button'));

    expect(screen.getByLabelText('Add list dialog')).toBeVisible();
  });

  it('calls the trigger function when add button is clicked on dialog', async () => {
    const user = userEvent.setup();
    const mockTriggerTasksChanged = jest.fn();

    render(<AddListButton triggerListsChanged={mockTriggerTasksChanged} />);

    await user.click(screen.getByLabelText('Add list button'));
    await user.type(screen.getByLabelText('List name'), 'My List');
    await user.click(screen.getByLabelText('Submit add list'));

    expect(mockTriggerTasksChanged).toBeCalled();
  });
});

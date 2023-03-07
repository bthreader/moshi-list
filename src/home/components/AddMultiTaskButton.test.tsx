import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddMultiTaskButton from './AddMultiTaskButton';
import MockMsalContext from '../../core/testing/mockMsalContext';

jest.mock('@azure/msal-react', () => ({
  useMsal: () => MockMsalContext,
}));

jest.mock('axios');

describe('AddMultiTaskButton', () => {
  it('button renders properly', () => {
    const mockTriggerTasksChanged = jest.fn();

    render(
      <AddMultiTaskButton
        triggerTasksChanged={mockTriggerTasksChanged}
        listId="hello"
        triggerLoading={jest.fn()}
      />
    );

    screen.getByLabelText('Add multiple tasks button');
    expect(screen.queryByLabelText('Add multiple tasks dialog')).toBeNull();
  });

  it('dialog to show when button is clicked', async () => {
    const user = userEvent.setup();
    const mockTriggerTasksChanged = jest.fn();

    render(
      <AddMultiTaskButton
        triggerTasksChanged={mockTriggerTasksChanged}
        listId="hello"
        triggerLoading={jest.fn()}
      />
    );

    await user.click(screen.getByLabelText('Add multiple tasks button'));

    screen.getByLabelText('Add multiple tasks dialog');
  });

  it('when a user enters a task, the Add X Tasks button text updates', async () => {
    const user = userEvent.setup();

    render(
      <AddMultiTaskButton
        triggerTasksChanged={jest.fn()}
        listId="hello"
        triggerLoading={jest.fn()}
      />
    );

    await user.click(screen.getByLabelText('Add multiple tasks button'));
    await user.type(
      screen.getByLabelText('Add multiple tasks text entry'),
      '- my task'
    );

    expect(
      screen.getByLabelText('Submit multiple tasks button')
    ).toHaveTextContent('Add 1');
  });

  it('when a user submits tasks, loading and tasks changed are triggered', async () => {
    const user = userEvent.setup();
    const mockTriggerTasksChanged = jest.fn();
    const mockTriggerLoading = jest.fn();

    render(
      <AddMultiTaskButton
        triggerTasksChanged={mockTriggerTasksChanged}
        listId="hello"
        triggerLoading={mockTriggerLoading}
      />
    );

    await user.click(screen.getByLabelText('Add multiple tasks button'));
    await user.type(
      screen.getByLabelText('Add multiple tasks text entry'),
      '- my task'
    );
    await user.click(screen.getByLabelText('Submit multiple tasks button'));

    expect(mockTriggerLoading).toBeCalled();
    expect(mockTriggerTasksChanged).toBeCalled();
  });
});

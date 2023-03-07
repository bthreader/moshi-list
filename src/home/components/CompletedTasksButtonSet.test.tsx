import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CompletedTasksButtonSet from './CompletedTasksButtonSet';

describe('CompletedTasksButtonSet', () => {
  it('displays a `show` prompt when completed tasks are hidden', () => {
    render(
      <CompletedTasksButtonSet
        setShowCompleted={jest.fn()}
        showCompleted={false}
        numberCompleted={10}
        handleDeleteAllCompleted={jest.fn()}
      />
    );

    expect(screen.getByLabelText('Show completed tasks button')).toBeVisible();
    expect(screen.queryByLabelText('Hide completed tasks button')).toBeNull();
    expect(
      screen.queryByLabelText('Delete all completed tasks button')
    ).toBeNull();
  });

  it('displays a `hide` prompt and a delete all completed button when >1 completed tasks are shown', () => {
    render(
      <CompletedTasksButtonSet
        setShowCompleted={jest.fn()}
        showCompleted={true}
        numberCompleted={10}
        handleDeleteAllCompleted={jest.fn()}
      />
    );

    expect(screen.queryByLabelText('Show completed tasks button')).toBeNull();
    expect(screen.getByLabelText('Hide completed tasks button')).toBeVisible();
    expect(
      screen.getByLabelText('Delete all completed tasks button')
    ).toBeVisible();
  });

  it('displays just a `hide` when one completed task is shown', () => {
    render(
      <CompletedTasksButtonSet
        setShowCompleted={jest.fn()}
        showCompleted={true}
        numberCompleted={1}
        handleDeleteAllCompleted={jest.fn()}
      />
    );

    expect(screen.queryByLabelText('Show completed tasks button')).toBeNull();
    expect(screen.getByLabelText('Hide completed tasks button')).toBeVisible();
    expect(
      screen.queryByLabelText('Delete all completed tasks button')
    ).toBeNull();
  });

  it('setShowComplete function is called with false when `hide` button is pressed', async () => {
    const mockSetShowComplete = jest.fn();
    const user = userEvent.setup();

    render(
      <CompletedTasksButtonSet
        setShowCompleted={mockSetShowComplete}
        showCompleted={true}
        numberCompleted={10}
        handleDeleteAllCompleted={jest.fn()}
      />
    );

    await user.click(screen.getByLabelText('Hide completed tasks button'));

    expect(mockSetShowComplete).toBeCalledWith(false);
  });

  it('setShowComplete function is called with true when `show` button is pressed', async () => {
    const mockSetShowComplete = jest.fn();
    const user = userEvent.setup();

    render(
      <CompletedTasksButtonSet
        setShowCompleted={mockSetShowComplete}
        showCompleted={false}
        numberCompleted={10}
        handleDeleteAllCompleted={jest.fn()}
      />
    );

    await user.click(screen.getByLabelText('Show completed tasks button'));

    expect(mockSetShowComplete).toBeCalledWith(true);
  });

  it('A dialog opens when the delete all completed button is pressed', async () => {
    const user = userEvent.setup();

    render(
      <CompletedTasksButtonSet
        setShowCompleted={jest.fn()}
        showCompleted={true}
        numberCompleted={10}
        handleDeleteAllCompleted={jest.fn()}
      />
    );

    await user.click(
      screen.getByLabelText('Delete all completed tasks button')
    );

    expect(
      screen.getByLabelText('Delete all completed tasks warning')
    ).toHaveTextContent('Are you sure you want to delete 10 completed tasks?');
    expect(
      screen.getByLabelText('Delete all completed tasks confirm button')
    ).toBeVisible();
    expect(
      screen.getByLabelText('Cancel delete all completed tasks button')
    ).toBeVisible();
  });

  it('When the delete completed tasks confirm button is pressed the handler is called', async () => {
    const user = userEvent.setup();
    const handleDeleteAllCompleted = jest.fn();

    render(
      <CompletedTasksButtonSet
        setShowCompleted={jest.fn()}
        showCompleted={true}
        numberCompleted={10}
        handleDeleteAllCompleted={handleDeleteAllCompleted}
      />
    );

    await user.click(
      screen.getByLabelText('Delete all completed tasks button')
    );
    await user.click(
      screen.getByLabelText('Delete all completed tasks confirm button')
    );

    expect(handleDeleteAllCompleted).toBeCalled();
  });
});

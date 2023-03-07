import { render, renderHook, screen } from '@testing-library/react';
import PinnedSection from './PinnedSection';
import userEvent from '@testing-library/user-event';

describe('PinnedSection', () => {
  it('displays nothing if the task is complete', () => {
    const { container } = render(
      <PinnedSection
        pinned={false}
        complete={true}
        taskIndex={0}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('displays a unpin task button if the task is pinned', () => {
    render(
      <PinnedSection
        pinned={true}
        complete={false}
        taskIndex={0}
      />
    );

    expect(screen.getByLabelText('Unpin task button')).toBeVisible();
    expect(screen.queryByLabelText('Pin task button')).toBeNull();
  });

  it('displays a not turned in icon if the task is not pinned', () => {
    render(
      <PinnedSection
        pinned={false}
        complete={false}
        taskIndex={0}
      />
    );

    expect(screen.getByLabelText('Pin task button')).toBeVisible();
    expect(screen.queryByLabelText('Unpin task button')).toBeNull();
  });

  it('calls the pinning handler with correct args when either turned in icon is clicked', async () => {
    const mockHandlePin = jest.fn();
    const user = userEvent.setup();

    render(
      <PinnedSection
        pinned={false}
        complete={false}
        taskIndex={0}
        handlePin={mockHandlePin}
      />
    );

    await user.click(screen.getByLabelText('Pin task button'));
    expect(mockHandlePin).toBeCalledTimes(1);
    expect(mockHandlePin).toBeCalledWith(0);

    render(
      <PinnedSection
        pinned={true}
        complete={false}
        taskIndex={1}
        handlePin={mockHandlePin}
      />
    );

    await user.click(screen.getByLabelText('Unpin task button'));
    expect(mockHandlePin).toBeCalledTimes(2);
    expect(mockHandlePin).toBeCalledWith(1);
  });
});

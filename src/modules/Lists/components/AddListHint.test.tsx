import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import AddListHint from './AddListHint';

describe('AddListHint', () => {
  it('renders properly', () => {
    render(<AddListHint />);

    expect(screen.queryByLabelText('Making notes gif')).toBeNull();
  });

  it('displays silly gif when hovering over the smiley face', async () => {
    const user = userEvent.setup();

    render(<AddListHint />);

    await user.hover(screen.getByText('😊'));

    expect(screen.getByLabelText('Making notes gif')).toBeVisible();
  });
});

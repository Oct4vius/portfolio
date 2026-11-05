import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Changelog } from '../../src/components/Changelog';
import type { Job } from '../../src/content/types';

const jobs: Job[] = [
  { id: 'sbg', company: 'A Co', role: 'Dev', period: '2025', summary: 'sum a', stack: ['X'], bullets: ['bullet a1', 'bullet a2'], current: true },
  { id: 'newfold', company: 'B Co', role: 'Eng', period: '2024', summary: 'sum b', stack: ['Y'], bullets: ['bullet b1'], current: false },
  { id: 'mediarev', company: 'C Co', role: 'Dev', period: '2023', summary: 'sum c', stack: ['Z'], bullets: ['bullet c1'], current: false },
];

function setup() {
  render(<Changelog jobs={jobs} />);
  return { user: userEvent.setup(), buttons: screen.getAllByRole('button') };
}

describe('Changelog', () => {
  it('buttons have concise accessible names', () => {
    setup();
    const btn = screen.getByRole('button', { name: /A Co/ });
    expect(btn).toHaveAccessibleName('A Co Dev 2025');
    expect(btn.getAttribute('aria-labelledby')).toBeTruthy();
    expect(btn).not.toHaveAccessibleName(/sum a|bullet a1|Show details|Hide details/);
  });

  it('first job starts expanded, others collapsed', () => {
    const { buttons } = setup();
    expect(buttons.map((b) => b.getAttribute('aria-expanded'))).toEqual(['true', 'false', 'false']);
    expect(screen.getByText('bullet a1')).toBeVisible();
    expect(screen.getByText('bullet b1').closest('.changelog-panel')).toHaveAttribute('hidden');
  });

  it('click toggles', async () => {
    const { user, buttons } = setup();
    await user.click(buttons[1]);
    expect(buttons[1]).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('bullet b1')).toBeVisible();
    await user.click(buttons[1]);
    expect(buttons[1]).toHaveAttribute('aria-expanded', 'false');
  });

  it('keyboard toggles', async () => {
    const { user, buttons } = setup();
    buttons[2].focus();
    await user.keyboard('{Enter}');
    expect(buttons[2]).toHaveAttribute('aria-expanded', 'true');
    await user.keyboard(' ');
    expect(buttons[2]).toHaveAttribute('aria-expanded', 'false');
  });

  it('aria-controls points at panel', () => {
    const { buttons } = setup();
    buttons.forEach((btn, i) => {
      const panel = document.getElementById(btn.getAttribute('aria-controls')!);
      expect(panel).toHaveTextContent(jobs[i].bullets[0]);
    });
  });
});

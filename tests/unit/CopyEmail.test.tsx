import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CopyEmail from '../../src/components/CopyEmail';

const props = {
  email: 'armando2445@outlook.com',
  copyLabel: 'Copy email',
  copiedLabel: 'Copied',
  copyFailedLabel: "Couldn't copy",
};

const original = Object.getOwnPropertyDescriptor(navigator, 'clipboard');

function setClipboard(value: unknown) {
  Object.defineProperty(navigator, 'clipboard', { value, configurable: true });
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  if (original) Object.defineProperty(navigator, 'clipboard', original);
  else delete (navigator as unknown as Record<string, unknown>).clipboard;
});

async function click() {
  await act(async () => {
    fireEvent.click(screen.getByRole('button'));
  });
}

describe('CopyEmail', () => {
  it('copies and confirms', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    setClipboard({ writeText });
    render(<CopyEmail {...props} />);
    expect(screen.getByRole('button')).toHaveTextContent('Copy email');

    await click();
    expect(writeText).toHaveBeenCalledWith('armando2445@outlook.com');
    expect(screen.getByRole('button')).toHaveTextContent('Copied');

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByRole('button')).toHaveTextContent('Copy email');
  });

  it('shows failure when clipboard rejects', async () => {
    setClipboard({ writeText: vi.fn().mockRejectedValue(new Error('denied')) });
    render(<CopyEmail {...props} />);
    await click();
    expect(screen.getByRole('button')).toHaveTextContent("Couldn't copy");
    expect(screen.getByText('armando2445@outlook.com')).toBeInTheDocument();
  });

  it('shows failure when clipboard API missing', async () => {
    setClipboard(undefined);
    render(<CopyEmail {...props} />);
    await click();
    expect(screen.getByRole('button')).toHaveTextContent("Couldn't copy");
  });
});

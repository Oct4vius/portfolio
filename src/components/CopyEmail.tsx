import { useEffect, useRef, useState } from 'react';
import './CopyEmail.css';

interface Props {
  email: string;
  copyLabel: string;
  copiedLabel: string;
  copyFailedLabel: string;
}

type Status = 'idle' | 'copied' | 'failed';

const RESET_MS = 2000;

export default function CopyEmail({ email, copyLabel, copiedLabel, copyFailedLabel }: Props) {
  const [status, setStatus] = useState<Status>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    let next: Status = 'failed';
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(email);
        next = 'copied';
      }
    } catch {
      next = 'failed';
    }
    setStatus(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus('idle'), RESET_MS);
  }

  const label = status === 'copied' ? copiedLabel : status === 'failed' ? copyFailedLabel : copyLabel;

  return (
    <div className="copy-email">
      <a className="copy-email-address mono" href={`mailto:${email}`}>
        {email}
      </a>
      <button type="button" className="copy-email-button" data-status={status} onClick={copy}>
        <span aria-live="polite">
          {/* key remounts the label so the short blur crossfade replays on each state change */}
          <span key={status} className="copy-email-label">
            {label}
          </span>
        </span>
      </button>
    </div>
  );
}

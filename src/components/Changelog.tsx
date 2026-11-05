import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import type { Job } from '../content/types';
import './Changelog.css';

interface Props {
  jobs: Job[];
}

export function Changelog({ jobs }: Props) {
  // The current job starts open so the depth is visible without interaction.
  const [open, setOpen] = useState<Set<string>>(
    () => new Set(jobs.filter((j) => j.current).map((j) => j.id)),
  );

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (!next.delete(id)) next.add(id);
      return next;
    });

  const reveal = (id: string) => setOpen((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));

  return (
    <ol className="changelog">
      {jobs.map((job, index) => {
        const expanded = open.has(job.id);
        const panelId = `changelog-panel-${job.id}`;
        const companyId = `changelog-company-${job.id}`;
        const roleId = `changelog-role-${job.id}`;
        const periodId = `changelog-period-${job.id}`;
        return (
          <li
            key={job.id}
            className="changelog-row"
            data-reveal
            data-current={job.current || undefined}
            style={{ '--i': index } as CSSProperties}
          >
            <button
              type="button"
              className="changelog-trigger"
              aria-expanded={expanded}
              aria-controls={panelId}
              aria-labelledby={`${companyId} ${roleId} ${periodId}`}
              onClick={() => toggle(job.id)}
            >
              <span id={periodId} className="changelog-period">{job.period}</span>
              <span className="changelog-title">
                <span id={companyId} className="changelog-company">{job.company}</span>
                <span id={roleId} className="changelog-role">{job.role}</span>
              </span>
              <span className="changelog-summary">{job.summary}</span>
              <span className="changelog-stack">
                {job.stack.map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </span>
              <span className="changelog-chevron" aria-hidden="true" />
            </button>
            <Panel id={panelId} expanded={expanded} onFound={() => reveal(job.id)}>
              <ul>
                {job.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </Panel>
          </li>
        );
      })}
    </ol>
  );
}

interface PanelProps {
  id: string;
  expanded: boolean;
  onFound: () => void;
  children: ReactNode;
}

// Closed panels use hidden="until-found" so find-in-page (Ctrl+F) and text fragments search the
// bullets and open the panel on a match. React only writes `hidden` as a boolean, so the value is
// set here; browsers without support treat it as plain `hidden`.
function Panel({ id, expanded, onFound, children }: PanelProps) {
  const ref = useRef<HTMLDivElement>(null);
  const onFoundRef = useRef(onFound);
  onFoundRef.current = onFound;

  useEffect(() => {
    const el = ref.current!;
    const handle = () => onFoundRef.current();
    el.addEventListener('beforematch', handle);
    return () => el.removeEventListener('beforematch', handle);
  }, []);

  useEffect(() => {
    const el = ref.current!;
    if (expanded) return;
    // A match before hydration already removed the attribute; adopt the open state.
    if (!el.hasAttribute('hidden')) onFoundRef.current();
    else el.setAttribute('hidden', 'until-found');
  }, [expanded]);

  return (
    <div ref={ref} id={id} className="changelog-panel" hidden={!expanded}>
      {children}
    </div>
  );
}

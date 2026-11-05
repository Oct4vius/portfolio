import { useState, type CSSProperties } from 'react';
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
            <div id={panelId} className="changelog-panel" hidden={!expanded}>
              <ul>
                {job.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

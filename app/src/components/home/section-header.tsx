import * as React from "react";

export function SectionHeader({
  title,
  subtitle,
  right,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-primary">{title}</h2>
        {subtitle ? <p className="text-secondary mt-1">{subtitle}</p> : null}
      </div>
      {right ? <div className="mt-4 md:mt-0">{right}</div> : null}
    </div>
  );
}

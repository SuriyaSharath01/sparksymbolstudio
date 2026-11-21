import type { CommunicationPassport } from '../types/passport';

function escapeCsvCell(value: string): string {
  const safe = value.replace(/"/g, '""');
  return /[",\n\r]/.test(safe) ? `"${safe}"` : safe;
}

export function exportCQCEvidence(passports: CommunicationPassport[]): void {
  const headers = [
    'Passport ID',
    'Resident Initials',
    'Font Preference',
    'Low Arousal',
    'Last Reviewed',
    'Next Review Due',
    'Review Count',
    'Status',
  ];

  const now = new Date();
  const rows = passports.map((p) => {
    const isOverdue = new Date(p.nextReviewDue) < now;
    return [
      escapeCsvCell(p.id),
      escapeCsvCell(p.residentInitials || 'Unspecified'),
      escapeCsvCell(p.profile.fontFamily),
      escapeCsvCell(p.profile.requiresLowArousal ? 'Yes' : 'No'),
      escapeCsvCell(p.lastReviewedAt || 'Never'),
      escapeCsvCell(p.nextReviewDue),
      escapeCsvCell(String(p.reviewLog.length)),
      escapeCsvCell(isOverdue ? 'OVERDUE' : 'Compliant'),
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `CQC_AIS_Evidence_${now.toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

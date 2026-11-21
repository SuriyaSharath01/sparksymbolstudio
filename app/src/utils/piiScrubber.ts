export interface PiiRedactionItem {
  type: 'NHS Number' | 'UK Postcode' | 'Phone Number' | 'Date / DOB' | 'Email Address';
  original: string;
  replacement: string;
}

export interface PiiScrubResult {
  scrubbedText: string;
  redactions: PiiRedactionItem[];
}

export function scrubClinicalText(input: string): PiiScrubResult {
  const redactions: PiiRedactionItem[] = [];
  let text = input;

  const patterns: {
    type: PiiRedactionItem['type'];
    regex: RegExp;
    replacement: string;
  }[] = [
    {
      type: 'NHS Number',
      regex: /\b\d{3}[\s-]?\d{3}[\s-]?\d{4}\b/g,
      replacement: '[NHS_NUMBER]',
    },
    {
      type: 'UK Postcode',
      regex: /\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/gi,
      replacement: '[UK_POSTCODE]',
    },
    {
      type: 'Phone Number',
      regex: /\b(?:\+44\s?7\d{3}|\(?07\d{3}\)?|\(?01\d{3}\)?|\(?02\d\)?)\s?\d{3}\s?\d{3,4}\b/g,
      replacement: '[PHONE_NUMBER]',
    },
    {
      type: 'Email Address',
      regex: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
      replacement: '[EMAIL]',
    },
    {
      type: 'Date / DOB',
      regex: /\b(?:\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4}|\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})\b/gi,
      replacement: '[DATE]',
    },
  ];

  for (const rule of patterns) {
    text = text.replace(rule.regex, (match) => {
      redactions.push({
        type: rule.type,
        original: match,
        replacement: rule.replacement,
      });
      return rule.replacement;
    });
  }

  return { scrubbedText: text, redactions };
}

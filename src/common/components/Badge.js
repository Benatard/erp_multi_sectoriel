import React from 'react';
import { TONE_CLASSES } from '../utils/labels';

export default function Badge({ tone = 'neutral', children }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${TONE_CLASSES[tone] || TONE_CLASSES.neutral}`}>
      {children}
    </span>
  );
}
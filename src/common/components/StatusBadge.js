import React from 'react';
import { statusInfo } from '../utils/labels';
import Badge from './Badge';

export default function StatusBadge({ status }) {
  const info = statusInfo(status);
  return <Badge tone={info.tone}>{info.label}</Badge>;
}
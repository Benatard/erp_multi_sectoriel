import { statusInfo } from '../utils/labels';
import Badge from './Badge';

export default function StatusBadge({ status }: { status?: string | null }) {
  const info = statusInfo(status || '');
  return <Badge tone={info.tone}>{info.label}</Badge>;
}
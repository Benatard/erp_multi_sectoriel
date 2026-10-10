import { Helmet } from 'react-helmet-async';
import config from '../config/config';

export default function PageMeta({ title, description }) {
  const siteName = config.APP_NAME;
  const fullTitle = title ? `${title} — ${siteName}` : siteName;
  const desc = description || "MVP de l'ERP Multi-Sectoriel : plateforme de gestion intégrée multi-sectorielle.";

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
    </Helmet>
  );
}

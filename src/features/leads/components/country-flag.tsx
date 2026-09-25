'use client';

import * as React from 'react';
import { Globe } from 'lucide-react';

// Comprehensive ISO 3166-1 alpha-2 mapping & common country names
const COUNTRY_MAP: Record<string, { code: string; name: string }> = {
  ca: { code: 'CA', name: 'Canada' },
  can: { code: 'CA', name: 'Canada' },
  canada: { code: 'CA', name: 'Canada' },

  us: { code: 'US', name: 'United States' },
  usa: { code: 'US', name: 'United States' },
  'united states': { code: 'US', name: 'United States' },
  'united states of america': { code: 'US', name: 'United States' },

  gb: { code: 'GB', name: 'United Kingdom' },
  uk: { code: 'GB', name: 'United Kingdom' },
  gbr: { code: 'GB', name: 'United Kingdom' },
  'united kingdom': { code: 'GB', name: 'United Kingdom' },
  england: { code: 'GB', name: 'United Kingdom' },

  au: { code: 'AU', name: 'Australia' },
  aus: { code: 'AU', name: 'Australia' },
  australia: { code: 'AU', name: 'Australia' },

  de: { code: 'DE', name: 'Germany' },
  deu: { code: 'DE', name: 'Germany' },
  germany: { code: 'DE', name: 'Germany' },
  deutschland: { code: 'DE', name: 'Germany' },

  fr: { code: 'FR', name: 'France' },
  fra: { code: 'FR', name: 'France' },
  france: { code: 'FR', name: 'France' },

  it: { code: 'IT', name: 'Italy' },
  ita: { code: 'IT', name: 'Italy' },
  italy: { code: 'IT', name: 'Italy' },
  italia: { code: 'IT', name: 'Italy' },

  es: { code: 'ES', name: 'Spain' },
  esp: { code: 'ES', name: 'Spain' },
  spain: { code: 'ES', name: 'Spain' },
  espana: { code: 'ES', name: 'Spain' },

  ae: { code: 'AE', name: 'United Arab Emirates' },
  are: { code: 'AE', name: 'United Arab Emirates' },
  uae: { code: 'AE', name: 'United Arab Emirates' },
  'united arab emirates': { code: 'AE', name: 'United Arab Emirates' },
  dubai: { code: 'AE', name: 'United Arab Emirates' },

  sa: { code: 'SA', name: 'Saudi Arabia' },
  sau: { code: 'SA', name: 'Saudi Arabia' },
  ksa: { code: 'SA', name: 'Saudi Arabia' },
  'saudi arabia': { code: 'SA', name: 'Saudi Arabia' },

  in: { code: 'IN', name: 'India' },
  ind: { code: 'IN', name: 'India' },
  india: { code: 'IN', name: 'India' },

  pk: { code: 'PK', name: 'Pakistan' },
  pak: { code: 'PK', name: 'Pakistan' },
  pakistan: { code: 'PK', name: 'Pakistan' },

  sg: { code: 'SG', name: 'Singapore' },
  sgp: { code: 'SG', name: 'Singapore' },
  singapore: { code: 'SG', name: 'Singapore' },

  nz: { code: 'NZ', name: 'New Zealand' },
  nzl: { code: 'NZ', name: 'New Zealand' },
  'new zealand': { code: 'NZ', name: 'New Zealand' },

  ie: { code: 'IE', name: 'Ireland' },
  irl: { code: 'IE', name: 'Ireland' },
  ireland: { code: 'IE', name: 'Ireland' },

  nl: { code: 'NL', name: 'Netherlands' },
  nld: { code: 'NL', name: 'Netherlands' },
  netherlands: { code: 'NL', name: 'Netherlands' },
  holland: { code: 'NL', name: 'Netherlands' },

  ch: { code: 'CH', name: 'Switzerland' },
  che: { code: 'CH', name: 'Switzerland' },
  switzerland: { code: 'CH', name: 'Switzerland' },

  se: { code: 'SE', name: 'Sweden' },
  swe: { code: 'SE', name: 'Sweden' },
  sweden: { code: 'SE', name: 'Sweden' },

  no: { code: 'NO', name: 'Norway' },
  nor: { code: 'NO', name: 'Norway' },
  norway: { code: 'NO', name: 'Norway' },

  dk: { code: 'DK', name: 'Denmark' },
  dnk: { code: 'DK', name: 'Denmark' },
  denmark: { code: 'DK', name: 'Denmark' },

  fi: { code: 'FI', name: 'Finland' },
  fin: { code: 'FI', name: 'Finland' },
  finland: { code: 'FI', name: 'Finland' },

  be: { code: 'BE', name: 'Belgium' },
  bel: { code: 'BE', name: 'Belgium' },
  belgium: { code: 'BE', name: 'Belgium' },

  at: { code: 'AT', name: 'Austria' },
  aut: { code: 'AT', name: 'Austria' },
  austria: { code: 'AT', name: 'Austria' },

  pt: { code: 'PT', name: 'Portugal' },
  prt: { code: 'PT', name: 'Portugal' },
  portugal: { code: 'PT', name: 'Portugal' },

  gr: { code: 'GR', name: 'Greece' },
  grc: { code: 'GR', name: 'Greece' },
  greece: { code: 'GR', name: 'Greece' },

  pl: { code: 'PL', name: 'Poland' },
  pol: { code: 'PL', name: 'Poland' },
  poland: { code: 'PL', name: 'Poland' },

  za: { code: 'ZA', name: 'South Africa' },
  zaf: { code: 'ZA', name: 'South Africa' },
  'south africa': { code: 'ZA', name: 'South Africa' },

  br: { code: 'BR', name: 'Brazil' },
  bra: { code: 'BR', name: 'Brazil' },
  brazil: { code: 'BR', name: 'Brazil' },
  brasil: { code: 'BR', name: 'Brazil' },

  mx: { code: 'MX', name: 'Mexico' },
  mex: { code: 'MX', name: 'Mexico' },
  mexico: { code: 'MX', name: 'Mexico' },

  jp: { code: 'JP', name: 'Japan' },
  jpn: { code: 'JP', name: 'Japan' },
  japan: { code: 'JP', name: 'Japan' },

  cn: { code: 'CN', name: 'China' },
  chn: { code: 'CN', name: 'China' },
  china: { code: 'CN', name: 'China' },

  kr: { code: 'KR', name: 'South Korea' },
  kor: { code: 'KR', name: 'South Korea' },
  'south korea': { code: 'KR', name: 'South Korea' },
  korea: { code: 'KR', name: 'South Korea' },

  hk: { code: 'HK', name: 'Hong Kong' },
  hkg: { code: 'HK', name: 'Hong Kong' },
  'hong kong': { code: 'HK', name: 'Hong Kong' },

  qa: { code: 'QA', name: 'Qatar' },
  qat: { code: 'QA', name: 'Qatar' },
  qatar: { code: 'QA', name: 'Qatar' },

  kw: { code: 'KW', name: 'Kuwait' },
  kwt: { code: 'KW', name: 'Kuwait' },
  kuwait: { code: 'KW', name: 'Kuwait' },

  bh: { code: 'BH', name: 'Bahrain' },
  bhr: { code: 'BH', name: 'Bahrain' },
  bahrain: { code: 'BH', name: 'Bahrain' },

  om: { code: 'OM', name: 'Oman' },
  omn: { code: 'OM', name: 'Oman' },
  oman: { code: 'OM', name: 'Oman' },

  eg: { code: 'EG', name: 'Egypt' },
  egy: { code: 'EG', name: 'Egypt' },
  egypt: { code: 'EG', name: 'Egypt' },

  ng: { code: 'NG', name: 'Nigeria' },
  nga: { code: 'NG', name: 'Nigeria' },
  nigeria: { code: 'NG', name: 'Nigeria' },

  tr: { code: 'TR', name: 'Turkey' },
  tur: { code: 'TR', name: 'Turkey' },
  turkey: { code: 'TR', name: 'Turkey' },
  turkiye: { code: 'TR', name: 'Turkey' },

  my: { code: 'MY', name: 'Malaysia' },
  mys: { code: 'MY', name: 'Malaysia' },
  malaysia: { code: 'MY', name: 'Malaysia' },

  th: { code: 'TH', name: 'Thailand' },
  tha: { code: 'TH', name: 'Thailand' },
  thailand: { code: 'TH', name: 'Thailand' },

  ph: { code: 'PH', name: 'Philippines' },
  phl: { code: 'PH', name: 'Philippines' },
  philippines: { code: 'PH', name: 'Philippines' },

  id: { code: 'ID', name: 'Indonesia' },
  idn: { code: 'ID', name: 'Indonesia' },
  indonesia: { code: 'ID', name: 'Indonesia' },

  vn: { code: 'VN', name: 'Vietnam' },
  vnm: { code: 'VN', name: 'Vietnam' },
  vietnam: { code: 'VN', name: 'Vietnam' },

  il: { code: 'IL', name: 'Israel' },
  isr: { code: 'IL', name: 'Israel' },
  israel: { code: 'IL', name: 'Israel' },
};

export function resolveCountryInfo(
  input?: string | null,
  isoCodeHint?: string | null,
): { code: string | null; name: string | null } {
  if (isoCodeHint && isoCodeHint.trim().length === 2) {
    const code = isoCodeHint.trim().toUpperCase();
    const entry = COUNTRY_MAP[code.toLowerCase()];
    return {
      code,
      name: entry?.name || code,
    };
  }

  if (!input) return { code: null, name: null };

  const clean = input.trim();
  if (!clean || clean === '—' || clean === '-') {
    return { code: null, name: null };
  }

  const lookupKey = clean.toLowerCase();
  if (COUNTRY_MAP[lookupKey]) {
    return COUNTRY_MAP[lookupKey];
  }

  // If input is already 2 letters (standard ISO-2 code)
  if (clean.length === 2 && /^[a-zA-Z]{2}$/.test(clean)) {
    const code = clean.toUpperCase();
    return { code, name: code };
  }

  return { code: null, name: clean };
}

export interface CountryFlagProps {
  countryName?: string | null;
  isoCode?: string | null;
  showLabel?: boolean;
  className?: string;
}

export function CountryFlag({
  countryName,
  isoCode,
  showLabel = true,
  className = '',
}: CountryFlagProps) {
  const [imgError, setImgError] = React.useState(false);
  const info = React.useMemo(
    () => resolveCountryInfo(countryName, isoCode),
    [countryName, isoCode],
  );

  // Reset error if country changes
  React.useEffect(() => {
    setImgError(false);
  }, [info.code]);

  if (!info.name && !info.code) {
    return <span className="text-slate-400">—</span>;
  }

  const code = info.code;
  const displayName = info.name || code;
  const tooltipText = code && info.name && code !== info.name
    ? `${info.name} (${code})`
    : displayName || '';

  return (
    <span
      className={`inline-flex items-center gap-1.5 align-middle ${className}`}
      title={tooltipText}
    >
      {code && !imgError ? (
        <img
          src={`https://flagcdn.com/w40/${code.toLowerCase()}.png`}
          srcSet={`https://flagcdn.com/w80/${code.toLowerCase()}.png 2x`}
          alt={displayName || code}
          onError={() => setImgError(true)}
          className="h-3.5 w-5 rounded-[2px] object-cover shadow-xs border border-slate-200/90 shrink-0"
          loading="lazy"
        />
      ) : (
        <Globe className="h-3.5 w-3.5 text-slate-400 shrink-0" />
      )}

      {showLabel && (
        <span className="text-slate-700 font-medium text-xs leading-none whitespace-nowrap">
          {displayName}
        </span>
      )}
    </span>
  );
}

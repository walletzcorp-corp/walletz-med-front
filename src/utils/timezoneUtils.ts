import { getTimeZones } from "@vvo/tzdb";

const allTimezones = getTimeZones();

export function getCountryList() {
  const seen = new Set<string>();
  const countries: { code: string; name: string }[] = [];

  for (const tz of allTimezones) {
    if (!seen.has(tz.countryCode)) {
      seen.add(tz.countryCode);
      countries.push({ code: tz.countryCode, name: tz.countryName });
    }
  }
  return countries.sort((a, b) => a.name.localeCompare(b.name));
}

export function getTimezoneByCountry(countryCode: string) {
  return allTimezones
    .filter((tz) => tz.countryCode === countryCode)
    .map((tz) => ({
      name: tz.name, // "America/Sao_Paulo"  ← salvo no banco
      label: `(UTC${tz.currentTimeFormat}) ${tz.alternativeName}`,
      //       "(UTC-03:00) Brasilia Time"
    }));
}

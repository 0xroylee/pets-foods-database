# Collect FDA data only through sanctioned access

fda.gov refuses automated clients, so the collectors never disguise themselves to get past that. FDA recall data comes through the keyed APIs (the iRES Enforcement Report and the Data Dashboard), and fda.gov pages that have no API (recall press releases, warning letters, CVM outbreaks and advisories) arrive as files the owner saves or exports from a browser, which the collector imports. Every live request identifies the project honestly in its User-Agent, and a refusal is recorded as a refusal, never retried around.

## Considered Options

- **Scrape fda.gov with a browser-like User-Agent**: rejected. It circumvents the site's bot check.
- **Keyed APIs only**: rejected for now, because press releases, warning letters and advisories carry details the APIs lack.
- **Ask FDA for automated access first**: still possible later; it would replace the manual exports without changing the record format.

## Consequences

- The sourcing plan's T8 imports owner-saved files for fda.gov pages instead of fetching them. Each import keeps the file's provenance: when it was saved and from which URL.
- Live iRES collection, and verifying its protocol (T7), waits until the owner registers FDA keys.

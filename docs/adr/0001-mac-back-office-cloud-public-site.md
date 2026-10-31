# Private back office on the owner's Mac, read-only public site in the cloud

Collection, AI triage and review run on the owner's Mac, using the owner's Codex login and API keys. Only published data is pushed to a read-only public site on Cloudflare: the web pages, JSON API and MCP server on Workers, plus data downloads. We chose this so that Pending Reports, full source texts and credentials never sit on the public internet, and so AI work runs on the existing Codex login instead of paid API keys.

## Considered Options

- **One always-on cloud server** for everything: fresher data and ready for more Reviewers, but it puts an admin login and unreviewed claims about brands on the public internet, and AI work needs paid API keys.
- **Everything serverless on Cloudflare**, collection and review included: cheap and global, but long AI jobs and database size limits need workarounds, and it ties the whole system to one vendor. Only the read-only public site runs there.

## Consequences

- Updates pause while the Mac is off or asleep, so an urgent FDA recall waits until the Mac is back. The public site stays up meanwhile.
- Adding Reviewers later means moving the review step online, which reopens this decision.
- "Never on the public internet" means never published or hosted. AI processing through the owner's Codex login is allowed to read private material (Pending Reports, full texts, owner handles), because triage, de-duplication and anonymization need it. API keys and passwords are never sent to it, and nothing it produces becomes public without the normal review gates.

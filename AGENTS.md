<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep the uploaded guide's browser-safe ship data and original ammunition calculations in `src/features/guide/engine.js`; isolate presentation in React so future updates do not silently change the reference math.
- Define guide styling and semantic color tokens in `src/styles.css`, scoped to `.eve-guide`, so the terminal-inspired presentation remains consistent without affecting shared controls.
- Reference ship imagery through committed Lovable Assets pointers rather than external image-service URLs so the recreated guide owns its media references.
- Keep side-by-side comparisons in the dedicated `/compare` route and derive every displayed calculation from the shared guide engine, so comparison never introduces a second version of the reference math.
- Keep live counter data in the dedicated `/counters` route, fetched from zKillboard solo losses through a server function, so third-party requests stay server-side and separate from the offline guide math.

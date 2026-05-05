# 🏙️ NovaCrest Tourist Kiosk — 12-Developer Git Collaboration Guide

> **Project:** `HCI2` — NovaCrest Multimodal City Tourist Kiosk (React + Vite + TypeScript)  
> **Repository layout analyzed:** `src/` contains 17 source files across 5 directories.

---

## 1. Module Division — 12 Developers, 12 Modules

Each developer **owns** exactly the files listed. No one else touches those files.

| # | Developer | Owned Files |
|---|-----------|-------------|
| **D1** | Dev 1 | `src/main.tsx` · `src/App.tsx` |
| **D2** | Dev 2 | `src/index.css` · `index.html` |
| **D3** | Dev 3 | `src/types/index.ts` |
| **D4** | Dev 4 | `src/data/locations.ts` |
| **D5** | Dev 5 | `src/components/screens/SplashScreen.tsx` |
| **D6** | Dev 6 | `src/components/screens/KioskScreen.tsx` |
| **D7** | Dev 7 | `src/components/ui/TopBar.tsx` |
| **D8** | Dev 8 | `src/components/ui/CategorySidebar.tsx` |
| **D9** | Dev 9 | `src/components/ui/LocationCard.tsx` · `src/components/ui/StarRating.tsx` |
| **D10** | Dev 10 | `src/components/ui/LocationDetail.tsx` |
| **D11** | Dev 11 | `src/components/ui/VoicePanel.tsx` · `src/components/ui/SearchBar.tsx` |
| **D12** | Dev 12 | `src/hooks/useIdleTimer.ts` · `src/hooks/useSoundEffects.ts` · `src/hooks/useSpeechRecognition.ts` · `src/hooks/useSpeechSynthesis.ts` · `src/utils/cn.ts` · `src/utils/voiceCommands.ts` |

> [!IMPORTANT]
> **File Ownership is Absolute.** If your work requires a change in another developer's file, open a GitHub Issue tagging that developer. Never edit files outside your module.

---

## 2. Dependency Map

Understanding what depends on what prevents integration surprises:

```
D1 (App.tsx)
  └─ depends on D5 (SplashScreen), D6 (KioskScreen), D12 (useIdleTimer, useSoundEffects), D3 (types)

D6 (KioskScreen)
  └─ depends on D7 (TopBar), D8 (CategorySidebar), D9 (LocationCard), D10 (LocationDetail),
                D11 (VoicePanel, SearchBar), D12 (all hooks + voiceCommands), D4 (locations), D3 (types)

D9 (LocationCard)
  └─ depends on D9-internal (StarRating), D3 (types), D12 (cn.ts)

D10 (LocationDetail)
  └─ depends on D9 (StarRating), D3 (types), D12 (cn.ts)

D4 (locations.ts) → D3 (types/index.ts)   ← foundation layer, must be stable first
D3 (types/index.ts)                        ← lowest-level foundation
```

> [!TIP]
> **Integration order for the final merge:** D3 → D4 → D12 → D7 → D8 → D9 → D10 → D11 → D5 → D6 → D2 → D1

---

## 3. Git Branching Strategy

```
main
 └── develop          ← shared integration branch
      ├── feat/app-root
      ├── feat/global-styles
      ├── feat/types
      ├── feat/locations-data
      ├── feat/splash-screen
      ├── feat/kiosk-screen
      ├── feat/top-bar
      ├── feat/category-sidebar
      ├── feat/location-cards
      ├── feat/location-detail
      ├── feat/voice-ui
      └── feat/hooks-utils
```

- **`main`** — production-ready, protected. Only the team lead merges into it.
- **`develop`** — shared integration branch. All feature branches merge here first.
- **`feat/*`** — individual developer branches. Never directly pushed to `main`.

### Branch Protection Rules (set in GitHub → Settings → Branches)
- `main`: require PR + 1 approving review + passing CI
- `develop`: require PR + no direct pushes

---

## 4. Step-by-Step Workflow

### Step 1 — Clone the Repository (do once)

```bash
git clone https://github.com/<org>/HCI2.git
cd HCI2
npm install
```

### Step 2 — Create Your Branch

```bash
# Make sure you start from develop, not main
git checkout develop
git pull origin develop

# Create your personal feature branch
git checkout -b feat/<your-module>
# Example for Dev 5:
git checkout -b feat/splash-screen
```

### Step 3 — Work on Your Assigned Files Only

Open only the files listed in your module row. Use your editor's file explorer to navigate.  
If you need a constant or type from another module, **import it — do not duplicate it.**

```bash
# Check which files you've modified before committing
git status
git diff --name-only
```

> [!WARNING]
> If `git diff --name-only` shows files outside your module, **do not commit them.** Restore them with:
> ```bash
> git checkout -- src/path/to/file-not-yours.tsx
> ```

### Step 4 — Commit Changes Properly

Follow the **Conventional Commits** format (see Section 6).

```bash
# Stage only YOUR files (never use `git add .` blindly)
git add src/components/screens/SplashScreen.tsx

# Write a descriptive commit message
git commit -m "feat(splash-screen): add rotating subtitle animation with fade transition"
```

### Step 5 — Pull Updates from develop (do this daily)

```bash
git checkout develop
git pull origin develop
git checkout feat/<your-module>
git merge develop
```

If there are no conflicts (since you own separate files), this will be a clean fast-forward.

### Step 6 — Resolving Conflicts (if they occur)

Conflicts can still happen in shared config files (`package.json`, `tsconfig.json`, `vite.config.ts`).

```bash
# After git merge develop, if conflicts appear:
git status        # shows conflicted files in red

# Open the conflicted file — look for conflict markers:
# <<<<<<< HEAD  (your changes)
# =======
# >>>>>>> develop  (incoming changes)

# Manually edit to keep both sets of changes, then:
git add <resolved-file>
git commit -m "chore: resolve merge conflict in package.json"
```

> [!NOTE]
> For config file conflicts, coordinate with Dev 1 (App root owner) or the team lead before resolving, to avoid accidentally dropping someone else's dependency.

### Step 7 — Push Your Branch

```bash
git push origin feat/<your-module>

# If it's your first push on this branch:
git push -u origin feat/<your-module>
```

### Step 8 — Create a Pull Request (PR)

1. Go to **GitHub → Pull Requests → New Pull Request**
2. Set **base branch:** `develop` | **compare branch:** `feat/<your-module>`
3. Fill in the PR template:
   - **Title:** `feat(splash-screen): implement animated splash screen`
   - **Description:** What you changed, what to test, any dependencies on other modules
   - **Reviewers:** Assign the team lead + 1 peer
4. Wait for CI checks to pass and approval before merging

---

## 5. Commit Message Conventions

Use the **Conventional Commits** standard:

```
<type>(<scope>): <short description>

[optional body]
[optional footer]
```

### Types

| Type | When to use |
|------|-------------|
| `feat` | New feature or UI component |
| `fix` | Bug fix |
| `style` | CSS/styling only, no logic change |
| `refactor` | Code restructuring, no behavior change |
| `chore` | Config, tooling, dependencies |
| `docs` | Comments, README |
| `test` | Adding or fixing tests |

### Scopes (match your module name)

`app-root` · `global-styles` · `types` · `locations-data` · `splash-screen` · `kiosk-screen` · `top-bar` · `category-sidebar` · `location-cards` · `location-detail` · `voice-ui` · `hooks-utils`

### Examples

```bash
feat(splash-screen): add pulse ring animation on CTA button
fix(voice-ui): prevent double mic activation on rapid tap
style(global-styles): add custom scrollbar for location grid
refactor(hooks-utils): extract AudioContext factory into helper
chore: update lucide-react to v1.12.0
```

> [!NOTE]
> Keep the short description under 72 characters. Use imperative mood: "add", "fix", "update" — not "added", "fixed", "updated".

---

## 6. Rules to Avoid Merge Conflicts

### Rule 1 — File Ownership is Inviolable
Never edit a file not in your module. Period. If you need a change in someone else's file, tag them in a GitHub Issue or comment.

### Rule 2 — Pull Before Every Work Session
```bash
git checkout develop && git pull origin develop && git checkout feat/<your-module> && git merge develop
```
Make this your first command every morning.

### Rule 3 — Never Work Directly on `develop` or `main`
All work happens on your `feat/*` branch.

### Rule 4 — Small, Frequent Commits
Commit after every meaningful unit of work — not once at the end of the day. Smaller commits are easier to review and less likely to conflict.

### Rule 5 — No `git add .` Without Checking
Always run `git diff --name-only` before staging. Only add your own files.

### Rule 6 — Shared Config Files — Coordinate First
For `package.json`, `tsconfig.json`, `vite.config.ts`, `vite.config.ts`:
- Only Dev 1 (app-root) or the team lead may modify these
- Other devs open a GitHub Issue requesting the change

### Rule 7 — Do Not Rebase `develop` or `main`
Use `git merge` when syncing — never `git rebase` on shared branches. Rebase only on your own feature branch if needed and only before the first PR.

### Rule 8 — PR Size Limit
Keep PRs focused on one module. If a PR touches more than 5 files, split it.

---

## 7. Final Integration Process

Once all 12 feature branches are ready and individually reviewed, integrate in the dependency order below to minimize cascading issues.

### Phase 1 — Foundation (merge to `develop` first)

```
1. feat/types              (D3) — no dependencies
2. feat/locations-data     (D4) — depends on types
3. feat/hooks-utils        (D12) — depends on types
```

### Phase 2 — Shared UI Primitives

```
4. feat/global-styles      (D2) — CSS only
5. feat/top-bar            (D7) — depends on types
6. feat/category-sidebar   (D8) — depends on types, locations-data
7. feat/location-cards     (D9) — depends on types, hooks-utils
```

### Phase 3 — Feature Screens

```
8.  feat/location-detail   (D10) — depends on D9, types
9.  feat/voice-ui          (D11) — depends on types, hooks-utils
10. feat/splash-screen     (D5) — depends on utils/cn
11. feat/kiosk-screen      (D6) — depends on all UI components
12. feat/app-root          (D1) — depends on screens, hooks
```

### Phase 4 — Final Merge to `main`

After all 12 branches are merged into `develop` and the full app is tested:

```bash
# Team lead only:
git checkout main
git pull origin main
git merge --no-ff develop -m "chore: integrate all 12 modules into main"
git tag -a v1.0.0 -m "Release v1.0.0 — full 12-developer integration"
git push origin main --tags
```

> [!CAUTION]
> Never merge to `main` without running `npm run build` on the `develop` branch first to confirm a clean production build.

### Integration Checklist

- [ ] D3 types PR merged to `develop`
- [ ] D4 locations-data PR merged to `develop`
- [ ] D12 hooks-utils PR merged to `develop`
- [ ] D2 global-styles PR merged to `develop`
- [ ] D7 top-bar PR merged to `develop`
- [ ] D8 category-sidebar PR merged to `develop`
- [ ] D9 location-cards PR merged to `develop`
- [ ] D10 location-detail PR merged to `develop`
- [ ] D11 voice-ui PR merged to `develop`
- [ ] D5 splash-screen PR merged to `develop`
- [ ] D6 kiosk-screen PR merged to `develop`
- [ ] D1 app-root PR merged to `develop`
- [ ] `npm run build` passes on `develop`
- [ ] Manual smoke test on `develop` (kiosk loads, voice works, cards open)
- [ ] `develop` merged to `main` by team lead
- [ ] Release tag created

---

## 8. Quick Reference Card (print & share)

```
┌──────────────────────────────────────────────────────────────┐
│              DAILY DEVELOPER WORKFLOW                         │
├──────────────────────────────────────────────────────────────┤
│  1. git checkout develop && git pull origin develop           │
│  2. git checkout feat/<your-module> && git merge develop      │
│  3. Edit ONLY your assigned files                             │
│  4. git diff --name-only  ← verify no foreign files          │
│  5. git add <your-files>                                      │
│  6. git commit -m "feat(<scope>): description"               │
│  7. git push origin feat/<your-module>                        │
│  8. Open PR → base: develop                                   │
└──────────────────────────────────────────────────────────────┘

DO ✅                          DON'T ❌
─────────────────────          ─────────────────────────────
Pull from develop daily        Edit files outside your module
Use feat/* branches            Push directly to main/develop
Commit small & often           Use `git add .` blindly
Write conventional commits     Skip the PR process
Tag others for cross-module    Rebase shared branches
```

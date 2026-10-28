# GUIDE.md — Student Hands-on Lab Guide

**Workshop:** Git 2: Automations, Workflow, & Pages

Welcome! In this lab you'll take a template repository containing a **SLU
GWA Calculator** web app, run it through a real two-branch Git workflow, watch
an automated CI Quality Gate catch a real bug, fix that bug with the help of a
repository-level AI mentor, and finish by deploying your own live, interactive
calculator to the public internet via GitHub Pages — all using only a free
GitHub account and your browser.

The entire app is plain **HTML, CSS, and JavaScript** — no frameworks, no
build tools, and no installs.

By the end of this lab you will have practiced:

- Using a GitHub template to create your own repository
- Working entirely inside GitHub Codespaces (no local setup required)
- Running a real automated unit test suite (`node --test`)
- Branching, committing, and opening Pull Requests
- Reading and using repository-level AI instructions/agents
- Watching a CI pipeline and a CD (deployment) pipeline run automatically
- Visiting your own live GitHub Pages site


---

## Prerequisites

- A **free GitHub account**. If you don't have one, create it at
  [github.com/signup](https://github.com/signup) — it takes two minutes.
- **Git**, installed on your own machine.
  - Windows: install [Git for Windows](https://git-scm.com/download/win)
    (this also gives you "Git Bash," a terminal you can use for every command
    in this guide).
  - macOS: run `git --version` in Terminal — if it's not already installed,
    macOS will offer to install the Xcode Command Line Tools for you.
  - Linux: install via your package manager, e.g. `sudo apt install git`.
  - Verify it worked:
    ```bash
    git --version
    ```
- **Node.js** (version 18 or newer), installed on your own machine. This is
  the only "runtime" this workshop needs — there is no Python, no framework,
  and nothing else to install on top of it.
  - Go to [nodejs.org](https://nodejs.org) and download the **LTS**
    (Long-Term Support) installer for your operating system, then run it,
    accepting the defaults.
  - Verify it worked:
    ```bash
    node --version
    ```
    You should see something like `v20.x.x` or `v22.x.x` (anything 18 or
    above is fine).
- A code editor. [Visual Studio Code](https://code.visualstudio.com/) is
  recommended (free, and what this guide's screenshots/menu names assume),
  but any editor works.
- A modern web browser (Chrome, Edge, Firefox, or Safari).

---

## Step 1 — Create Your Own Repository from the Template

1. Open the template repository link your facilitator gives you (it will look
   like `https://github.com/SLU-AWS-Cloud/git-series-automation-lab`).
2. Click the green **Use this template** button near the top-right of the
   page, then choose **Create a new repository**.
3. Set:
   - **Include all branches**: `Off` or `Unchecked`. This repository only needs its `dev` branch copied over — you'll create your own `main` branch in `Step 3`, as a real descendant of `dev`.
   - **Owner:** your own GitHub account.
   - **Repository name:** `gwa-calculator` (or any name you like).
   - **Visibility:** **Public** — this is required so your GitHub Pages site
     can be viewed by anyone later (and is free for public repos).
4. Click **Create repository**.
5. You now have your own independent copy of the repository (just the `dev` branch, which is also this new repository's default branch). Everything you do from here happens in *your* copy — nothing you do affects the original template or your classmates' repositories.

---

## Step 2 — One-Time GitHub Pages Configuration

Every new repository needs this set once, manually, before deployments can
publish anywhere.

1. In **your** new repository, go to the **Settings** tab.
2. In the left sidebar, click **Pages**.
3. Under **Build and deployment -> Source**, choose **GitHub Actions**
   (not "Deploy from a branch").
4. That's it — no save button needed, the selection applies immediately.
   You won't see a live URL yet; that appears after your first successful
   deployment in Step 8.

---

## Step 3 — Clone Your Repository to Your Own Machine

1. On **your** repository's page on github.com, make sure the branch
   dropdown near the top-left shows `dev` (it should already be selected,
   since `dev` is this repository's default branch).
2. Click the green **Code** button, select the **Local** tab, then the
   **HTTPS** tab, and copy the URL shown (it looks like
   `https://github.com/<your-username>/gwa-calculator.git`).
3. Open a terminal or VS Code on your machine (Git Bash on Windows, Terminal on
   macOS/Linux) and run, pasting in your own URL:
   ```bash
   git clone https://github.com/<your-username>/gwa-calculator.git
   cd gwa-calculator
   ```
4. Confirm you landed on the `dev` branch (a fresh clone checks out whatever
   branch is set as default, which is `dev` for this repository):
   ```bash
   git branch --show-current
   ```
   This should print `dev`.
5. Your new repository only has a `dev` branch so far — there is no `main`
   branch yet. Create one now, as a direct child of `dev`, so the two
   branches share real commit history from the start (this is what makes
   the `dev` -> `main` Pull Request in Step 9 possible later):
   ```bash
   git checkout -b main
   git push -u origin main
   git checkout dev
   ```
   You should end up back on `dev` — that's the branch you'll do all your
   work on. `main` now exists on GitHub too, identical to `dev` for the
   moment, and will only change later when you merge a reviewed PR into it.
6. Open the folder in your editor. In VS Code, you can do this straight from
   the terminal:
   ```bash
   code .
   ```
   There is nothing to install at this point — this project has zero
   external dependencies, so you're ready to run tests immediately.
7. In VS Code, do `Ctrl` + `Shift` + `X` to open the **Extensions**. Search for `Live Preview` by Microsoft, and install the VS Code Extension. 

---

## Step 4 — Run the Tests and Observe the Intentional Failure

1. In the Codespace, open a terminal: **Terminal -> New Terminal** (or
   `` Ctrl+` ``).
2. Run:
   ```bash
   node --test tests/gwaCalculator.test.js
   ```
3. You should see most tests pass, but **one test fails** — look for a line
   like:
   ```
   ✖ computeSemesterGwa — zero included units throws InvalidInputError
   ```
   with an `AssertionError` underneath it, saying `AssertionError [ERR_ASSERTION]: Missing expected exception (InvalidInputError).`
4. This failure is **intentional** — it's the checkpoint for this lab. Your
   job over the next few steps is to understand why it fails and fix it
   properly, the same way you'd fix a real bug reported by a real test suite.

   Take a moment and open `public/gwaCalculator.js`. Find the function
   `computeSemesterGwa`. Notice the comment above the final `return`
   statement marked `INTENTIONAL BUG`.
5. Curious what this looks like from a user's perspective? Open
   `public/index.html` using the **Show Preview** or **Open in Browser**
   option in the Codespace (*Right Click* to see **Show Preview**, or wait until Step 8, when you'll see it live on
   the real internet). If you add a semester containing *only* an NSTP
   course, that semester's GWA will display as a literal **"NaN"** instead of
   a helpful message — that's the same bug the failing test caught, just
   visible in the UI instead of in a test report.

---

## Step 5 — Branch, Commit, and Open a Pull Request to See CI Fail

Even though you already see the failure locally, the workshop workflow wants
you to experience the same failure show up **automatically** on a Pull
Request, exactly like it would in a real team project.

1. Create a new branch for your fix:
   ```bash
   git checkout -b fix/gwa-boundary-checks
   ```
2. For now, commit *without* fixing anything yet, just to see the automated
   Quality Gate run and fail on GitHub (you'll push the real fix in Step 6):
   ```bash
   git commit --allow-empty -m "chore: open PR to observe CI Quality Gate"
   git push origin fix/gwa-boundary-checks
   ```
3. GitHub will print a URL in the terminal to open a Pull Request, or you can
   go to your repository on github.com — you'll see a yellow banner
   suggesting **Compare & pull request**. Click it.
4. Set the PR to go **from** `fix/gwa-boundary-checks` **into** `dev` (this
   should be the default base branch already, since `dev` is the default
   branch of the repo).
5. Give it a title like `fix: handle zero-units boundary condition` and click
   **Create pull request**.
6. Scroll down on the PR page. You'll see a check called **CI Quality Gate /
   quality-gate** running automatically. Click **Details** to watch it live.
7. It will finish with a red ✗, failing on the same zero-units test you saw
   locally. This is the **CI Quality Gate catching the bug automatically**,
   before any code reaches `dev` — exactly what it's designed to do.

Leave this Pull Request open; you'll push your real fix to the same branch in
Step 6 and watch this same check turn green.

---

## Step 6 — Protect `dev` and `main` with Classic Branch Protection Rules

Right now, the CI Quality Gate *runs* on every PR, but nothing actually stops
anyone (including you, as the repository owner) from ignoring a red ✗ and
merging — or even pushing straight to `main` — anyway. A **branch protection
rule** is what turns the Quality Gate from "a check that runs" into "a check
that blocks." **HALT**. Set this up now: the `quality-gate` check has already run once
(on the PR you opened in Step 5), so GitHub can list it as a selectable
required check.

> GitHub now has two ways to protect a branch: the older, simpler **classic
> branch protection rules** (what this step uses) and newer **rulesets**,
> which are more flexible but also more involved. For this workshop,
> classic rules are all you need.

1. Go to your repository's **Settings** tab, then **Branches** in the left
   sidebar.
2. Under **Branch protection rules**, click **Add classic branch protection rule**.

### 6a. Protect `main`

1. **Branch name pattern:** type `main`.
2. Enable **Require a pull request before merging**. This alone already
   stops anyone from pushing commits straight to `main` — every change has to
   arrive via a reviewed PR.
3. Enable **Require status checks to pass before merging**, then use the
   search box that appears to find and select **`quality-gate`**. (If it
   isn't listed yet, it's because no check has run against this repository
   yet — go back and finish Step 5 first, then return here.)
4. Enable **Do not allow bypassing the above settings** (on older GitHub
   versions this is labeled **Include administrators**). Without this, you —
   as the repo's owner — could still push directly to `main` and skip the
   Quality Gate entirely, which would defeat the whole point of protecting
   it.
5. Scroll down and click **Create** (or **Save changes**).

### 6b. Protect `dev`

Repeat the same process for `dev`, since every change in this workshop's
workflow is meant to arrive via Pull Request there too, not via direct push (use `feat/<feature>` and `fix/<error>` branching):

1. Click **Add branch protection rule** again.
2. **Branch name pattern:** type `dev`.
3. Enable **Require a pull request before merging**.
4. Enable **Require status checks to pass before merging**, and select
   **`quality-gate`** again.
5. Enable **Do not allow bypassing the above settings** (or **Include
   administrators**).
6. Click **Create**.

From this point on, *every* change to either branch — including your own —
has to go through a Pull Request with a passing Quality Gate before it can be
merged. That's the two-branch workflow this workshop has been teaching,
now actually enforced by GitHub itself rather than just followed by
convention.

---

## Step 7 — Consult the AI Instructions, Then Fix the Boundary Condition

### 7a. Read the repository's AI instructions and agent

Before writing the fix, read the two AI-facing files that live inside
`.github/` in your repository. These aren't just documentation for a human —
they're read by AI coding assistants (like GitHub Copilot, if you have it
enabled) before they offer you help on this repo.

1. Open `.github/instructions/academic-policy.instructions.md`.
   - Read **Section 1 (Grading Domain Rules)** and **Section 4 (Defensive
     Programming Constraints)**, specifically rule #1: *"JavaScript does NOT
     throw on division by zero... must explicitly check... and throw
     InvalidInputError."* This is the exact rule the failing test enforces.
2. Open `.github/agents/code-mentor.agent.md`.
   - Notice this file defines an agent persona called **Code Mentor**, whose
     job is to help you understand *why* your code is wrong — not to hand you
     a finished patch. Read the section **Anti-Vibe-Coding Principles**.
   - "Vibe coding" means pasting an error message into an AI tool and getting
     back a working fix with zero understanding of what changed or why. This
     workshop is deliberately designed against that. The Code Mentor agent is
     instructed to never paste you a corrected function, and instead to ask
     you diagnostic questions until you find the fix yourself.
3. If you have access to an AI assistant configured to use this repository's
   agents (for example, GitHub Copilot Chat with agent support, or your
   facilitator's provided tool), you can literally ask it to act as
   **Code Mentor** and describe your failing test. Expect it to respond with
   a guiding question rather than a code block — that's it working as
   designed.
4. Why does this matter? This is **Explainable AI (XAI)** in practice: every
   hint the agent gives you is required to point back to a specific written
   rule (in `academic-policy.instructions.md`) and a specific failing test (in
   `tests/gwaCalculator.test.js`), so you always know *why* something is
   considered correct or incorrect — not just that an AI said so. You remain
   accountable for the actual fix you write and commit.

### 6b. Fix the boundary condition yourself

1. Open `public/gwaCalculator.js` and look at `computeSemesterGwa`:
   ```javascript
   const totalWeighted = included.reduce((sum, c) => sum + c.grade * c.units, 0);
   const totalUnits = included.reduce((sum, c) => sum + c.units, 0);

   // INTENTIONAL BUG (workshop checkpoint): totalUnits can
   // legitimately be 0 (e.g. an NSTP-only semester). This should
   // guard and throw InvalidInputError, but it does not yet.
   return totalWeighted / totalUnits;
   ```
2. Following rule #1 in `academic-policy.instructions.md` ("No unguarded division... must
   explicitly check... and throw InvalidInputError"), add a guard **before**
   the `return` that throws `new InvalidInputError(...)` when `totalUnits
   === 0`, with a message that explains what happened (e.g. that the
   semester has no gradable units once NSTP courses are excluded).
3. Save the file.
4. Run the syntax check and the full test suite again locally:
   ```bash
   node --check public/gwaCalculator.js
   node --check public/app.js
   node --test tests/gwaCalculator.test.js
   ```
   All tests, including the zero-units test, should now pass.
5. Commit and push your real fix to the same branch:
   ```bash
   git add public/gwaCalculator.js
   git commit -m "fix: throw InvalidInputError on zero total units"
   git push origin fix/gwa-boundary-checks
   ```

---

## Step 8 — Watch CI Turn Green and Merge into `dev`

1. Go back to the Pull Request you opened in Step 5. Your new push
   automatically re-triggers the **CI Quality Gate** check.
2. Watch the **Actions** tab or the PR's checks section. This time both the
   **Syntax check** step and the **Run unit tests** step should complete with
   a green ✓.
3. Once the check is green, click **Merge pull request** (then **Confirm
   merge**) to merge your fix into `dev`.

---

## Step 9 — Open a Release PR into `main` and Watch the Live Deployment

1. Now create the release Pull Request: from the repository's **Pull
   requests** tab, click **New pull request**, and set it to go **from**
   `dev` **into** `main`.
   - Title it something like `release: deploy verified GWA calculator`.
   - Click **Create pull request**.
2. You'll see the **CI Quality Gate** check run on this PR too (it triggers
   on pull requests targeting `main` as well as `dev`), confirming one more
   time that everything going into production is verified.
3. Once that check is green, click **Merge pull request**, then **Confirm
   merge**.
4. This push to `main` automatically triggers the **Deploy GWA Calculator to
   GitHub Pages** workflow. Go to the **Actions** tab to watch it.
5. You'll see two jobs run in sequence:
   - **build** — packages everything inside `public/` (your HTML, CSS, and
     the two JavaScript files) as a deployable Pages artifact.
   - **deploy** — publishes that artifact to GitHub Pages.
6. When both jobs finish with a green ✓, click into the **deploy** job and
   look for the **page_url** output, or simply go back to **Settings ->
   Pages** in your repository — you'll now see a banner: *"Your site is live
   at `https://<your-username>.github.io/<your-repo-name>/`."*

---

## Step 9 — Visit Your Live Calculator

1. Click your GitHub Pages link. You should see your own, fully interactive
   **College GWA Calculator**, live on the internet:
   - Add a semester, add a few courses with units and grades.
   - Watch the Semester GWA and Overall Cumulative GWA update live.
   - Check "Is NSTP?" on a course and confirm it's excluded from the GWA and
     from Academic Standing, and that the notice about NSTP exclusion is
     visible.
   - Enter a high enough overall GWA and confirm the Academic Standing
     readout correctly shows Summa / Magna / Cum Laude at the 93 / 91 / 88
     boundaries.
2. Try the exact scenario the bug was about: create a semester with *only*
   an NSTP course in it. Before your fix, this showed a confusing "NaN."
   Now, because `computeSemesterGwa` throws a clear `InvalidInputError`,
   `app.js`'s error handling catches it and shows you a readable message in
   the page instead — the same defensive-programming fix you wrote is now
   protecting real users of your deployed app, not just passing a test.

**Congratulations** — you've just completed a full real-world software
delivery cycle: a failing automated test caught a genuine bug, repository-level
AI instructions guided (without doing) your fix, a CI Quality Gate verified
your work on every Pull Request, and a CD pipeline deployed your verified code
to a public URL automatically the moment it reached `main`. This is the same
pattern used by professional software teams — you just ran it yourself, end to
end, for free, entirely in the browser.

**Start applying this to your personal projects!**
**IT'S ALWAYS DAY ONE!**
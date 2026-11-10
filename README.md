# API Testing with Playwright

A TypeScript-based API testing framework using [Playwright](https://playwright.dev/) for testing REST APIs.

---

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- npm

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Install Playwright browsers

```bash
npx playwright install
```

### 3. Configure environment variables

This project uses a `.env` file to store sensitive credentials that are **never committed to source control**.

Create a `.env` file in the project root by copying the example below:

```dotenv
DL_USERNAME=your_username
DL_PASSWORD=your_password
API_KEY=your_bank_accounts_api_key
```

> ⚠️ **Important:** The `.env` file must **not** be committed to the repository. Make sure `.env` is listed in your `.gitignore`.

---

## 🧪 Running Tests

```bash
npm test
```

To run a specific test file:

```bash
npx playwright test tests/delivery/auth.spec.ts
```

To open the HTML report after a run:

```bash
npx playwright show-report
```

---

## 🔧 Other Scripts

| Script | Description |
|---|---|
| `npm test` | Run all Playwright tests |
| `npm run lint` | Lint test files with ESLint |
| `npm run prettier:check` | Check formatting with Prettier |
| `npm run prettier:format` | Auto-format test files with Prettier |

---

## 🔒 CI / Secrets Configuration

When running tests in a CI environment, **do not** store credentials in a `.env` file. Instead, configure the environment variables as **CI secrets/environment variables**.

### GitHub Actions

The workflow file is already provided at `.github/workflows/playwright.yml`.

1. Go to your repository → **Settings** → **Secrets and variables** → **Actions**.
2. Click **New repository secret** and add each variable:
   - `DL_USERNAME`
   - `DL_PASSWORD`
   - `API_KEY` (X-API-KEY for the Bank Accounts API)
3. The workflow will automatically pick them up:

```yaml
- name: Run tests
  env:
    DL_USERNAME: ${{ secrets.DL_USERNAME }}
    DL_PASSWORD: ${{ secrets.DL_PASSWORD }}
  run: npm test
```

---

## 📁 Project Structure

```
.
├── dto/                  # Data Transfer Objects (request/response models)
├── helpers/              # Reusable API helper functions
├── tests/
│   ├── delivery/         # Authenticated API tests
│   └── example-no-auth/  # Unauthenticated / simple API tests
├── .env                  # Local environment variables (⚠️ not committed)
├── playwright.config.ts  # Playwright configuration
└── package.json
```


# 🖥️  finance-tracker-frontend

<p align="center">
  <a href="https://finance-tracker-frontend-theta-brown.vercel.app/">
    <img src="assets/gif/wallet.gif" width="100" alt="thumbnail">
  </a>
</p>

## 🧠 Project Overview

**Expense Tracker** is a website for personal finance management. It provides a user experience with the ability to visualize real-time data and financial models. Built with a focus on intuitive UI/UX aesthetics and reliability, this web application offers users an intuitive and secure way to take complete control of their financial journey.

## 🔗 Backend Github Link

This is a link to the project's frontend on Github:
[Finance Tracker Backend Github](https://github.com/TranNgocVu-0904/finance-tracker-backend.git)

## 🛠️ Tech Stack

This project is built with a focus on modern UI/UX, high-performance data visualization, and a professional-grade testing suite:

* **Core Interface:** [HTML5](https://developer.mozilla.org/en-US/docs/Web/HTML) & [Tailwind CSS](https://tailwindcss.com/) - Utilizing a Glassmorphism design language for a sleek, modern financial dashboard.

* **Language:** [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript) - Leveraging asynchronous programming (`async/await`) and modular logic.

* **Data Visualization:** [Chart.js](https://www.chartjs.org/) - Powering interactive analytics and financial projection graphs.

* **Security Logic:** [JWT Strategy](https://jwt.io/) - Client-side token authentication and secure routing management via `localStorage`.

* **Unit Testing:** [Jest](https://jestjs.io/) & [JSDOM](https://github.com/jsdom/jsdom) - Ensuring 100% accuracy for financial calculations and authentication logic.

* **UI Integration Testing:** [Playwright](https://playwright.dev/) - Automated browser testing with advanced **API Mocking** and network interception capabilities.

* **CI/CD Pipeline:** [GitHub Actions](https://github.com/features/actions) & [Vercel](https://www.google.com/search?q=https://vercel.com/solutions/continuous-deployment) - A dual-layered pipeline: GitHub Actions handles **Continuous Integration (CI)** for testing, while Vercel manages **Continuous Deployment (CD)** with  build-trigger logic.

* **Automation Tooling:** [npx](https://www.npmjs.com/package/npx) - Used to execute package binaries (like Playwright) directly from `node_modules`, ensuring a consistent testing environment across local and CI workflow.

* **Package Management:** [npm](https://www.npmjs.com/) - Essential for dependency versioning and managing standardized automation scripts.

## 🎉 Key Features

* **Authenticity & Navigation:** Secure JWT-based session management with real-time token expiration authentication and automatic redirection between protected and public sites.

* **Interactive Trading Features:** Seamless interface for managing income and expenses, with real-time portfolio filtering, global search, and dynamic data updates for a smooth user experience.

* **Financial Testing Environment:** A What-if sandbox that asset growth over 10 years, incorporating real-world variables such as inflation and monthly capital.

* **Real-time Data Visualization:** Dynamic spending analysis and financial trend analysis powered by **[Chart.js](https://www.chartjs.org/)**, providing users with instant and useful insights into their expense habits.

* **Automated Quality Assurance:** A robust multi-tiered testing process utilizes **[Playwright](https://playwright.dev/)** to automate UI integration testing and **[Jest](https://jestjs.io/)** to verify complex financial logic and security filters.

* **Optimized CI/CD Process:** Automation via [GitHub Actions](https://github.com/features/actions) and [Vercel](https://www.google.com/search?q=https://vercel.com/solutions/continuous-deployment), using `git diff` logic and path filtering to ensure rapid deployment and optimal resource utilization.

* **Personalized User Experience:** Customizable with visual theme switching, enabling/disabling the environmental effect, and interactive sound notifications to enhance user interaction.

* **State Storage:** Seamlessly maintain user preferences (Theme, Sound, UI On/Off) across sessions using **`localStorage`**, ensuring a consistent experience without redundant backend function calls.

## 🚧 Frontend Architecture

The application follows a modular **Layered Architecture** to ensure a strict separation of concerns across all **9 core logic modules**:

* **Security & Access Layer:**

  * [`auth.js`](scripts/auth.js): The global security guard handling JWT validation and route protection.

  * [`login.js`](scripts/login.js) & [`reset-password.js`](scripts/reset-password.js): Manage the complete authentication lifecycle, from secure entry to account recovery.

* **Presentation & Component Layer:**

  * [`app.js`](scripts/app.js): The primary controller orchestrating the main Dashboard state and interactions.

  * [`components.js`](scripts/components.js): A dedicated UI library managing custom modals, toasts, and reusable HTML templates.

* **Business Logic (Service) Layer:**

  * [`sandbox.js`](scripts/sandbox.js): The financial modeling engine for wealth projection and compound interest math.

  * [`analytics.js`](scripts/analytics.js): Handles data aggregation and state management for pass data.

* **Utility & Infrastructure Layer:**

  * [`settings.js`](scripts/settings.js): Manages user profile updates and visual preference configurations.

  * [`sound-helper.js`](scripts/sound-helper.js): An audio utility providing interactive feedback for system events.

## ☁️ Infrastructure & Deployment

The user interface is designed for ease of use and automated distribution, ensuring all code changes are validated and deployed without manual intervention.

* **Continuous Deployment (CD):** [Vercel](https://vercel.com/) - Hosting as the production website.  Using `git diff` to evaluate changes. If modifications are limited to documentation or non-core assets, the build process would be skipped.

* **Continuous Integration (CI):** [GitHub Actions](https://github.com/features/actions) - Coordinates automated testing. It performs two-thread validation:

* **Unit Testing:** Runs **[Jest](https://jestjs.io/)** for  core calculations.

* **UI Integration Testing:** **[Playwright](https://playwright.dev/)** is only triggered when UI-oriented files are modified, ensuring efficient feedback loops.

## 🚀 Getting Started

To launch the frontend locally:

### 1. Clone the Repository

```bash
git clone https://github.com/TranNgocVu-0904/finance-tracker-frontend.git

cd finance-tracker-frontend
```

### 2. Launch the Application

To view the website, we recommend using the **Live Server** extension in VS Code:

1. Open the project folder in **VS Code**.
2. Install the **"Live Server"** extension (by Ritwick Dey) from the Extensions.
3. Right-click on the file that you want to display and select **"Open with Live Server"**.
4. The app will automatically open in your default browser at `http://127.0.0.1:5500`.

### Note

If you don't want to click on each file, just look at the bottom right corner; you'll find the **GoLive** button:

![Go Live](assets/png/GoLive.png)

## 🧪 Testing Guide

The user interface section includes unit tests and UI integration test cases to ensure the correctness of the logic and the stability of the user interface.

### 1. Running Unit Tests

Before running unit tests, you must install  **[Jest](https://jestjs.io/)**:

```bash
npm install --save-dev jest jest-environment-jsdom servor 
```

Use **Jest** to validate core financial calculations (compound interest, aggregation) and security filters:

```bash
# Run all unit tests
npm run test
```

### 2. Running UI Integration Tests

Before running UI tests, you must install the automated browser engines required by [Playwright](https://playwright.dev/):

```bash
npm init playwright@latest
```

Use **Playwright** to simulate real user path. Note that the system is configured to **Mock API** responses, so you don't need the backend running to perform these tests.

* **Headless Mode** (Fastest, runs in background):

    ```bash
    npx run test
    ```

> And also, this command I have configured in [package.json](package.json):

    ```bash
    npm run test:ui
    ```

* **UI Mode** (Interactive dashboard for debugging):

    ```bash
    npx playwright test --ui
    ```

> Or if you want, this command I have configured in [package.json](package.json):

```bash
npm run test:ui:show
```

* **Headed Mode** (See the bot interacting with the browser):

  ```bash
  npx playwright test --headed
  ```

### Note

To run the test correctly, please make sure that your `package.json` and `playwright.config.js` files look like this: [`package.json`](package.json) and [`playwright.config.js`](`playwright.config.js`)

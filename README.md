# 🖥️  finance-tracker-frontend

<div align="center">
  <table bgcolor="white">
    <tr>
      <td align="center" style="background-color: #ffffff;">
        <a href="https://finance-tracker-frontend-theta-brown.vercel.app/">
          <img src="https://github.com/TranNgocVu-0904/finance-tracker-frontend/raw/main/assets/gif/wallet.gif" width="200" alt="thumbnail">
        </a>
      </td>
    </tr>
  </table>
</div>
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

  * [`auth.js`](auth.js): The global security guard handling JWT validation and route protection.

  * [`login.js`](login.js) & [`reset-password.js`](reset-password.js): Manage the complete authentication lifecycle, from secure entry to account recovery.

* **Presentation & Component Layer:**

  * [`app.js`](app.js): The primary controller orchestrating the main Dashboard state and interactions.

  * [`components.js`](components.js): A dedicated UI library managing custom modals, toasts, and reusable HTML templates.

* **Business Logic (Service) Layer:**

  * [`sandbox.js`](sandbox.js): The financial modeling engine for wealth projection and compound interest math.

  * [`analytics.js`](analytics.js): Handles data aggregation and state management for pass data.

* **Utility & Infrastructure Layer:**

  * [`settings.js`](settings.js): Manages user profile updates and visual preference configurations.

  * [`sound-helper.js`](sound-helper.js): An audio utility providing interactive feedback for system events.

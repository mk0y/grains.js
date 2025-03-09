# Contributing to Grains.js

Thank you for your interest in contributing to **Grains.js**! 🎉 This document outlines guidelines for making contributions to the project.

## 📌 Project Overview

Grains.js is a lightweight, reactive DOM state management library designed for declarative and efficient UI updates. Contributions are welcome to improve its functionality, fix bugs, and enhance documentation.

---

## 🛠 How to Contribute

1. **Fork the Repository**: Click the "Fork" button on GitHub.
2. **Clone Your Fork**:
   ```sh
   git clone https://github.com/mk0y/grains.js.git
   ```
3. **Create a New Branch**:
   ```sh
   git checkout -b feature/your-feature-name
   ```
4. **Make Your Changes**:
   - Follow the coding style outlined below.
   - Write tests if applicable.
5. **Commit Your Changes**:
   ```sh
   git commit -m "Add feature: your feature name"
   ```
6. **Push to Your Fork**:
   ```sh
   git push origin feature/your-feature-name
   ```
7. **Submit a Pull Request (PR)**: Open a PR to `main` with a clear description of your changes.

---

## 📏 Code Guidelines

- **Language**: JavaScript/TypeScript (ES6+)
- **Linting**: Run `npm run lint` before committing.
- **Formatting**: Use Prettier for formatting.
- **Naming Conventions**: Use meaningful function and variable names.
- **Keep it Modular**: Follow the project structure (see `CONVENTIONS.md`).
- **Document Your Code**: Add JSDoc-style comments where needed.

---

## ✅ Running and Writing Tests

We use **Vitest** for testing. Run tests before submitting a PR.

1. Install dependencies:
   ```sh
   npm install
   ```
2. Run all tests:
   ```sh
   npm test
   ```
3. If you are adding a new feature, write a test under `src/__tests__/`:

   ```js
   import { yourFunction } from "../yourFile";
   import { describe, it, expect } from "vitest";

   describe("yourFunction", () => {
     it("should work as expected", () => {
       expect(yourFunction()).toBe(true);
     });
   });
   ```

---

## 🐞 Reporting Issues

- **Bug Reports**: Open a GitHub issue with:
  - A clear title
  - Steps to reproduce
  - Expected vs. actual behavior
  - Screenshots (if applicable)
- **Feature Requests**: Describe the problem your feature solves and how it improves Grains.js.

---

## 🚀 Pull Request Process

1. Ensure your code passes all tests (`npm test`).
2. Follow the commit message convention (`feat:`, `fix:`, `docs:`, `refactor:`, etc.).
3. Keep PRs small and focused on a single change.
4. If applicable, update documentation.
5. Wait for a review, address comments, and once approved, your PR will be merged!

---

## 📣 Community and Support

- Have a question? Start a discussion in [GitHub Discussions](https://github.com/mk0y/grains.js/discussions).
- Or join [Discord channel](https://discord.gg/RKeBjRKZ).
- Want to contribute but not sure where to start? Check `good first issue` labels in Issues.

---

Your contributions help make **Grains.js** better! 🚀 Thanks for being awesome. 🙌

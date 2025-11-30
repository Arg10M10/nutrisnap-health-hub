# AI Development Rules for NutriSnap

This document outlines the technology stack and specific rules for the AI assistant to follow when developing and modifying the NutriSnap application. The goal is to ensure consistency, maintainability, and adherence to best practices.

## Tech Stack

The application is built with a modern, component-based architecture. Key technologies include:

-   **Framework:** React with Vite for a fast development experience.
-   **Language:** TypeScript for type safety and improved code quality.
-   **Routing:** React Router (`react-router-dom`) for all client-side navigation.
-   **UI Components:** shadcn/ui, a collection of beautifully designed, accessible components built on Radix UI.
-   **Styling:** Tailwind CSS for a utility-first styling approach.
-   **Icons:** `lucide-react` for a comprehensive and consistent set of icons.
-   **Notifications:** `sonner` for simple and elegant toast notifications.
-   **Data Fetching & State:** `@tanstack/react-query` for managing server state and asynchronous operations.
-   **Forms:** `react-hook-form` and `zod` for building performant and validated forms.

## Library Usage Rules

To maintain a clean and consistent codebase, please adhere to the following rules:

1.  **UI Components:**
    -   **ALWAYS** use components from the `shadcn/ui` library (`@/components/ui/*`) for building the user interface (e.g., `Button`, `Card`, `Input`).
    -   If a required component does not exist in `shadcn/ui`, create a new, reusable component in the `src/components/` directory, following the existing coding style.

2.  **Styling:**
    -   **ONLY** use Tailwind CSS utility classes for styling.
    -   The `cn` utility function from `@/lib/utils` should be used to conditionally apply classes.
    -   Avoid writing custom CSS in `.css` files. Global styles are defined in `src/index.css` and should only be modified for base theme adjustments (colors, fonts, etc.).

3.  **Routing and Navigation:**
    -   All application routes **MUST** be defined in `src/App.tsx`.
    -   Use the custom `NavLink` component (`@/components/NavLink.tsx`) for navigation links that require an "active" state, such as in the `BottomNav`.
    -   Use the `useNavigate` hook from `react-router-dom` for programmatic navigation.

4.  **Icons:**
    -   **EXCLUSIVELY** use icons from the `lucide-react` package. This ensures visual consistency across the app.

5.  **User Feedback (Notifications):**
    -   Use the `toast` function from the `sonner` library to display non-intrusive notifications for user actions (e.g., saving data, completing a mission, showing an error).

6.  **State Management:**
    -   For simple, component-level state, use React's built-in hooks (`useState`, `useReducer`).
    -   For managing server state, caching, and asynchronous data, **ALWAYS** use `@tanstack/react-query`.

7.  **File Structure:**
    -   **Pages:** All page-level components go into `src/pages/`.
    -   **Reusable Components:** All general-purpose, reusable components go into `src/components/`.
    -   **UI Primitives:** `shadcn/ui` components are located in `src/components/ui/`. Do not modify these directly.
    -   **Hooks:** Custom hooks should be placed in `src/hooks/`.
    -   **Utilities:** Utility functions should be placed in `src/lib/`.
# Component Tree Diagram for index.astro

```
index.astro
├── Layout.astro
│   ├── <head> elements
│   │   └── Meta tags, title, etc.
│   └── <body> elements
│       ├── Navigation/Header (implied)
│       ├── <slot/> content from index.astro
│       │   └── <main>
│       │       └── Hero section
│       │           ├── Title & Description
│       │           └── Conditional content
│       │               ├── #auth-section (for authenticated users)
│       │               │   └── Links to "/topics" and "/learning-session"
│       │               └── #guest-section (for guests)
│       │                   └── Links to "/register" and "/login"
│       └── Footer (implied)
```

This diagram shows the component hierarchy starting from index.astro. The main page imports the Layout component which likely handles the common page structure. Inside the Layout's slot, the index page renders a hero section with conditional content that changes based on user authentication status.

Key dependencies:
- Layout.astro (imported from ../layouts/Layout.astro)
- Authentication utilities (from @/lib/cookies and @/lib/server/authenticationService)

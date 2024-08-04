# Client-Side Router

A client-side router for vanilla JavaScript projects. It allows navigating between pages without reloading.

## Example use

```typescript
import { navigate, redirect, Route, Router } from "client-side-router";

const router = Router({
  children: [
    Route({ path: "/", title: "Home", component: HomePage }),
    Route({ path: "/profile/:id", title: "About", component: ProfilePage }),
    Route({ path: ".*", title: "Page not found", component: NotFoundPage })
  ],
  onNavigationStarted: () => {
    console.log("nav started");
  },
  onNavigationComplete: ({ title }) => {
    if (title === "Page not found")
      setTimeout(() => navigate("/"), 5000);
  },
});
document.body.appendChild(router);

function createElement(tagName: string, innerText: string) {
  const element = document.createElement(tagName);
  element.innerText = innerText;
  return element;
}

function HomePage() {
  return createElement("h1", "Home");
}

function ProfilePage({ id }: { id: string; }) {
  if (prompt("Are you a bot?") === "yes")
    throw redirect("/");
  return createElement("h1", `Profile ${id}`);
}

function NotFoundPage() {
  return createElement("p", "Page not found");
}
```

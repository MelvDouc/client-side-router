import { navigateToRoute } from "$/src";
import { App } from "$/tests/test-app";
import { beforeAll, describe, expect, it } from "vitest";

describe("A router", () => {
  beforeAll(() => {
    document.body.replaceChildren(App());
  });

  it("should render a home page", () => {
    const h1 = document.querySelector("h1");
    expect(h1).toBeInstanceOf(HTMLElement);
    expect(h1!.textContent).toBe("Home Page");
  });

  it("should handle an anchor click", () => {
    const profileLink = document.getElementById("profile-link");
    profileLink?.click();
    expect(location.pathname).toBe("/profile/1");
  });

  it("should handle undefined routes", () => {
    const badLink = document.getElementById("bad-link");
    badLink?.click();
    expect(location.pathname).toBe("/404");
    expect(document.title).toBe("404 page not found");
  });

  it("should work with a popstate event", () => {
    let fired = false;

    window.addEventListener("popstate", () => {
      fired = true;
      expect(location.pathname).toBe("/profile/1");
    }, { once: true });

    window.history.back();
    setTimeout(() => { expect(fired).toBe(true); }, 1000);
  });
});

describe("Event callbacks", () => {
  it("should fire on navigation", () => {
    const app = App();
    expect(app.classList.contains("spinner")).toBe(false);
    document.body.replaceChildren(app);

    const profileLink = document.getElementById("profile-link");
    profileLink?.click();

    expect(app.classList.contains("spinner")).toBe(true);
  });
});

describe("Navigation", () => {
  it("navigateToRoute", () => {
    document.body.replaceChildren(App());
    navigateToRoute("app_profile", { id: "4" });
    setTimeout(() => { expect(location.pathname).toBe("/profile/4"); }, 500);
  });
});
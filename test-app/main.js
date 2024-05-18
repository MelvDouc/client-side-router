// @ts-check

import { Router } from "../dist/index.js";

const routerOutlet = document.getElementById("router-outlet");
const router = new Router();

router.onNavigationStarted(() => {
  document.body.classList.add("loading");
});

router.onNavigationComplete(({ component, documentTitle }) => {
  document.title = documentTitle ? `${documentTitle} | My Website` : "My Website";
  if (component)
    routerOutlet?.replaceChildren(component);
  document.body.classList.remove("loading");
});

router
  .setRoute("/", (_, response) => {
    const anchor = createInternalLink("/profile/1", "Profile");
    response
      .setDocumentTitle("Home Page")
      .setComponent(anchor);
  })
  .setRoute("/profile/:id", async (request, response) => {
    response
      .setDocumentTitle(`Profile ${request.params.id}`)
      .setComponent(await ProfilePage());
  })
  .setRoute("*", (_request, response) => {
    const component = document.createElement("h1");
    component.innerText = "Page not found";
    response
      .setDocumentTitle(component.innerText)
      .setComponent(component);
  });

router.start();

/**
 * @param {import("../dist/index.js").PathName} href
 * @param {string} text
 */
function createInternalLink(href, text) {
  const anchor = document.createElement("a");
  anchor.innerText = text;
  anchor.href = href;
  anchor.dataset.internal = "";
  anchor.addEventListener("click", (e) => {
    e.preventDefault();
    router.navigate(href);
  });
  return anchor;
}

async function ProfilePage() {
  const anchor1 = createInternalLink("/", "Home");
  const anchor2 = createInternalLink("/404", "Nowhere");

  const p = document.createElement("p");
  const numbers = await getNumbers();
  p.innerText = numbers.join(" ");

  const fragment = new DocumentFragment();
  fragment.append(anchor1, anchor2, p);
  return fragment;
}

async function getNumbers() {
  const res = await fetch("/api/v1/numbers");
  const numbers = await res.json();
  return numbers;
}
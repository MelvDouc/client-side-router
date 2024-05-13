import { Router } from "../dist/index.js";

const routerOutlet = document.getElementById("router-outlet");
const router = new Router();

router.onNavigationStarted(() => {
  document.body.classList.add("loading");
});

router.onNavigationComplete(({ component, documentTitle }) => {
  document.title = documentTitle ? `${documentTitle} | My Website` : "My Website";
  if (component)
    routerOutlet.replaceChildren(component);
  document.body.classList.remove("loading");
});

document.addEventListener("click", (e) => {
  const { target } = e;
  if (target instanceof HTMLAnchorElement && "internal" in target.dataset) {
    e.preventDefault();
    const pathname = target.getAttribute("href");
    router.navigate(pathname);
  }
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
  .setRoute("*", (request, response) => {
    const heading = document.createElement("h1");
    heading.innerText = `Cannot get ${request.pathname}`;
    response
      .setDocumentTitle("Page not found")
      .setComponent(heading);
  });

router.start();

function createInternalLink(href, text) {
  const anchor = document.createElement("a");
  anchor.innerText = text;
  anchor.href = href;
  anchor.dataset.internal = "";
  return anchor;
}

async function ProfilePage() {
  const anchor1 = createInternalLink("/", "Home");
  const anchor2 = createInternalLink("/404", "Nowhere");

  const p = document.createElement("p");
  const res = await fetch("/api/v1/numbers");
  const numbers = await res.json();
  p.innerText = numbers.join(" ");

  const fragment = new DocumentFragment();
  fragment.append(anchor1, anchor2, p);
  return fragment;
}
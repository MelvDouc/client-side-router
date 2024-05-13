# Client-Side Router

A client-side router for vanilla JavaScript projects. It allows navigating between pages without reloading.

## Usage

Create a router instance.

```javascript
const router = new Router();
```

Add special styling during page load.

```javascript
router.onNavigationStarted(() => {
  document.body.classList.add("loading");
});
```

Update UI on navigation complete.

```javascript
const routerOutlet = document.getElementById("router-outlet");
router.onNavigationComplete(({ component, documentTitle }) => {
  document.title = `${documentTitle} | My Website`;
  if (component)
    routerOutlet.replaceChildren(component);
  document.body.classList.remove("loading");
});
```

Make all internal links use router navigation.

```javascript
document.addEventListener("click", (e) => {
  const { target } = e;
  if (target instanceof HTMLAnchorElement && "internal" in target.dataset) {
    e.preventDefault();
    const pathname = target.getAttribute("href");
    router.navigate(pathname);
  }
});
```

Define routes.

```javascript
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
```

Start routing.

```javascript
router.start();
```

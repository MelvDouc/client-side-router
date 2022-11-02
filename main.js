const mainElement = document.querySelector("main");
const pageNotFoundMessage = `<h1>Page not found</h1><a href="/">Home</a>`;

const routes = new Map()
  .set(/^\/(index\.html)?$/, {
    title: "Home",
    template: "home.html"
  })
  .set("/page1", {
    title: "Page 1",
    template: "page1.html"
  });

// Run on page load  
await handleLocation();
// Run on prev/next page navigator button click
window.addEventListener("popstate", handleLocation);
// Run on anchor click
document.addEventListener("click", async (e) => {
  if (!(e.target instanceof HTMLAnchorElement))
    return;
  // Prevent navigation
  e.preventDefault();
  // Update url
  window.history.pushState({}, "", e.target.href);
  // Update page content
  await handleLocation();
});

async function handleLocation() {
  const path = location.pathname + location.search;

  for (const key of routes.keys()) {
    if (key instanceof RegExp && key.test(path) || key === path) {
      const { title, template } = routes.get(key);
      document.title = title;
      const html = await fetch(`/templates/${template}`)
        .then((res) => res.text())
        .catch((err) => {
          console.log(err);
          return pageNotFoundMessage;
        });
      mainElement.innerHTML = html;
      return;
    }
  }

  document.title = "Page not found";
  mainElement.innerHTML = pageNotFoundMessage;
}
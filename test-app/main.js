import { Router } from "../dist/index.js";

const routerOutlet = document.getElementById("router-outlet");
const router = new Router({
  updateTitle: (title) => `${title} | My Website`
});

router.onComponentUpdate((component) => {
  routerOutlet.replaceChildren(component);
});

document.addEventListener("click", (e) => {
  const { target } = e;

  if (!(target instanceof HTMLAnchorElement) || !("internal" in target.dataset))
    return;

  e.preventDefault();
  router.navigate(target.getAttribute("href"));
});

router
  .setRoute("/", (_, response) => {
    const anchor = document.createElement("a");
    anchor.innerText = "Go to profile";
    anchor.href = "/profile/1";
    anchor.dataset.internal = "";
    response
      .setTitle("Home Page")
      .setComponent(anchor);
  })
  .setRoute("/profile/:id", (request, response) => {
    const anchor = document.createElement("a");
    anchor.innerText = "Go home";
    anchor.href = "/";
    anchor.dataset.internal = "";

    const p = document.createElement("p");
    p.innerText = `Lorem ipsum dolor sit amet consectetur adipisicing elit. Provident ullam ut modi est optio nobis expedita vel rerum possimus mollitia doloremque suscipit culpa sapiente, rem obcaecati, eveniet aspernatur. Distinctio molestiae reiciendis repellat consectetur corrupti omnis nobis a in asperiores quos hic facilis accusantium, alias maiores id nam earum sunt fuga porro nostrum officia quis odit inventore aspernatur. Nobis temporibus officiis vel doloremque illo alias voluptate repellat maxime aliquam beatae rerum hic quae odio, dignissimos aut, cum voluptatem. Ea recusandae distinctio quibusdam quas quaerat voluptatem nisi facere quae fuga culpa minima necessitatibus tempora suscipit et debitis officia, at veniam repellat animi?`;

    const fragment = new DocumentFragment();
    fragment.append(anchor, p);
    response
      .setTitle(`Profile ${request.params.id}`)
      .setComponent(fragment);
  })
  .setRoute("*", (request, response) => {
    const heading = document.createElement("h1");
    heading.innerText = `Cannot get ${request.pathname}`;
    response
      .setTitle("Page not found")
      .setComponent(heading);
  });

router.start();
import { initDsx } from "@melvdouc/dsx";
import { Route, Router, navigateToRoute } from "$/src/index";

initDsx();

export function App() {
  const onNavStarted = () => {
    return document.getElementById("App")?.classList.add("spinner");
  };
  const onNavComplete = () => {
    setTimeout(() => {
      document.getElementById("App")?.classList.remove("spinner");
    }, 1000);
  };

  return (
    <div id="App">
      <nav>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/profile/1" id="profile-link">Profile 1</a></li>
          <li><a href="/404" id="bad-link">404</a></li>
        </ul>
      </nav>
      <main>
        <Router onNavStarted={onNavStarted} onNavComplete={onNavComplete} internalLinks>
          <Route path="/" component={HomePage} name="app_home" />
          <Route path="/profile/:id" component={ProfilePage} name="app_profile" />
        </Router>
      </main>
    </div>
  ) as HTMLElement;
}

function HomePage() {
  return (
    <h1>Home Page</h1>
  );
}

function ProfilePage({ id }: { id: string; }) {
  const goToNextProfile = () => {
    navigateToRoute("app_profile", { id: String(+id + 1) });
  };

  return (
    <>
      <h1>Profile {id}</h1>
      <button id="next-profile" on:click={goToNextProfile}>Next profile</button>
    </>
  );
}
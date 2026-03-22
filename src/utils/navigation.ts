import { navigate } from "astro:transitions/client";

export function handleNavigation(
  sceneId: string,
  floorId: string,
  isNewFloorScene = false
) {
  const href = isNewFloorScene ? `/${sceneId}` : `/${floorId}/${sceneId}`;
  if (isNewFloorScene) {
    // client hard transition triggering page refresh
    window.location.assign(href);
  } else {
    // persist pannellum viewer and transition astro components
    navigate(href, { history: "push" });
    window.pannellumViewer.loadScene(`${sceneId}`);
  }
}

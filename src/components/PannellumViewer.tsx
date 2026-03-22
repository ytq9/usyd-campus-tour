// src/components/PannellumViewer.jsx
import React, { useEffect, useRef } from "react";
import "pannellum/build/pannellum.css";
import "pannellum/build/pannellum.js";
import ReactDOM from "react-dom/client";
import HotspotBtn from "./viewer/HotspotBtn";

const PannellumViewer = ({
  floor = "",
  initialScene = {},
  restScenes = {},
}) => {
  const viewerRef = useRef(null);

  const logFoo = (hotSpotDiv: HTMLDivElement, args = {}) => {
    // console.log(hotSpotDiv);
    hotSpotDiv.onclick = null;
    // hotSpotDiv.ontouchstart = null;

    hotSpotDiv.classList.add("pointer-events-none");

    const root = ReactDOM.createRoot(hotSpotDiv);
    root.render(<HotspotBtn args={{ ...args, hotSpotDiv }} />);
  };

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.pannellum &&
      viewerRef.current
    ) {
      const scenes = Object.fromEntries(
        Object.entries(restScenes).map(([id, sceneData = {}]) => [
          id,
          {
            ...sceneData,
            hotSpots: sceneData.hotSpots.map((e) => ({
              type: e.type,
              pitch: e.pitch,
              yaw: e.yaw,
              text: e.text,
              sceneId: e.sceneId,
              createTooltipFunc: logFoo,
              createTooltipArgs: { ...e, floorName: floor },
            })),
          },
        ])
      );
      const pannellumViewer = window.pannellum.viewer(viewerRef.current, {
        autoLoad: true,
        default: {
          firstScene: initialScene.sceneId,
          sceneFadeDuration: 500,
        },
        scenes: scenes,
      });
      window.pannellumViewer = pannellumViewer;
    }
  }, []);

  return (
    <div
      ref={viewerRef}
      className="h-dvh w-dvw inset-0 absolute"
      id="panorama"
    />
  );
};

export default PannellumViewer;

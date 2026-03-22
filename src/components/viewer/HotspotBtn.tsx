import { ArrowUpCircleIcon } from "@heroicons/react/20/solid";
import InfoHotspot from "./InfoHotspot";

import { handleNavigation } from "@/utils/navigation";
import { useEffect } from "react";

export default function HotspotBtn({ args = {} }) {
  useEffect(() => {
    if (args?.hotSpotDiv?.ontouchend) {
      // console.log(args.hotSpotDiv.ontouchend);
      args.hotSpotDiv.ontouchend = null;
    }
  }, []);
  const localClick = () => {
    const isNewFloorScene = args.navType === "newFloorScene";
    console.log("handleNav", {
      sceneId: args.sceneId,
      floorName: args.floorName,
      isNewFloorScene,
    });

    handleNavigation(args.sceneId, args.floorName, isNewFloorScene);
  };
  if (args.type === "info") {
    return <InfoHotspot {...args} />;
  }

  return (
    <button onClick={localClick} className="pointer-events-auto cursor-pointer">
      <span className="absolute inline-flex size-12 animate-ping rounded-full bg-ochre opacity-75"></span>
      <ArrowUpCircleIcon className="relative inline-flex size-12 transition duration-300 fill-white hover:scale-110 hover:fill-gray-200" />
    </button>
  );
}

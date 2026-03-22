import { InformationCircleIcon } from "@heroicons/react/20/solid";

export default function InfoHotspot(props: any) {
  const { sceneId, code } = props;

  const snakeSceneId = (sceneId || code).replace(/[*+~.()'"!:@]/g, "_");
  return (
    <>
      <button
        className="pointer-events-auto cursor-pointer"
        type="button"
        onClick={() =>
          document.getElementById(`${snakeSceneId}_modal`)?.showModal()
        }
      >
        <span className="absolute inline-flex size-10 animate-ping rounded-full bg-ochre opacity-75"></span>
        <InformationCircleIcon className="relative inline-flex size-10 transition duration-300 fill-black bg-white rounded-full hover:scale-110" />
      </button>
    </>
  );
}

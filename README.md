# Astro 360 tour webapp template!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src/
│   ├── layouts/
│   │   └── Layout.astro
│   └── pages/
│       └── index.astro
└── package.json
```

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## Dev guide

### Creating tours

`/src/config/tour.json` is the overarching structure of the app. `config/floorplans` will contain the `[floorId].json` configuration of each floor of the tour and configuration of each scene all of its hotspots.

`/src/config/tour.json` should be described below and with their following types:

This file determines where all the floor configurations and their order, the svg map and the `"hotSpotPoints"` describes the hotspot scenes that navigateable on the the hotspot map.

The hotspot svg map requires a `<g id="<floorId>-hotspot-container"/>` to be inserted inside of the svg-tag.

`"<sceneId>"` - preferable to be lower case skewercase with only alphanumberical values

```json
{
  "landingPageTitle": "<string>",
  "defaultFloor": 0, // integer to point to floorplans array
  "floorplans": [
    {
      "floorName": "<string>",
      "config": "<floorId>.json",
      "floorplan": "/tour/floorplan/<floorId>.svg", // references svg in public dir public/tour/floorplan/
      "initialSceneId": "<sceneId>",
      "hotSpotPoints": [
        { "sceneId": "<sceneId>", "cx": "<int-string>", "cy": "<int-string>", "fill": "<colour-hex-string" },
        ...
      ]
    },
    ...
  ]
}
```

`/src/config/floorplans/<floorId>.json` should be described below and with their following types:

It is in record format where the config is a map of `sceneId` to the scene details described below:

`"<sceneId>", "<infoId>"` - preferable to be lower case skewercase with only alphanumberical values

If a hotSpot goes to a different floor its id can be assigned to:

```json
{
  "<sceneId>": {
    "title": "<string>",
    "panorama": "/tour/panoramas/<floorId>/<sceneId>.jpg", // references svg in public dir public/tour/panoramas/<floorId>/<sceneId>
    "yaw": 110, // number
    "rotation": 10, // number
    "pitch": 0, // number
    "hfov": 120, // number
    "hotSpots": [
      {
        "pitch": -13, // number
        "yaw": -114, // number
        "type": "scene",
        "text": "<string>",
        "sceneId": "<sceneId>"
      },
      {
        "code": "<infoId>",
        "pitch": -5.4, // number
        "yaw": 150, // number
        "type": "info",
        "text": "<string>",
        "toolname": "<string>",
        "description": "<string | string-html>",
        "highlight": "<string>"
      },
      {
        "pitch": -13, // number
        "yaw": -114, // number
        "type": "scene",
        "text": "<string>",
        "sceneId": "<floorId>/<sceneId>", // to transition to new floor and specific sceneId
        "navType": "newFloorScene"
      }
    ]
  }
}
```

### Styling

`d-` class prefix to use daisyUI styling and `d-*-neutral` to use daisyUI components and remove their base styling - required when mixing and matching components.

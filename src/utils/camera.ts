import { Bounds, getBox, getViewport, screenToCanvas } from "./canvas";
import { Camera, Point } from "../types/canvas";

export type ZoomRequest = {
  center: Point;
  dz: number;
};

export function centerCameraAt(camera: Camera, x: number, y: number): Camera {
  return {
    x: x,
    y: y,
    z: camera.z,
  };
}

export function panCameraBy(camera: Camera, dx: number, dy: number): Camera {
  return {
    x: camera.x - dx / camera.z,
    y: camera.y - dy / camera.z,
    z: camera.z,
  };
}

export function zoomCameraTo(camera: Camera, point: Point, dz: number): Camera {
  const zoom = Math.min(
    Math.max(camera.z - dz * camera.z, Bounds.minZ),
    Bounds.maxZ,
  );

  const p1 = screenToCanvas(point, camera);
  const p2 = screenToCanvas(point, { ...camera, z: zoom });

  return {
    x: camera.x + (p2.x - p1.x),
    y: camera.y + (p2.y - p1.y),
    z: zoom,
  };
}

export function requestZoomIn(camera: Camera): ZoomRequest {
  const i = Math.round(camera.z * 100) / 25;
  const nextZoom = (i + 1) * 0.25;

  const { width, height } = getBox();
  const center = { x: width / 2, y: height / 2 };
  return { center, dz: camera.z - nextZoom };
}

export function requestZoomOut(camera: Camera): ZoomRequest {
  const i = Math.round(camera.z * 100) / 25;
  const nextZoom = (i - 1) * 0.25;

  const { width, height } = getBox();
  const center = { x: width / 2, y: height / 2 };
  return { center, dz: camera.z - nextZoom };
}

export function updateCamera(
  camera: Camera,
  updater: (camera: Camera) => Camera,
): Camera {
  const nextCamera = updater(camera);
  const nextViewport = getViewport(nextCamera, getBox());

  let x = Math.min(nextCamera.x, Bounds.minX);
  let y = Math.min(nextCamera.y, Bounds.minY);
  let z = Math.max(nextCamera.z, Bounds.minZ);

  const isOverflowingX = x - nextViewport.width < -Bounds.maxX;
  const isOverflowingY = y - nextViewport.height < -Bounds.maxY;

  if (isOverflowingX) {
    x = nextViewport.width - Bounds.maxX;
  }

  if (isOverflowingY) {
    const boundedY = nextViewport.height - Bounds.maxY;
    // // const deltaY = Math.max(Math.log2(boundedY - y) * 2, 0);
    // const excessDeltaY = boundedY - y;
    // const deltaY = excessDeltaY / 4;
    // y = boundedY - deltaY;
    y = boundedY;
  }

  if (nextCamera.x >= Bounds.minX && isOverflowingX) {
    x = Bounds.minX;
    z = camera.z;
  }
  if (nextCamera.y >= Bounds.minY && isOverflowingY) {
    y = Bounds.minY;
    z = camera.z;
  }

  return {
    x,
    y,
    z,
  };
}

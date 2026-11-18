import { useEffect, useRef, useState } from "react";

export default function useLazyMap() {
  const mapRef = useRef(null);

  const [shouldLoadMap, setShouldLoadMap] = useState(function () {
    return typeof IntersectionObserver === "undefined";
  });

  useEffect(() => {
    if (shouldLoadMap) {
      return;
    }

    const mapElement = mapRef.current;

    if (!mapElement) {
      return;
    }

    const mapObserver = new IntersectionObserver(function (entries) {
      const firstEntry = entries[0];

      if (firstEntry.isIntersecting) {
        setShouldLoadMap(true);
        mapObserver.disconnect();
      }
    }, {
      rootMargin: "300px 0px",
      threshold: 0,
    });

    mapObserver.observe(mapElement);

    return function stopWatchingMap() {
      mapObserver.disconnect();
    };
  }, [shouldLoadMap]);

  return [mapRef, shouldLoadMap];
}

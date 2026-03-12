mapboxgl.accessToken = mapToken;
const coordinates = Array.isArray(window.listingCoordinates) ? window.listingCoordinates : [77.2090, 28.6139];
const map = new mapboxgl.Map({
    container: "map",
    center: coordinates,
    zoom: 9,
});
const popupHtml = window.listingLocation
    ? `<h4>${window.listingLocation}</h4><p>Exact location provided after booking</p>`
    : `<p>Exact location provided after booking</p>`;
new mapboxgl.Marker({ color: "red" })
    .setLngLat(coordinates)
    .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(popupHtml))
    .addTo(map);



// const { default: axios } = require("axios");

// const BASE_URL = "https://maps.googleapis.com/maps/api/place";
// const API_KEY = 'AIzaSyDCtC15ypeYqwvjn43ZVKkPsvQfPx9_BJc'; // Replace with your Google Places API key

// const nearByPlace = (lat, lng, range) => {
//   return axios.get(BASE_URL + "/nearbysearch/json?" +
//     "location=" + lat + "," + lng + "&radius=" + range + "&keyword=car+charging" +
//     '&key=' + API_KEY
//   );
// };



// export default {
//   nearByPlace
// };

import axios from 'axios';

const API_KEY = 'AIzaSyDCtC15ypeYqwvjn43ZVKkPsvQfPx9_BJc';
const BASE_URL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
const RESTAURANT_API_URL = 'https://maps.googleapis.com/maps/api/place/textsearch/json';
const GEOCODING_URL = 'https://maps.googleapis.com/maps/api/geocode/json';

const GlobalApi = {
  snapToRoad: async (origin, destination) => {
    try {
      const path = `${origin.latitude},${origin.longitude}|${destination.latitude},${destination.longitude}`;
      const apiKey = API_KEY;
      const url = `https://roads.googleapis.com/v1/snapToRoads?interpolate=true&path=${encodeURIComponent(path)}&key=${apiKey}`;

      const response = await axios.get(url);
      console.log('snap', response)
      if (response.data && response.data.snappedPoints && response.data.snappedPoints.length > 0) {
        // Get the first snapped point for the origin and the last for the destination
        const snappedOrigin = response.data.snappedPoints[0].location;
        const snappedDestination = response.data.snappedPoints[response.data.snappedPoints.length - 1].location;

        // Return the snapped coordinates
        return {
          snappedOrigin: `${snappedOrigin.latitude},${snappedOrigin.longitude}`,
          snappedDestination: `${snappedDestination.latitude},${snappedDestination.longitude}`
        };
      } else {
        throw new Error("Couldn't snap to road");
      }
    } catch (error) {
      console.error('Error snapping to road:', error);
      throw error;
    }
  },



  reverseGeocode: async (latLng) => {
    const params = {
      latlng: latLng,
      key: API_KEY
    };

    try {
      const response = await axios.get(GEOCODING_URL, { params });
      if (response.data.status === 'OK' && response.data.results && response.data.results.length > 0) {
        return response.data.results[0].formatted_address;
      } else {
        console.error('Error reverse geocoding:', response.data.status);
        return null;
      }
    } catch (error) {
      console.error('Error in reverse geocoding:', error);
      return null;
    }
  },

  nearByPlace: async (lat, lng, range) => {
    const params = {
      location: `${lat},${lng}`,
      radius: range,
      keyword: 'car charging',
      key: API_KEY,
    };

    return axios.get(BASE_URL, { params });
  },

  fetchDistance: async (origin, destination) => {
    try {
      const params = {
        units: 'metric',
        origins: origin,
        destinations: destination,
        key: API_KEY,
      };

      const response = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', { params });

      if (response.data.status === 'OK') {
        const distanceText = response.data.rows[0].elements[0].distance.text;
        return distanceText;
      } else {
        console.error('Error calculating directions:', response.data.status);
        return 'Error';
      }
    } catch (error) {
      console.error('Error fetching directions:', error);
      return 'Error';
    }
  },

  getNearestRestaurants: async (latitude, longitude) => {
    const radius = 500; // Specify your desired radius
    const types = 'restaurant'; // Specify your desired place types
    const keyword = 'restaurant'; // You can specify other keywords or filters

    const params = {
      location: `${latitude},${longitude}`,
      radius,
      types,
      keyword,
      key: API_KEY,
    };

    try {
      const response = await axios.get(RESTAURANT_API_URL, { params });
      return response.data.results;
    } catch (error) {
      console.error('Error fetching nearest restaurants:', error);
      return [];
    }
  },

  getEvStationsAlongRoute: async (origin, destination, range) => {
    try {
      const directionsResponse = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
        params: {
          origin: origin,
          destination: destination,
          key: API_KEY,
          travelMode: 'DRIVING'
        }
      });

      if (directionsResponse.data.status !== 'OK') {
        console.error(directionsResponse.data.status);
        return [];
      }

      const route = directionsResponse.data.routes[0];
      let cumulativeDistance = 0;
      let stationsWithinRange = [];

      for (let i = 0; i < route.legs[0].steps.length; i++) {
        const step = route.legs[0].steps[i];
        cumulativeDistance += step.distance.value;

        const rangeInMeters = range * 1000;
        if (cumulativeDistance <= rangeInMeters) {
          const stepStations = await GlobalApi.nearByPlace(step.start_location.lat, step.start_location.lng, range);
          stationsWithinRange = stationsWithinRange.concat(stepStations.data.results);
        } else {
          break;
        }
      }

      const uniqueStations = Array.from(new Set(stationsWithinRange.map(s => s.place_id)))
        .map(id => {
          return stationsWithinRange.find(s => s.place_id === id);
        });

      return uniqueStations;

    } catch (error) {
      console.error("Error getting EV stations along route:", error);
      return [];
    }
  }

};

export default GlobalApi;

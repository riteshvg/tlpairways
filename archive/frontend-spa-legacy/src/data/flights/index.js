import flightRoutes from '../flight_routes.json';

const allRoutes = flightRoutes.routes;

export const getRoutes = () => allRoutes;

export const getRoute = (origin, destination) => {
  const routeKey = `${origin}-${destination}`;
  return allRoutes[routeKey];
};

export const getAvailableRoutes = () => {
  return Object.keys(allRoutes).map(route => {
    const [origin, destination] = route.split('-');
    return {
      origin,
      destination,
      ...allRoutes[route]
    };
  });
};

export default allRoutes; 
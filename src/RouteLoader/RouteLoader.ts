import NavRequest from "$/src/context/NavRequest";
import NavResponse from "$/src/context/NavResponse";
import RequestKind from "$/src/context/RequestKind";
import { createNameGenerator } from "$/src/RouteLoader/name-generator";
import RouteDefinition from "$/src/RouteLoader/RouteDefinition";
import type { Component, ComponentParams } from "$/src/types";

const nextName = createNameGenerator();
const definitions = new Map<string, RouteDefinition>();
const responseCache = new Map<string, NavResponse | null>();

function addRouteDefinition(path: string, component: Component, routeName?: string): void {
  const routeDefinition = new RouteDefinition(path, component);
  definitions.set(routeName ?? nextName(), routeDefinition);
}

function createRequestFromRouteName(routeName: string, params: ComponentParams): NavRequest {
  const routeDefinition = definitions.get(routeName);

  if (!routeDefinition)
    throw new Error(`No route was found for name "${routeName}".`);

  const pathName = routeDefinition.realPathName(params);
  return new NavRequest(RequestKind.Normal, pathName);
}

function getResponse(pathName: string): NavResponse {
  const cachedResponse = responseCache.get(pathName);

  if (cachedResponse)
    return cachedResponse;

  const response = getResponseUncached(pathName);
  responseCache.set(pathName, response);
  return response;
}

function getResponseUncached(pathName: string): NavResponse {
  for (const [routeName, routeDefinition] of definitions.entries()) {
    const [component, params] = routeDefinition.componentAndParams(pathName);

    if (component)
      return new NavResponse(routeName, params, component);
  }

  return NavResponse.defaultResponse();
}

export default {
  addRouteDefinition,
  createRequestFromRouteName,
  getResponse
};
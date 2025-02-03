import NavRequest from "$/src/context/NavRequest";
import type RequestKind from "$/src/context/RequestKind";
import type { NavCompleteResult, OptionalPromise } from "$/src/types";

const EventTypes = {
  NavRequest: "router-nav-request",
  NavComplete: "router-nav-complete"
} as const;

const eventTarget = new EventTarget();

const [emitNavRequest, onNavRequest] = createEventHandlers<NavRequest>(EventTypes.NavRequest);
const [emitNavComplete, onNavComplete] = createEventHandlers<NavCompleteResult>(EventTypes.NavComplete);

function createEventHandlers<T>(eventType: EventType): [EmitFn<T>, ListenFn<T>] {
  const emit = (detail: T): void => {
    eventTarget.dispatchEvent(new CustomEvent(eventType, { detail }));
  };

  const listen = (listener: Listener<T>): void => {
    eventTarget.addEventListener(eventType, (e) => {
      listener((e as CustomEvent<T>).detail);
    });
  };

  return [emit, listen];
}

function emitNavRequestOf(kind: RequestKind, pathName: string) {
  emitNavRequest(new NavRequest(kind, pathName));
}

export default {
  emitNavRequest,
  emitNavRequestOf,
  emitNavComplete,
  onNavRequest,
  onNavComplete
};

type EventType = typeof EventTypes[keyof typeof EventTypes];
type EmitFn<T> = (detail: T) => void;
type Listener<T> = (detail: T) => OptionalPromise<void>;
type ListenFn<T> = (listener: Listener<T>) => void;
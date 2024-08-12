export type GTagFn = (name: "event", eventName: string, options: object) => void;

export function publishEvent(eventName: string, options: object) {
  const gtag = (window as unknown as any).gtag as GTagFn;

  gtag("event", eventName, options);
}

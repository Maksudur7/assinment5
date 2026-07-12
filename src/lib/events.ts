export type GlobalErrorAction = "login" | "home" | "dismiss";

export interface GlobalErrorDetail {
  title: string;
  message: string;
  action: GlobalErrorAction;
}

export const triggerGlobalError = (detail: GlobalErrorDetail) => {
  if (typeof window !== "undefined") {
    const event = new CustomEvent<GlobalErrorDetail>("ngv-api-error", { detail });
    window.dispatchEvent(event);
  }
};

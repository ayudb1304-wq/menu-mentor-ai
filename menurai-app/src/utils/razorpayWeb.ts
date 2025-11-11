const SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

let razorpayConstructor: RazorpayConstructor | null = null;

const loadScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof document === "undefined") {
      reject(new Error("Razorpay checkout script can only be loaded in the browser."));
      return;
    }

    if (document.querySelector(`script[src="${SCRIPT_URL}"]`)) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Failed to load Razorpay checkout script"));

    document.body.appendChild(script);
  });
};

export const ensureRazorpayLoaded = async (): Promise<RazorpayConstructor> => {
  if (razorpayConstructor) {
    return razorpayConstructor;
  }

  await loadScript();

  if (typeof window.Razorpay !== "function") {
    throw new Error("Razorpay is not available on window after script load.");
  }

  razorpayConstructor = window.Razorpay;
  return razorpayConstructor;
};

type OpenOptions = RazorpayOptions & {
  subscription_id: string;
  key: string;
};

export const openRazorpayCheckout = async (
  options: OpenOptions
): Promise<unknown> => {
  const Razorpay = await ensureRazorpayLoaded();
  return new Promise((resolve, reject) => {
    const originalHandler = options.handler;
    const originalModal = options.modal;

    const instance = new Razorpay({
      ...options,
      handler: (response: unknown) => {
        originalHandler?.(response);
        resolve(response);
      },
      modal: {
        ...(originalModal ?? {}),
        ondismiss: () => {
          originalModal?.ondismiss?.();
          reject(new Error("Payment cancelled"));
        },
      },
    });

    instance.open();
  });
};


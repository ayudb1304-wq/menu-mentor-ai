declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }

  type RazorpayConstructor = {
    new (options: RazorpayOptions): {
      open: () => void;
    };
  };

  interface RazorpayPreferences {
    show_default_blocks?: boolean;
  }

  interface RazorpayModalOptions {
    ondismiss?: () => void;
    escape?: boolean;
    confirm_close?: boolean;
    animation?: boolean;
  }

  interface RazorpayOptions {
    key: string;
    amount?: number;
    currency?: string;
    name?: string;
    description?: string;
    subscription_id?: string;
    order_id?: string;
    image?: string;
    handler?: (response: unknown) => void;
    prefill?: {
      name?: string;
      email?: string;
      contact?: string;
    };
    notes?: Record<string, unknown>;
    theme?: {
      color?: string;
    };
    modal?: RazorpayModalOptions;
    config?: {
      display?: {
        blocks?: unknown;
        sequence?: unknown;
        preferences?: RazorpayPreferences;
      };
    };
  }
}

export {};


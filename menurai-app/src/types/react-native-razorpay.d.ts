declare module 'react-native-razorpay' {
  export interface RazorpayPrefillOptions {
    email?: string;
    contact?: string;
    name?: string;
  }

  export interface RazorpayThemeOptions {
    color?: string;
  }

  export interface RazorpayRetryOptions {
    enabled?: boolean;
    max_count?: number;
  }

  export interface RazorpayOptions {
    key: string;
    subscription_id: string;
    name?: string;
    description?: string;
    prefill?: RazorpayPrefillOptions;
    theme?: RazorpayThemeOptions;
    retry?: RazorpayRetryOptions;
    notes?: Record<string, unknown>;
  }

  export interface RazorpaySuccessResponse {
    razorpay_payment_id?: string;
    razorpay_subscription_id?: string;
    razorpay_signature?: string;
  }

  export interface RazorpayErrorResponse {
    code?: number | string;
    description?: string;
    step?: string;
    reason?: string;
    field?: string;
    source?: string;
    metadata?: Record<string, unknown>;
  }

  interface RazorpayCheckoutStatic {
    open(options: RazorpayOptions): Promise<RazorpaySuccessResponse>;
  }

  const RazorpayCheckout: RazorpayCheckoutStatic;
  export default RazorpayCheckout;
}


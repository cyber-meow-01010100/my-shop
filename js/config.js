/* ============================================================
   BUY ALCHIMIA — CONFIG
   ඔයාගේ ගිණුම් වලින් ලැබෙන real keys මෙතනට දාන්න.
   Setup instructions README.md එකේ තියෙනවා.
   ============================================================ */
window.ALCHIMIA_CONFIG = {
  // Google Cloud Console > APIs & Services > Credentials > OAuth Client ID
  // (Application type: Web application)
  GOOGLE_CLIENT_ID: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",

  // Stripe Dashboard > Developers > API keys > Publishable key (pk_test_... or pk_live_...)
  STRIPE_PUBLISHABLE_KEY: "pk_test_YOUR_STRIPE_PUBLISHABLE_KEY",

  // PayPal Developer Dashboard > Apps & Credentials > Client ID
  PAYPAL_CLIENT_ID: "YOUR_PAYPAL_CLIENT_ID",

  // Backend API base URL (Node/Express server)
  API_BASE_URL: "http://localhost:4000/api",

  CURRENCY: "USD",
  CURRENCY_SYMBOL: "$"
};

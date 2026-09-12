import OrderConfirmationClient from "./client";

export function generateStaticParams() {
  // Pre-generate a few sample order IDs; actual order data is client-side
  return [
    { id: "PRF-DEMO" },
    { id: "PRF-WELCOME" },
    { id: "PRF-SAMPLE" },
  ];
}

export const dynamicParams = false;

export default function OrderConfirmationPage() {
  return <OrderConfirmationClient />;
}

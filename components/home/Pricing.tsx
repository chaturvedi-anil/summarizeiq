import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";

type PriceType = {
  id: string;
  name: string;
  description: string;
  price: number;
  priceId: string;
  items: string[];
  paymentLink: string;
};
const plans = [
  {
    id: "basic",
    name: "Basic",
    price: 9,
    description: "Perfect for occasional use",
    items: [
      "5 PDF summaries per month",
      "Standard processing speed",
      "Email support",
    ],
    paymentLink: "",
    priceId: "",
  },
  {
    id: "pro",
    name: "Pro",
    price: 19,
    description: "For professionals and teams",
    items: [
      "Unlimited PDF summaries",
      "Priority processing",
      "24/7 priority support",
      "Markdown Export",
    ],
    paymentLink: "",
    priceId: "",
  },
];

function PricingCard({
  name,
  priceId,
  description,
  items,
  id,
  paymentLink,
  price,
}: PriceType) {
  return (
    <div className="relative w-full max-w-lg">
      <div
        className={cn(
          "relative flex flex-col h-full gap-4 lg:gap-8 z-10 p-8 border-[1px] border-gray-500/20 rounded-2xl",
          id === "pro" && "border-rose-500 gap-5 border-2"
        )}
      >
        <div className="flex justify-between items-center gap-4">
          <div>
            <p className="text-lg lg:text-xl font-bold capitalize">{name}</p>
            <p className="text-base-content/80 mt-2">{description}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <p className="text-5xl tracking-tight font-extrabold">${price}</p>
          <div>
            <p className="text-xs uppercase font-semibold">USD</p>
            <p className="text-xs">/month</p>
          </div>
        </div>

        <div>
          {items.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </div>

        <div>
          <Link href={paymentLink}>Buy Now</Link>
        </div>
      </div>
    </div>
  );
}

export default function Pricing() {
  return (
    <section id="pricing" className="relative overflow-hidden">
      <div className="py-12 lg:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-bold text-xl uppercase mb-4 text-rose-500">
            Pricing
          </h2>
        </div>
        <div className="relative flex justify-center flex-col lg:flex-row items-center lg:items-stretch gap-8">
          {plans.map((plan) => (
            <PricingCard key={plan.id} {...plan} />
          ))}
        </div>
      </div>
    </section>
  );
}

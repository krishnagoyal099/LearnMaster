import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Star, Rocket } from "lucide-react";
import { Header } from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const plans = [
  {
    name: "Free",
    price: "0",
    period: "month",
    icon: <Star className="h-6 w-6 text-yellow-500" />,
    features: [
      "Access to video & book resources",
      "Basic Pomodoro timer",
      "Focus break games",
      "Progress tracker",
      "Community leaderboard",
    ],
    cta: "Get Started",
    highlight: false,
  },
  {
    name: "Pro",
    price: "7",
    period: "month",
    icon: <Rocket className="h-6 w-6 text-purple-600" />,
    features: [
      "Everything in Free",
      "Unlimited AI book recommendations",
      "Advanced progress analytics",
      "Priority support",
      "Early access to new features",
    ],
    cta: "Upgrade to Pro",
    highlight: true,
  },
];

export default function Pricing() {
  const [tab, setTab] = useState("monthly");
  const [selected, setSelected] = useState("Pro"); // Default selected plan

  return (
    <div className="min-h-screen gradient-bg flex flex-col">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-16 flex-1">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Pricing</h1>
          <p className="text-muted-foreground mb-8">
            Choose the plan that fits your learning journey. Start for free,
            upgrade anytime.
          </p>
          {/* Pricing Tabs */}
          <Tabs
            defaultValue="monthly"
            value={tab}
            onValueChange={setTab}
            className="w-full mb-8"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly" disabled>
                Yearly (Coming Soon)
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              onClick={() => setSelected(plan.name)}
              className={`cursor-pointer rounded-2xl shadow-lg bg-white/90 dark:bg-gray-900/80 border border-border p-8 flex flex-col items-center transition-all ${
                selected === plan.name ? "ring-2 ring-purple-500 scale-105" : ""
              }`}
            >
              <div className="mb-4">{plan.icon}</div>
              <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
              <div className="text-4xl font-extrabold mb-2">
                {plan.price === "0" ? "Free" : `$${plan.price}`}
                {plan.price !== "0" && (
                  <span className="text-base font-normal text-muted-foreground">
                    / {plan.period}
                  </span>
                )}
              </div>
              <ul className="my-6 space-y-3 text-left w-full max-w-xs mx-auto">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-foreground"
                  >
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                className={`w-full mt-auto ${
                  selected === plan.name
                    ? "bg-purple-600 hover:bg-purple-700 text-white"
                    : ""
                }`}
                size="lg"
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
        <div className="text-center text-xs text-muted-foreground mt-12">
          Need a custom plan or have questions?{" "}
          <a href="mailto:support@learnmaster.com" className="underline">
            Contact us
          </a>
        </div>
      </main>
    </div>
  );
}

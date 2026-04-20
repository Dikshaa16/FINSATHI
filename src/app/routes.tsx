import { createBrowserRouter } from "react-router";
import { Root } from "./Root";
import { HomeScreen } from "./components/screens/HomeScreen";
import { InsightsScreen } from "./components/screens/InsightsScreen";
import { GoalsScreen } from "./components/screens/GoalsScreen";
import { AIChatScreen } from "./components/screens/AIChatScreen";
import { AffordabilityScreen } from "./components/screens/AffordabilityScreen";
import { FutureSimulationScreen } from "./components/screens/FutureSimulationScreen";
import { AutoFlowScreen } from "./components/screens/AutoFlowScreen";
import { PersonalityScreen } from "./components/screens/PersonalityScreen";
import { SMSSimulatorScreen } from "./components/screens/SMSSimulatorScreen";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: HomeScreen },
      { path: "insights", Component: InsightsScreen },
      { path: "goals", Component: GoalsScreen },
      { path: "ai", Component: AIChatScreen },
      { path: "affordability", Component: AffordabilityScreen },
      { path: "future-simulation", Component: FutureSimulationScreen },
      { path: "auto-flow", Component: AutoFlowScreen },
      { path: "personality", Component: PersonalityScreen },
      { path: "sms-simulator", Component: SMSSimulatorScreen },
    ],
  },
]);

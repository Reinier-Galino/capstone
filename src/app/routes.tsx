import { createBrowserRouter } from "react-router";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { RootLayout } from "./components/RootLayout";
import { InventoryPage } from "./pages/InventoryPage";
import { ForecastPage } from "./pages/ForecastPage";
import { OperationsPage } from "./pages/OperationsPage";
import { WorkforcePage } from "./pages/WorkforcePage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { PublicPage } from "./pages/PublicPage";
import { MaterialConsumptionPage } from "./pages/MaterialConsumptionPage";
import { BOMPage } from "./pages/BOMPage";
import { StaffPage } from './pages/StaffPage';

const basename = import.meta.env.BASE_URL && import.meta.env.BASE_URL !== '/'
  ? import.meta.env.BASE_URL.replace(/\/$/, '')
  : '/';

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: HomePage },
      { path: "login", Component: LoginPage },
      { path: "inventory", Component: InventoryPage },
      { path: "forecast", Component: ForecastPage },
      { path: "operations", Component: OperationsPage },
      { path: "workforce", Component: WorkforcePage },
      { path: "analytics", Component: AnalyticsPage },
      { path: "public", Component: PublicPage },
      { path: "staff", Component: StaffPage },
      { path: "consume", Component: MaterialConsumptionPage },
      { path: "bom", Component: BOMPage },
    ],
  },
], {
  basename,
});



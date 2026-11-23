import { createContext } from "react";
import { makeTheme } from "../features/dashboardHelpers";

const DashboardThemeContext = createContext(makeTheme(false));

export default DashboardThemeContext;

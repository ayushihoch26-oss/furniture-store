import { BrowserRouter } from "react-router-dom";
import ThemeModeProvider from "./theme/ThemeModeProvider";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <BrowserRouter>
      <ThemeModeProvider>
        <AppRoutes />
      </ThemeModeProvider>
    </BrowserRouter>
  );
}

export default App;

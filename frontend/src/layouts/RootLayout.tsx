import { Outlet } from "react-router-dom";
import { ThemeProvider } from "../contexts/theme";
import { AuthProvider } from "../contexts/auth";
import { Toaster } from "sonner";

export function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Outlet />
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </ThemeProvider>
  );
}

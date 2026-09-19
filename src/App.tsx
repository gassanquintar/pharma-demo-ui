import { CssBaseline, ThemeProvider, createTheme, useMediaQuery } from "@mui/material";
import { useMemo } from "react";
import ChatLayout from "./components/chat/ChatLayout";

export default function App() {
  const dark = useMediaQuery("(prefers-color-scheme: dark)");
  const theme = useMemo(() => createTheme({ palette: { mode: dark ? "dark" : "light" } }), [dark]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ChatLayout />
    </ThemeProvider>
  );
}

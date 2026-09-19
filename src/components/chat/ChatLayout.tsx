import { AppBar, Box, Tab, Tabs } from "@mui/material";
import { useState } from "react";

const TABS = ["Consultas regulatorias", "Triage de farmacovigilancia"];

export default function ChatLayout() {
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <AppBar position="static" color="default" enableColorOnDark>
        <Tabs value={tab} onChange={(_, value: number) => setTab(value)} centered>
          {TABS.map((label) => (
            <Tab key={label} label={label} />
          ))}
        </Tabs>
      </AppBar>
      <Box role="tabpanel" sx={{ flex: 1, overflowY: "auto" }} />
    </Box>
  );
}

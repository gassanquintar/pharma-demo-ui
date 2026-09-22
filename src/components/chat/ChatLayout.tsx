import { AppBar, Box, Tab, Tabs } from "@mui/material";
import { useState } from "react";
import RagView from "../rag/RagView";
import TriageView from "../triage/TriageView";

const TABS = ["Consultas regulatorias", "Triage de farmacovigilancia"];

export default function ChatLayout() {
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <AppBar position="static" color="default" enableColorOnDark>
        <Tabs
          value={tab}
          onChange={(_, value: number) => setTab(value)}
          centered
        >
          {TABS.map((label) => (
            <Tab key={label} label={label} />
          ))}
        </Tabs>
      </AppBar>
      <Box role="tabpanel" sx={{ flex: 1, minHeight: 0 }}>
        {tab === 0 && <RagView />}
        {tab === 1 && <TriageView />}
      </Box>
    </Box>
  );
}

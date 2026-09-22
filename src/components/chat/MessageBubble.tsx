import { Box, Paper } from "@mui/material";
import type { ReactNode } from "react";

interface Props {
  align: "left" | "right";
  neutral?: boolean;
  children: ReactNode;
}

export default function MessageBubble({
  align,
  neutral = false,
  children,
}: Props) {
  const user = align === "right";
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: user ? "flex-end" : "flex-start",
        mb: 1.5,
      }}
    >
      <Paper
        variant={neutral ? "outlined" : "elevation"}
        elevation={user ? 0 : 1}
        sx={{
          maxWidth: "75%",
          px: 2,
          py: 1.25,
          whiteSpace: "pre-wrap",
          ...(user && {
            bgcolor: "primary.main",
            color: "primary.contrastText",
          }),
          ...(neutral && {
            bgcolor: "action.hover",
            borderStyle: "dashed",
            color: "text.secondary",
          }),
        }}
      >
        {children}
      </Paper>
    </Box>
  );
}

import { Box, Button, TextField } from "@mui/material";
import { useState, type FormEvent } from "react";

interface Props {
  disabled: boolean;
  onSend: (text: string) => void;
}

export default function MessageInput({ disabled, onSend }: Props) {
  const [text, setText] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
  };

  return (
    <Box
      component="form"
      onSubmit={submit}
      sx={{ display: "flex", gap: 1, p: 2 }}
    >
      <TextField
        fullWidth
        size="small"
        label="Pregunta"
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
      <Button
        type="submit"
        variant="contained"
        disabled={disabled || !text.trim()}
      >
        Enviar
      </Button>
    </Box>
  );
}

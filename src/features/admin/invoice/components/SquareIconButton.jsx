import { IconButton } from "@mui/material";
import { BROWN } from "../constants/invoice.constants";

export default function SquareIconButton({ children, label, onClick, theme, active }) {
  return (
    <IconButton
      aria-label={label}
      title={label}
      onClick={onClick}
      sx={{
        width: 40,
        height: 40,
        borderRadius: 2,
        border: `1px solid ${active ? BROWN : theme.border}`,
        color: active ? BROWN : theme.iconButton,
        "&:hover": { bgcolor: theme.soft },
      }}
    >
      {children}
    </IconButton>
  );
}

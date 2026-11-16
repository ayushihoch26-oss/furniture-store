export const BROWN = "#947458";

export const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 0,
    fontSize: 14,
    bgcolor: "var(--c-ffffff)",
    "& fieldset": { borderColor: "var(--c-d9d9d9)" },
    "&:hover fieldset": { borderColor: "var(--c-111111)" },
    "&.Mui-focused fieldset": { borderColor: BROWN, borderWidth: 1 },
  },
  "& .MuiInputLabel-root": { fontSize: 14, color: "var(--c-777777)" },
  "& .MuiInputLabel-root.Mui-focused": { color: BROWN },
};

export const primaryBtnSx = {
  bgcolor: BROWN,
  color: "#fff",
  borderRadius: 0,
  height: 48,
  fontSize: 14,
  textTransform: "none",
  "&:hover": { bgcolor: "#7d6149" },
};

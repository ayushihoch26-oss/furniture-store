import { Box, Button, Typography } from "@mui/material";
import {
  AddPhotoAlternateOutlined,
  DeleteOutlined,
} from "@mui/icons-material";
import { BROWN, BROWN_DARK, RED } from "../constants/roles.constants";
import ProfileAvatar from "./ProfileAvatar";

export default function ProfilePhotoUpload({
  image,
  theme,
  darkMode,
  onUpload,
  onDelete,
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        flexWrap: "wrap",
        mb: 3,
      }}
    >
      <ProfileAvatar src={image} size={64} theme={theme} />

      <Button
        component="label"
        variant="contained"
        disableElevation
        startIcon={<AddPhotoAlternateOutlined />}
        sx={{
          height: 40,
          bgcolor: BROWN,
          textTransform: "none",
          "&:hover": { bgcolor: BROWN_DARK },
        }}
      >
        Upload New
        <input type="file" accept="image/*" hidden onChange={onUpload} />
      </Button>

      <Button
        variant="outlined"
        startIcon={<DeleteOutlined />}
        disabled={!image}
        onClick={onDelete}
        sx={{
          height: 40,
          color: RED,
          borderColor: theme.border,
          textTransform: "none",
          "&:hover": { borderColor: RED, bgcolor: theme.dangerHover },
          ...(darkMode && {
            "&.Mui-disabled": {
              color: theme.muted,
              borderColor: theme.border,
              opacity: 0.6,
            },
          }),
        }}
      >
        Delete
      </Button>

      <Typography sx={{ fontSize: 11, color: theme.muted }}>
        PNG or JPG, up to 2 MB
      </Typography>
    </Box>
  );
}

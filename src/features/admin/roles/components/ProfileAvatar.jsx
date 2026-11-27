import { Avatar } from "@mui/material";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import { BROWN } from "../constants/roles.constants";

// profile picture, or a person icon when there is no image
export default function ProfileAvatar({ src, size, theme }) {
  return (
    <Avatar
      src={src || undefined}
      sx={{
        width: size,
        height: size,
        bgcolor: theme.avatarBg,
        color: BROWN,
      }}
    >
      <PersonOutlinedIcon sx={{ fontSize: size * 0.55 }} />
    </Avatar>
  );
}

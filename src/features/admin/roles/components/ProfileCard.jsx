import { Box, IconButton, Typography } from "@mui/material";
import { EditOutlined, ShareOutlined } from "@mui/icons-material";
import { BROWN } from "../constants/roles.constants";
import { getFullName } from "../utils/roles.utils";
import Card from "./Card";
import ProfileAvatar from "./ProfileAvatar";

export default function ProfileCard({
  profile,
  theme,
  darkMode,
  onEdit,
  onShare,
}) {
  return (
    <Card theme={theme} darkMode={darkMode} sx={{ pb: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography sx={{ fontSize: 18, fontWeight: 700 }}>Profile</Typography>

        <Box>
          <IconButton
            size="small"
            title="Edit profile"
            onClick={onEdit}
            sx={{ color: BROWN }}
          >
            <EditOutlined fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            title="Share"
            onClick={onShare}
            sx={{ color: BROWN }}
          >
            <ShareOutlined fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          mt: 1,
        }}
      >
        <ProfileAvatar src={profile.image} size={96} theme={theme} />

        <Typography sx={{ fontSize: 18, fontWeight: 700, mt: 1.5 }}>
          {getFullName(profile)}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Typography sx={{ fontSize: 13, color: theme.email }}>
            {profile.email}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
}

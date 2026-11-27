import { Box, Button, Typography } from "@mui/material";
import { CloseOutlined, EditOutlined, SaveOutlined } from "@mui/icons-material";
import { BROWN, BROWN_DARK } from "../constants/roles.constants";
import { getOutlineButtonSx } from "../utils/roles.theme";
import Card from "./Card";
import ProfilePhotoUpload from "./ProfilePhotoUpload";
import ProfileForm from "./ProfileForm";

export default function ProfileUpdateCard({
  profileState,
  theme,
  labelTheme,
  darkMode,
  menuProps,
}) {
  const {
    profile,
    draft,
    editing,
    draftInvalid,
    updateDraft,
    startEdit,
    cancelEdit,
    saveProfile,
    handleImageChange,
    deleteImage,
  } = profileState;

  const outlineButtonSx = getOutlineButtonSx(theme);

  return (
    <Card theme={theme} darkMode={darkMode} sx={{ p: { xs: 2, sm: 3 } }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2.5,
        }}
      >
        <Typography sx={{ fontSize: 18, fontWeight: 700 }}>
          Profile Update
        </Typography>

        {editing ? (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<CloseOutlined />}
              onClick={cancelEdit}
              sx={{ height: 36, ...outlineButtonSx }}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              disableElevation
              startIcon={<SaveOutlined />}
              disabled={draftInvalid}
              onClick={saveProfile}
              sx={{
                height: 36,
                bgcolor: BROWN,
                textTransform: "none",
                "&:hover": { bgcolor: BROWN_DARK },
                ...(darkMode && {
                  "&.Mui-disabled": {
                    bgcolor: theme.border,
                    color: theme.muted,
                  },
                }),
              }}
            >
              Save
            </Button>
          </Box>
        ) : (
          <Button
            variant="outlined"
            startIcon={<EditOutlined />}
            onClick={startEdit}
            sx={{ height: 36, ...outlineButtonSx }}
          >
            Edit
          </Button>
        )}
      </Box>

      <ProfilePhotoUpload
        image={profile.image}
        theme={theme}
        darkMode={darkMode}
        onUpload={handleImageChange}
        onDelete={deleteImage}
      />

      <ProfileForm
        draft={draft}
        editing={editing}
        onChange={updateDraft}
        theme={theme}
        labelTheme={labelTheme}
        menuProps={menuProps}
      />
    </Card>
  );
}

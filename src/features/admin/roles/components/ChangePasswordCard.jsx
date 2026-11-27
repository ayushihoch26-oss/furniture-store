import { Box, Button, Typography } from "@mui/material";
import HelpOutlinedIcon from "@mui/icons-material/HelpOutlined";
import { BROWN, BROWN_DARK } from "../constants/roles.constants";
import Card from "./Card";
import FieldLabel from "./FieldLabel";
import PasswordField from "./PasswordField";

export default function ChangePasswordCard({
  passwordChange,
  theme,
  labelTheme,
  darkMode,
}) {
  const { passwords, passwordErrors, showError, updatePassword, savePassword } =
    passwordChange;

  // Props shared by the three password boxes
  const fieldProps = (field) => ({
    placeholder: "Enter password",
    value: passwords[field],
    onChange: (e) => updatePassword(field, e.target.value),
    error: showError(field),
    helperText: showError(field) ? passwordErrors[field] : "",
    theme,
  });

  return (
    <Card theme={theme} darkMode={darkMode}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography sx={{ fontSize: 18, fontWeight: 700 }}>
          Change Password
        </Typography>

        <Button
          size="small"
          endIcon={<HelpOutlinedIcon sx={{ fontSize: 16 }} />}
          sx={{
            color: BROWN,
            textTransform: "none",
            textDecoration: "underline",
          }}
        >
          Need help
        </Button>
      </Box>

      <Box sx={{ display: "grid", gap: 2 }}>
        <Box>
          <FieldLabel theme={labelTheme}>Current Password</FieldLabel>
          <PasswordField {...fieldProps("current")} />
          <Button
            size="small"
            sx={{
              mt: 0.5,
              px: 0,
              color: BROWN,
              textTransform: "none",
              fontSize: 12,
            }}
          >
            Forgot Current Password? Click here
          </Button>
        </Box>

        <Box>
          <FieldLabel theme={labelTheme}>New Password</FieldLabel>
          <PasswordField {...fieldProps("next")} />
        </Box>

        <Box>
          <FieldLabel theme={labelTheme}>Re-enter Password</FieldLabel>
          <PasswordField {...fieldProps("repeat")} />
        </Box>

        <Button
          fullWidth
          variant="contained"
          disableElevation
          onClick={savePassword}
          sx={{
            height: 44,
            mt: 1,
            bgcolor: BROWN,
            textTransform: "none",
            fontWeight: 600,
            "&:hover": { bgcolor: BROWN_DARK },
          }}
        >
          Save Change
        </Button>
      </Box>
    </Card>
  );
}

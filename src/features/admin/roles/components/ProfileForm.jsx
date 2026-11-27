import { Box, MenuItem, TextField } from "@mui/material";
import {
  BIO_LIMIT,
  CARDS,
  COUNTRY_CODES,
  MESSAGES,
} from "../constants/roles.constants";
import { getInputSx } from "../utils/roles.theme";
import { isValidEmail } from "../utils/roles.utils";
import FieldLabel from "./FieldLabel";
import PasswordField from "./PasswordField";

export default function ProfileForm({
  draft,
  editing,
  onChange,
  theme,
  labelTheme,
  menuProps,
}) {
  const inputSx = getInputSx(theme);
  const emailInvalid = !isValidEmail(draft.email);

  return (
    <Box
      sx={{
        display: "grid",
        gap: 2.5,
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, minmax(0, 1fr))",
        },
      }}
    >
      <Box>
        <FieldLabel theme={theme}>First Name</FieldLabel>
        <TextField
          fullWidth
          size="small"
          value={draft.firstName}
          disabled={!editing}
          error={editing && !draft.firstName.trim()}
          onChange={(e) => onChange("firstName", e.target.value)}
          sx={inputSx}
        />
      </Box>

      <Box>
        <FieldLabel theme={theme}>Last Name</FieldLabel>
        <TextField
          fullWidth
          size="small"
          value={draft.lastName}
          disabled={!editing}
          error={editing && !draft.lastName.trim()}
          onChange={(e) => onChange("lastName", e.target.value)}
          sx={inputSx}
        />
      </Box>

      <Box>
        <FieldLabel theme={theme}>Password</FieldLabel>
        <PasswordField
          value={draft.password}
          disabled
          onChange={() => {}}
          theme={theme}
        />
      </Box>

      <Box>
        <FieldLabel theme={theme}>Phone Number</FieldLabel>
        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            select
            size="small"
            value={draft.countryCode}
            disabled={!editing}
            onChange={(e) => onChange("countryCode", e.target.value)}
            slotProps={{ select: { MenuProps: menuProps } }}
            sx={{ ...inputSx, width: 96, flexShrink: 0 }}
          >
            {COUNTRY_CODES.map((code) => (
              <MenuItem key={code} value={code}>
                {code}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            size="small"
            value={draft.phone}
            disabled={!editing}
            onChange={(e) => onChange("phone", e.target.value)}
            sx={inputSx}
          />
        </Box>
      </Box>

      <Box>
        <FieldLabel theme={labelTheme}>E-mail</FieldLabel>
        <TextField
          fullWidth
          size="small"
          type="email"
          value={draft.email}
          disabled={!editing}
          error={editing && emailInvalid}
          helperText={editing && emailInvalid ? MESSAGES.invalidEmail : ""}
          onChange={(e) => onChange("email", e.target.value)}
          sx={inputSx}
        />
      </Box>

      <Box>
        <FieldLabel theme={labelTheme}>Date of Birth</FieldLabel>
        <TextField
          fullWidth
          size="small"
          type="date"
          value={draft.birthDate}
          disabled={!editing}
          onChange={(e) => onChange("birthDate", e.target.value)}
          sx={inputSx}
        />
      </Box>

      <Box sx={{ gridColumn: { sm: "1 / -1" } }}>
        <FieldLabel theme={labelTheme}>Location</FieldLabel>
        <TextField
          fullWidth
          size="small"
          value={draft.location}
          disabled={!editing}
          onChange={(e) => onChange("location", e.target.value)}
          sx={inputSx}
        />
      </Box>

      <Box sx={{ gridColumn: { sm: "1 / -1" } }}>
        <FieldLabel theme={labelTheme}>Credit Card</FieldLabel>
        <TextField
          select
          fullWidth
          size="small"
          value={draft.card}
          disabled={!editing}
          onChange={(e) => onChange("card", e.target.value)}
          slotProps={{ select: { MenuProps: menuProps } }}
          sx={inputSx}
        >
          {CARDS.map((number) => (
            <MenuItem key={number} value={number}>
              {number}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <Box sx={{ gridColumn: { sm: "1 / -1" } }}>
        <FieldLabel theme={labelTheme}>Biography</FieldLabel>
        <TextField
          fullWidth
          multiline
          minRows={4}
          placeholder="Enter a biography about you"
          value={draft.bio}
          disabled={!editing}
          inputProps={{ maxLength: BIO_LIMIT }}
          helperText={editing ? `${draft.bio.length}/${BIO_LIMIT}` : ""}
          onChange={(e) => onChange("bio", e.target.value)}
          sx={inputSx}
        />
      </Box>
    </Box>
  );
}

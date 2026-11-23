import { useContext } from "react";
import { LineChart } from "@mui/x-charts/LineChart";
import { Box, Button, Typography } from "@mui/material";
import { BROWN, GREEN, compact } from "../features/dashboardHelpers";
import {
  Card,
  CardHeader,
  MenuButton,
  SectionState,
} from "./DashboardPrimitives";
import DashboardThemeContext from "./DashboardThemeContext";

export default function DashboardSalesSection({
  report,
  week,
  setWeek,
  chartDays,
  darkMode,
  loading,
  errors,
  customerTotal,
  customerNew,
  overviewBars,
  overviewMax,
  statusRows,
  statusMax,
}) {
  const theme = useContext(DashboardThemeContext);

  return (
    <Box
      sx={{
        display: "grid",
        gap: 2.5,
        gridTemplateColumns: {
          xs: "1fr",
          lg: "minmax(0, 2fr) minmax(0, 1fr)",
        },
      }}
    >
      <Card>
        <CardHeader
          title={`Report for ${week === "this" ? "this" : "last"} week`}
          subtitle="Daily revenue (cancelled orders excluded)"
          mb={3}
          action={
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  bgcolor: theme.soft,
                  p: 0.5,
                  borderRadius: 2,
                }}
              >
                {[
                  ["this", "This week"],
                  ["last", "Last week"],
                ].map(([key, label]) => (
                  <Button
                    key={key}
                    onClick={() => setWeek(key)}
                    disableElevation
                    sx={{
                      minWidth: 0,
                      height: 28,
                      px: 1.5,
                      lineHeight: 1,
                      fontSize: 12,
                      textTransform: "none",
                      borderRadius: 1.5,
                      bgcolor: week === key ? BROWN : "transparent",
                      color: week === key ? "#fff" : theme.muted,
                      "&:hover": {
                        bgcolor: week === key ? BROWN : theme.tabHover,
                      },
                    }}
                  >
                    {label}
                  </Button>
                ))}
              </Box>
              <MenuButton />
            </Box>
          }
        />
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, 1fr)",
              sm: "repeat(5, 1fr)",
            },
            gap: 1,
          }}
        >
          {report.map(([value, label]) => (
            <Box key={label} sx={{ borderBottom: `2px solid ${BROWN}`, p: 1 }}>
              <Typography sx={{ fontSize: 23, fontWeight: 700 }}>
                {loading ? "…" : value}
              </Typography>
              <Typography sx={{ fontSize: 12, color: theme.muted }}>
                {label}
              </Typography>
            </Box>
          ))}
        </Box>
        <Box sx={{ mt: 3, width: "100%" }}>
          <LineChart
            height={260}
            xAxis={[
              {
                scaleType: "point",
                data: chartDays.map((day) => day.label),
              },
            ]}
            series={[
              {
                data: chartDays.map(
                  (day) => Math.round(day.revenue * 100) / 100,
                ),
                color: BROWN,
                showMark: true,
                label: "Revenue",
              },
            ]}
            grid={{ horizontal: true }}
            sx={{
              "& .MuiChartsAxis-tickLabel": {
                fill: darkMode ? "#B8AAA0" : "#777777",
              },
              "& .MuiChartsAxis-line": {
                stroke: darkMode ? "#554940" : "#DDDDDD",
              },
              "& .MuiChartsAxis-tick": {
                stroke: darkMode ? "#554940" : "#DDDDDD",
              },
              "& .MuiChartsGrid-line": {
                stroke: darkMode ? "#403832" : "#EEEEEE",
              },
              "& .MuiLineElement-root": { strokeWidth: 2 },
              "& .MuiMarkElement-root": {
                stroke: BROWN,
                fill: darkMode ? "#292421" : "#FFFFFF",
                strokeWidth: 2,
              },
              "& .MuiChartsLegend-root": { display: "none" },
            }}
          />
        </Box>
      </Card>

      <Card>
        <CardHeader title="Customers" action={<MenuButton />} />
        <SectionState loading={loading} error={errors.customers} />
        {!loading && !errors.customers && (
          <Box
            sx={{
              display: "flex",
              alignItems: "baseline",
              gap: 1.5,
              mt: -1,
            }}
          >
            <Typography sx={{ fontSize: 32, fontWeight: 700 }}>
              {compact(customerTotal)}
            </Typography>
            <Typography sx={{ fontSize: 12, color: GREEN }}>
              +{customerNew} this month
            </Typography>
          </Box>
        )}

        <Typography sx={{ fontSize: 13, mt: 2 }}>
          New customers per day ({week === "this" ? "this" : "last"} week)
        </Typography>
        {errors.overview ? (
          <Typography sx={{ fontSize: 12, color: "#E5484D", mt: 1 }}>
            {errors.overview}
          </Typography>
        ) : (
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-end",
              gap: "6px",
              height: 56,
              mt: 1,
            }}
          >
            {overviewBars.map((value, index) => (
              <Box
                key={index}
                title={String(value)}
                sx={{
                  flex: 1,
                  height: `${Math.max(6, (value / overviewMax) * 100)}%`,
                  bgcolor: BROWN,
                  borderRadius: "2px",
                }}
              />
            ))}
          </Box>
        )}

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mt: 3,
            mb: 2,
          }}
        >
          <Typography sx={{ fontSize: 15, fontWeight: 600 }}>
            Orders by status
          </Typography>
          <Typography sx={{ fontSize: 15, fontWeight: 600 }}>Count</Typography>
        </Box>
        {statusRows.map(([name, value, color]) => (
          <Box
            key={name}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              mb: 2,
            }}
          >
            <Typography sx={{ fontSize: 12, width: 86 }}>{name}</Typography>
            <Box
              sx={{
                flex: 1,
                height: 5,
                bgcolor: theme.soft,
                borderRadius: 2,
              }}
            >
              <Box
                sx={{
                  width: `${(value / statusMax) * 100}%`,
                  height: "100%",
                  bgcolor: color,
                  borderRadius: 2,
                }}
              />
            </Box>
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 600,
                width: 40,
                textAlign: "right",
              }}
            >
              {loading ? "…" : compact(value)}
            </Typography>
          </Box>
        ))}
      </Card>
    </Box>
  );
}

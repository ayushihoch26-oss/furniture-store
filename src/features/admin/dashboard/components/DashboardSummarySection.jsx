import { useContext } from "react";
import {
  CategoryOutlined,
  Inventory2Outlined,
  MailOutlined as MailOutlinedIcon,
} from "@mui/icons-material";
import { Box, Typography } from "@mui/material";
import { BROWN, money, num } from "../features/dashboardHelpers";
import {
  Card,
  CardHeader,
  IconBox,
  SectionState,
} from "./DashboardPrimitives";
import DashboardThemeContext from "./DashboardThemeContext";

export default function DashboardSummarySection({
  data,
  loading,
  errors,
  derived,
  catTotal,
  msgTotal,
  msgNew,
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
          title="Best selling product"
          subtitle="Based on orders from the last 14 days"
        />
        <SectionState
          loading={loading}
          error={errors.rangeOrders}
          empty={derived.bestSelling.length === 0}
          emptyText="No sales in the last 14 days"
        />
        {!loading && derived.bestSelling.length > 0 && (
          <Box sx={{ overflowX: "auto" }}>
            <Box sx={{ minWidth: 420 }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr",
                  gap: 1,
                  p: 1.5,
                  bgcolor: theme.soft,
                  borderRadius: 2,
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                <span>PRODUCT</span>
                <span>UNITS SOLD</span>
                <span>UNIT PRICE</span>
              </Box>
              {derived.bestSelling.map((item) => (
                <Box
                  key={item.name}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 1fr",
                    gap: 1,
                    px: 1.5,
                    py: 1.75,
                    alignItems: "center",
                    fontSize: 12,
                  }}
                >
                  <Box
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <Inventory2Outlined sx={{ color: BROWN }} />
                    <Typography sx={{ fontSize: 12 }}>{item.name}</Typography>
                  </Box>
                  <span>{item.qty}</span>
                  <span>{money(item.price)}</span>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Card>

      <Box sx={{ display: "grid", gap: 2.5, alignContent: "start" }}>
        <Card>
          <CardHeader
            title="Categories"
            subtitle={catTotal ? `${catTotal} total` : undefined}
          />
          <SectionState
            loading={loading}
            error={errors.categories}
            empty={data.categories.length === 0}
            emptyText="No categories yet"
          />
          {!loading &&
            data.categories.map((category, index) => (
              <Box
                key={category.id ?? index}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  py: 1,
                  borderBottom: `1px solid ${theme.divider}`,
                }}
              >
                <IconBox size={32}>
                  <CategoryOutlined sx={{ fontSize: 18 }} />
                </IconBox>
                <Typography sx={{ flex: 1, fontSize: 14 }}>
                  {category.name || category.title}
                </Typography>
                {(category.productCount ??
                  category.products ??
                  category.count) != null && (
                  <Typography sx={{ fontSize: 12, color: theme.muted }}>
                    {num(
                      category.productCount ??
                        category.products ??
                        category.count,
                    )}{" "}
                    items
                  </Typography>
                )}
              </Box>
            ))}
        </Card>

        <Card>
          <CardHeader title="Contact messages" />
          {errors.contactStats ? (
            <Typography sx={{ fontSize: 12, color: "#E5484D" }}>
              {errors.contactStats}
            </Typography>
          ) : (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <IconBox>
                <MailOutlinedIcon />
              </IconBox>
              <Box>
                <Typography
                  sx={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: theme.strong,
                  }}
                >
                  {loading ? "…" : msgTotal}
                </Typography>
                <Typography sx={{ fontSize: 12, color: theme.muted }}>
                  {loading ? "" : `${msgNew} new`}
                </Typography>
              </Box>
            </Box>
          )}
        </Card>
      </Box>
    </Box>
  );
}

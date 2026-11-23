import { useContext } from "react";
import { Inventory2Outlined, Search } from "@mui/icons-material";
import { Box, InputBase, Typography } from "@mui/material";
import {
  GREEN,
  YELLOW,
  formatDateTime,
  isPaid,
  money,
  orderNumber,
} from "../features/dashboardHelpers";
import {
  Card,
  CardHeader,
  IconBox,
  SectionState,
} from "./DashboardPrimitives";
import DashboardThemeContext from "./DashboardThemeContext";

export default function DashboardOrdersProductsSection({
  data,
  loading,
  errors,
  search,
  setSearch,
  visibleProducts,
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
        <CardHeader title="Recent transactions" subtitle="Latest 5 orders" />
        <SectionState
          loading={loading}
          error={errors.recentOrders}
          empty={data.recentOrders.length === 0}
          emptyText="No orders yet"
        />
        {!loading && data.recentOrders.length > 0 && (
          <Box sx={{ overflowX: "auto" }}>
            <Box sx={{ minWidth: 520 }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "40px 1fr 1.5fr 1fr 80px",
                  gap: 1,
                  pb: 1.5,
                  borderBottom: `1px solid ${theme.divider}`,
                  fontSize: 12,
                  color: theme.muted,
                }}
              >
                <span>No</span>
                <span>Order Id</span>
                <span>Order Date</span>
                <span>Payment</span>
                <span>Amount</span>
              </Box>
              {data.recentOrders.map((order, index) => {
                const paid = isPaid(order);
                return (
                  <Box
                    key={order.id ?? index}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "40px 1fr 1.5fr 1fr 80px",
                      gap: 1,
                      py: 1.75,
                      fontSize: 12,
                      alignItems: "center",
                    }}
                  >
                    <span>{index + 1}.</span>
                    <span>{orderNumber(order)}</span>
                    <span>
                      {formatDateTime(order.createdAt || order.date)}
                    </span>
                    <span style={{ color: paid ? GREEN : YELLOW }}>
                      ● {paid ? "Paid" : "Pending"}
                    </span>
                    <span>{money(order.total ?? order.price)}</span>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}
      </Card>

      <Card>
        <CardHeader title="Top Products" subtitle="Newest in catalog" />
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            bgcolor: theme.soft,
            borderRadius: 2,
            px: 1.5,
            height: 38,
          }}
        >
          <Search sx={{ fontSize: 20, color: theme.muted }} />
          <InputBase
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search"
            sx={{
              flex: 1,
              fontSize: 13,
              color: theme.text,
              "& input::placeholder": {
                color: theme.muted,
                opacity: 1,
              },
            }}
          />
        </Box>
        <SectionState
          loading={loading}
          error={errors.products}
          empty={visibleProducts.length === 0}
          emptyText="No products found"
        />
        {!loading &&
          visibleProducts.map((product, index) => {
            const name = product.name || product.title || "Product";
            const image = product.image || product.images?.[0];
            return (
              <Box
                key={product.id ?? index}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  py: 1.5,
                  borderBottom: `1px solid ${theme.divider}`,
                }}
              >
                <IconBox>
                  {typeof image === "string" && image ? (
                    <img
                      src={image}
                      alt={name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <Inventory2Outlined />
                  )}
                </IconBox>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontSize: 13,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {name}
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: theme.muted }}>
                    Item: {product.sku || product.code || `#${product.id ?? "-"}`}
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
                  {money(product.price)}
                </Typography>
              </Box>
            );
          })}
      </Card>
    </Box>
  );
}

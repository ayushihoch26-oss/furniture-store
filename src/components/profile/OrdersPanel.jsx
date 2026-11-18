import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Collapse,
  Alert,
} from "@mui/material";
import {
  ShoppingBagOutlined,
  KeyboardArrowDown,
} from "@mui/icons-material";

import orderService from "../../service/order.service";
import { onImgError } from "../../assets/furnitureImages";
import { money, formatDate } from "../../utils/profileUtils";
import {
  BROWN,
  GRAY_BG,
  LIGHT_BG,
  STATUS_STYLE,
} from "../../styles/profileStyles";
import { EmptyState, PanelTitle } from "./ProfileShared";

function mapOrder(order) {
  const items = (order.items || []).map((item) => ({
    name: item.name,
    price: Number(item.price) || 0,
    qty: Number(item.quantity) || 1,
    color: item.color || "",
    img: item.image,
  }));

  return {
    id: order.orderId || `#ORD${String(order.id).padStart(4, "0")}`,
    date: order.createdAt,
    status: order.status || "Pending",
    total: Number(order.total) || 0,
    items,
  };
}

function OrderCard({ order }) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  const statusStyle =
    STATUS_STYLE[order.status] || STATUS_STYLE.Processing;

  const itemCount = order.items.reduce((total, item) => {
    return total + item.qty;
  }, 0);

  function toggleDetails() {
    setDetailsOpen(!detailsOpen);
  }

  return (
    <Box
      sx={{
        border: "1px solid var(--c-e5e0db)",
        bgcolor: "var(--c-ffffff)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 1.5,
          px: { xs: 2, lg: 3 },
          py: 2,
          bgcolor: LIGHT_BG,
        }}
      >
        <Box>
          <Typography sx={{ fontSize: { xs: 14, lg: 16 }, fontWeight: 600 }}>
            Order {order.id}
          </Typography>
          <Typography sx={{ fontSize: 13, color: "var(--c-777777)" }}>
            Placed on {formatDate(order.date)}
          </Typography>
        </Box>

        <Box
          sx={{
            px: "12px",
            py: "4px",
            fontSize: 12.5,
            fontWeight: 600,
            bgcolor: statusStyle.bg,
            color: statusStyle.color,
          }}
        >
          {order.status}
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          gap: 2,
          px: { xs: 2, lg: 3 },
          py: 2.5,
        }}
      >
        <Box sx={{ display: "flex", gap: 1 }}>
          {order.items.slice(0, 4).map((item, index) => (
            <Box
              key={index}
              sx={{
                width: { xs: 52, lg: 64 },
                height: { xs: 52, lg: 64 },
                bgcolor: GRAY_BG,
              }}
            >
              <Box
                component="img"
                src={item.img}
                alt={item.name}
                onError={onImgError}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  p: "4px",
                  display: "block",
                }}
              />
            </Box>
          ))}
        </Box>

        <Box sx={{ textAlign: { xs: "left", sm: "right" } }}>
          <Typography sx={{ fontSize: 13, color: "var(--c-777777)" }}>
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </Typography>
          <Typography sx={{ fontSize: { xs: 17, lg: 20 }, fontWeight: 700 }}>
            {money(order.total)}
          </Typography>
        </Box>
      </Box>

      <Collapse in={detailsOpen}>
        <Box
          sx={{
            px: { xs: 2, lg: 3 },
            pb: 2,
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
          }}
        >
          {order.items.map((item, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                gap: 2,
                fontSize: 14,
              }}
            >
              <Box>
                <Typography sx={{ fontSize: 14 }}>
                  {item.name}{" "}
                  <Box component="span" sx={{ color: "var(--c-777777)" }}>
                    × {item.qty}
                  </Box>
                </Typography>
                <Typography sx={{ fontSize: 12.5, color: "var(--c-777777)" }}>
                  {item.color}
                </Typography>
              </Box>

              <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                {money(item.price * item.qty)}
              </Typography>
            </Box>
          ))}
        </Box>
      </Collapse>

      <Box
        sx={{
          borderTop: "1px solid var(--c-eeeeee)",
          px: { xs: 2, lg: 3 },
          py: 1,
        }}
      >
        <Button
          onClick={toggleDetails}
          endIcon={
            <KeyboardArrowDown
              sx={{
                transform: detailsOpen ? "rotate(180deg)" : "none",
                transition: "transform .2s",
              }}
            />
          }
          sx={{
            color: BROWN,
            textTransform: "none",
            fontSize: 14,
            "&:hover": { bgcolor: "transparent" },
          }}
        >
          {detailsOpen ? "Hide details" : "View details"}
        </Button>
      </Box>
    </Box>
  );
}

export default function OrdersPanel() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isComponentActive = true;

    async function loadOrders() {
      try {
        const orderData = await orderService.getMyOrders();

        if (isComponentActive) {
          if (Array.isArray(orderData)) {
            setOrders(orderData.map(mapOrder));
          } else {
            setOrders([]);
          }
        }
      } catch (loadError) {
        if (isComponentActive) {
          setError(loadError.message || "Failed to load orders");
        }
      } finally {
        if (isComponentActive) {
          setLoading(false);
        }
      }
    }

    loadOrders();

    return () => {
      isComponentActive = false;
    };
  }, []);

  return (
    <Box>
      <PanelTitle
        title="My orders"
        subtitle="Track and review your recent purchases."
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 0 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Typography>Loading orders...</Typography>
      ) : orders.length === 0 ? (
        <EmptyState
          Icon={ShoppingBagOutlined}
          title="No orders yet"
          text="When you place an order it will show up here."
          to="/Shop"
          button="Start shopping"
        />
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2.5,
          }}
        >
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </Box>
      )}
    </Box>
  );
}

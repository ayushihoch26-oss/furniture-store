// hooks/useOrderActions.js
// Handles things the admin DOES: select rows, view/edit/delete, bulk delete.
import { useState } from "react";
import { updateOrder, deleteOrder } from "../services/orderService";

// onChanged = function to run after a change (refresh list + stats)
export default function useOrderActions(onChanged) {
  const [selected, setSelected] = useState([]); // checked row ids
  const [selectedOrder, setSelectedOrder] = useState(null); // order in dialog
  const [action, setAction] = useState(""); // "view" | "edit" | "delete" | ""
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isSelected = (id) => selected.some((x) => String(x) === String(id));

  const toggleSelected = (id) =>
    setSelected((prev) =>
      prev.some((x) => String(x) === String(id))
        ? prev.filter((x) => String(x) !== String(id))
        : [...prev, id],
    );

  const openAction = (order, type) => {
    setSelectedOrder({ ...order });
    setAction(type);
    setError("");
    setSuccess("");
  };

  const closeAction = () => {
    setSelectedOrder(null);
    setAction("");
  };

  const changeField = (field, value) =>
    setSelectedOrder((prev) => (prev ? { ...prev, [field]: value } : prev));

  const saveOrder = async () => {
    setSaving(true);
    setError("");
    try {
      await updateOrder(selectedOrder.id, selectedOrder);
      closeAction();
      setSuccess("Order updated successfully.");
      await onChanged();
    } catch (err) {
      setError(err.message || "Could not update the order.");
    } finally {
      setSaving(false);
    }
  };

  const removeOrder = async () => {
    setSaving(true);
    setError("");
    try {
      await deleteOrder(selectedOrder.id);
      setSelected((prev) => prev.filter((x) => String(x) !== String(selectedOrder.id)));
      closeAction();
      setSuccess("Order deleted successfully.");
      await onChanged();
    } catch (err) {
      setError(err.message || "Could not delete the order.");
    } finally {
      setSaving(false);
    }
  };

  // Delete every checked order
  const removeSelected = async () => {
    if (selected.length === 0) return window.alert("Please select at least one order.");
    if (!window.confirm(`Delete ${selected.length} selected order(s)? This cannot be undone.`)) return;

    setError("");
    const results = await Promise.allSettled(selected.map((id) => deleteOrder(id).then(() => id)));
    const failed = results.filter((r) => r.status === "rejected");
    const doneIds = results.filter((r) => r.status === "fulfilled").map((r) => String(r.value));

    if (failed.length > 0) {
      setError(`${doneIds.length} order(s) deleted; ${failed.length} failed. ${failed[0].reason?.message || ""}`);
    }
    setSelected((prev) => prev.filter((id) => !doneIds.includes(String(id))));
    await onChanged();
  };

  return {
    selected, isSelected, toggleSelected,
    selectedOrder, action, saving, error, success,
    setError, setSuccess,
    openAction, closeAction, changeField,
    saveOrder, removeOrder, removeSelected,
  };
}

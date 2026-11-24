import { useEffect, useRef, useState } from "react";

import {
  getContactMessages,
  getContactStats,
  getContactById,
  updateStatus,
  deleteContactMessage,
} from "../services/contact.service";

function getResponseData(response) {
  return response?.data?.data ?? response?.data ?? response;
}

function getMessageId(message) {
  return message.dbId ?? message.id;
}

function getErrorMessage(error) {
  return error.response?.data?.message || error.message;
}

function createRequest(query) {
  return {
    page: Math.max(1, Number(query.page) || 1),
    limit: Math.min(100, Math.max(1, Number(query.limit) || 10)),
    search: String(query.search || "").trim(),
    status: query.status || "",
    subject: query.subject || "",
    fromDate: query.fromDate || "",
    toDate: query.toDate || "",
    sortOrder: query.sortOrder === "asc" ? "asc" : "desc",
  };
}

function formatMessages(response, limit) {
  const data = getResponseData(response);
  const rows = Array.isArray(data)
    ? data
    : data?.rows || data?.messages || data?.contacts || data?.items || [];

  const total = Number(data?.total ?? data?.totalItems ?? data?.count ?? rows.length);
  const totalItems = Number.isFinite(total) ? total : rows.length;
  const totalPages = Math.max(
    1,
    Number(data?.totalPages) || Math.ceil(totalItems / limit) || 1,
  );

  const messages = rows.map((item) => ({
    ...item,
    dbId: item.dbId ?? item.id,
    id: item.messageId || item.id,
    date:
      item.date ||
      (item.createdAt
        ? new Date(item.createdAt).toLocaleDateString("en-GB")
        : ""),
    name: item.name || "",
    email: item.email || "",
    phone: item.phone || "",
    subject: item.subject || "General Question",
    status: item.status || "New",
    message: item.message || "",
  }));

  return { messages, totalItems, totalPages };
}

function createStats(counts) {
  return [
    {
      title: "Total Messages",
      value: counts.total,
      change: "14.4%",
      up: true,
    },
    {
      title: "New Messages",
      value: counts.new,
      change: "20%",
      up: true,
    },
    {
      title: "Read Messages",
      value: counts.read,
      change: "5%",
      up: false,
    },
    {
      title: "Replied Messages",
      value: counts.replied,
      change: "85%",
      up: true,
    },
  ];
}

export default function useContactMessages({ query, setPage }) {
  const [messages, setMessages] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [counts, setCounts] = useState({
    total: 0,
    new: 0,
    read: 0,
    replied: 0,
  });

  const [selected, setSelected] = useState([]);
  const [viewed, setViewed] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({ ids: [], name: "" });

  const [refreshNumber, setRefreshNumber] = useState(0);
  const latestRequest = useRef(0);

  useEffect(() => {
    let ignoreResponse = false;
    const requestId = latestRequest.current + 1;
    latestRequest.current = requestId;

    async function loadMessages() {
      setLoading(true);

      const request = createRequest(query);

      try {
        const response = await getContactMessages(request);

        if (ignoreResponse || requestId !== latestRequest.current) {
          return;
        }

        const result = formatMessages(response, request.limit);

        setMessages(result.messages);
        setTotalItems(result.totalItems);
        setTotalPages(result.totalPages);

        if (request.page > result.totalPages) {
          setPage(result.totalPages);
        }
      } catch (error) {
        if (ignoreResponse || requestId !== latestRequest.current) {
          return;
        }

        console.error(
          "Contact messages fetch failed:",
          error.response?.data || error.message,
        );
        setMessages([]);
        setTotalItems(0);
        setTotalPages(1);
      } finally {
        if (!ignoreResponse && requestId === latestRequest.current) {
          setLoading(false);
        }
      }
    }

    loadMessages();

    return function stopOldRequest() {
      ignoreResponse = true;
    };
  }, [query, setPage, refreshNumber]);

  useEffect(() => {
    let ignoreResponse = false;

    async function loadStats() {
      try {
        const data = getResponseData(await getContactStats());

        if (ignoreResponse) {
          return;
        }

        setCounts({
          total: Number(data?.total ?? 0),
          new: Number(data?.new ?? 0),
          read: Number(data?.read ?? 0),
          replied: Number(data?.replied ?? 0),
        });
      } catch (error) {
        if (!ignoreResponse) {
          console.error("Statistics error:", error.message);
        }
      }
    }

    loadStats();

    return function stopOldStatsRequest() {
      ignoreResponse = true;
    };
  }, [refreshNumber]);

  function refreshData() {
    setRefreshNumber((previousNumber) => previousNumber + 1);
  }

  async function handleView(item) {
    try {
      const response = await getContactById(getMessageId(item));
      const data = getResponseData(response);
      const message = data?.data ?? data?.message ?? data;

      setViewed(message);

      if (message.status === "New") {
        await updateStatus(message.id ?? item.dbId, "Read");
        setViewed((previousMessage) =>
          previousMessage
            ? { ...previousMessage, status: "Read" }
            : null,
        );
        refreshData();
      }
    } catch (error) {
      console.error("View message error:", error.message);
      setViewed(item);
    }
  }

  function closeView() {
    setViewed(null);
  }

  async function markReplied() {
    if (!viewed?.id && !viewed?.dbId) {
      return;
    }

    try {
      await updateStatus(viewed.dbId ?? viewed.id, "Replied");
      setViewed((previousMessage) =>
        previousMessage
          ? { ...previousMessage, status: "Replied" }
          : null,
      );
      refreshData();
    } catch (error) {
      alert(getErrorMessage(error));
    }
  }

  async function markSelectedRead() {
    if (selected.length === 0) {
      return;
    }

    try {
      await Promise.all(
        selected.map((id) => updateStatus(id, "Read")),
      );
      setSelected([]);
      refreshData();
    } catch (error) {
      alert(getErrorMessage(error));
    }
  }

  function openDelete(ids, name = "") {
    const idsToDelete = Array.isArray(ids) ? ids : [ids];
    setDeleteTarget({ ids: idsToDelete, name });
    setDeleteOpen(true);
  }

  function closeDelete() {
    setDeleteOpen(false);
  }

  async function confirmDelete() {
    const ids = deleteTarget.ids;

    if (ids.length === 0) {
      return;
    }

    try {
      await Promise.all(ids.map((id) => deleteContactMessage(id)));

      setSelected((previousSelection) =>
        previousSelection.filter(
          (selectedId) =>
            !ids.some(
              (deletedId) => String(deletedId) === String(selectedId),
            ),
        ),
      );
      setDeleteOpen(false);

      const remainingMessages = Math.max(0, totalItems - ids.length);
      const lastPage = Math.max(
        1,
        Math.ceil(remainingMessages / query.limit),
      );
      const nextPage = Math.min(query.page, lastPage);

      if (nextPage !== query.page) {
        setPage(nextPage);
      }

      refreshData();
    } catch (error) {
      alert(getErrorMessage(error));
    }
  }

  function exportMessages() {
    let messagesToExport = messages;

    if (selected.length > 0) {
      messagesToExport = messages.filter((item) =>
        selected.some(
          (id) => String(id) === String(getMessageId(item)),
        ),
      );
    }

    if (messagesToExport.length === 0) {
      alert("No messages to export");
      return;
    }

    const headers = [
      "Message ID",
      "Name",
      "Email",
      "Phone",
      "Subject",
      "Date",
      "Status",
      "Message",
    ];

    const rows = messagesToExport.map((item) => [
      item.messageId ?? item.id,
      item.name,
      item.email,
      item.phone,
      item.subject,
      item.date,
      item.status,
      item.message,
    ]);

    const csvRows = [headers, ...rows].map((row) =>
      row
        .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
        .join(","),
    );
    const csv = csvRows.join("\n");
    const file = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const fileUrl = URL.createObjectURL(file);
    const downloadLink = document.createElement("a");

    downloadLink.href = fileUrl;
    downloadLink.download =
      selected.length > 0 ? "selected-messages.csv" : "all-messages.csv";

    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
    URL.revokeObjectURL(fileUrl);
  }

  return {
    messages,
    stats: createStats(counts),
    counts,
    loading,
    totalItems,
    totalPages,
    selected,
    setSelected,
    viewed,
    handleView,
    closeView,
    markReplied,
    markSelectedRead,
    exportMessages,
    deleteOpen,
    deleteTarget,
    openDelete,
    closeDelete,
    confirmDelete,
  };
}

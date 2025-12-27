import { defineStore } from "pinia";

const API_BASE = process.env.VUE_APP_API_BASE || "http://localhost:3000";

export const useUIStore = defineStore("ui", {
  state: () => ({
    darkMode:
      localStorage.getItem("darkMode") === "true" ||
      (!localStorage.getItem("darkMode") &&
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches),
    menuLeftOpen: false,
    menuRightOpen: false,
    notifications: [],
    user: {
      id: "jan.kowalski",
      name: "Jan Kowalski",
      role: "Administrator",
    },
  }),
  actions: {
    toggleDark() {
      this.darkMode = !this.darkMode;
      localStorage.setItem("darkMode", this.darkMode);
    },
    setDark(value) {
      this.darkMode = !!value;
      localStorage.setItem("darkMode", this.darkMode);
    },
    toggleLeft() {
      this.menuLeftOpen = !this.menuLeftOpen;
      if (this.menuLeftOpen) this.menuRightOpen = false;
    },
    toggleRight() {
      this.menuRightOpen = !this.menuRightOpen;
      if (this.menuRightOpen) this.menuLeftOpen = false;
    },
    async fetchNotifications(userId = null, unreadOnly = false) {
      try {
        const url = new URL(`${API_BASE}/api/notifications`);
        if (userId) url.searchParams.set("userId", userId);
        if (unreadOnly) url.searchParams.set("unreadOnly", "true");
        const res = await fetch(url.toString(), {
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
        const data = await res.json();
        this.notifications = data;
      } catch (err) {
        console.error("fetchNotifications error", err);
      }
    },
    async addNotification(notification) {
      try {
        const res = await fetch(`${API_BASE}/api/notifications`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(notification),
        });
        if (!res.ok) throw new Error("Failed to add notification");
        const data = await res.json();
        this.notifications.unshift(data);
        return data;
      } catch (err) {
        console.error("addNotification error", err);
        throw err;
      }
    },
    async markRead(id) {
      try {
        const res = await fetch(`${API_BASE}/api/notifications/${id}/read`, {
          method: "PUT",
        });
        if (!res.ok) throw new Error("Failed to mark read");
        const updated = await res.json();
        const idx = this.notifications.findIndex((n) => n.id === updated.id);
        if (idx !== -1) this.notifications.splice(idx, 1, updated);
        return updated;
      } catch (err) {
        console.error("markRead error", err);
      }
    },
    async markAllRead(userId = null) {
      try {
        const url = new URL(`${API_BASE}/api/notifications/mark-all-read`);
        if (userId) url.searchParams.set("userId", userId);
        const res = await fetch(url.toString(), { method: "PUT" });
        if (!res.ok) throw new Error("Failed to mark all read");
        // update local state
        this.notifications = this.notifications.map((n) => ({
          ...n,
          read: true,
        }));
        const data = await res.json();
        return data;
      } catch (err) {
        console.error("markAllRead error", err);
      }
    },
    async removeNotification(id) {
      try {
        const res = await fetch(`${API_BASE}/api/notifications/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to delete");
        this.notifications = this.notifications.filter((n) => n.id !== id);
      } catch (err) {
        console.error("removeNotification error", err);
      }
    },
  },
  getters: {
    notificationsCount: (state) => state.notifications.length,
    unreadCount: (state) => state.notifications.filter((n) => !n.read).length,
  },
});

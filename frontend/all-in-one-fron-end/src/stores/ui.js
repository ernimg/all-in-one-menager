import { defineStore } from "pinia";

export const useUIStore = defineStore("ui", {
  state: () => ({
    darkMode:
      localStorage.getItem("darkMode") === "true" ||
      (!localStorage.getItem("darkMode") &&
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches),
    menuLeftOpen: false,
    menuRightOpen: false,
    notifications: [
      {
        id: 1,
        title: "Aktualizacja systemu",
        message: "Planowana konserwacja o 02:00",
        type: "blue",
        read: false,
      },
      {
        id: 2,
        title: "Nowe uprawnienia",
        message: "Przyznano dostęp do raportów",
        type: "yellow",
        read: false,
      },
      {
        id: 3,
        title: "Błąd integracji",
        message: "Problem z API zewnętrznym",
        type: "red",
        read: true,
      },
      {
        id: 4,
        title: "Informacja",
        message: "Nowa wersja aplikacji dostępna",
        type: "purple",
        read: false,
      },
    ],
    user: {
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
    addNotification(notification) {
      const id = Date.now();
      this.notifications.unshift({ id, ...notification, read: false });
    },
    markRead(id) {
      const item = this.notifications.find((n) => n.id === id);
      if (item) item.read = true;
    },
    markAllRead() {
      this.notifications.forEach((n) => (n.read = true));
    },
    removeNotification(id) {
      this.notifications = this.notifications.filter((n) => n.id !== id);
    },
  },
  getters: {
    notificationsCount: (state) => state.notifications.length,
    unreadCount: (state) => state.notifications.filter((n) => !n.read).length,
  },
});

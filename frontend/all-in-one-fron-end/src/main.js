import { createApp, watch } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import "./assets/styles.css";
import { useUIStore } from "./stores/ui";

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);

// after pinia is registered we can access the store to sync dark mode
const ui = useUIStore();
// apply initial class
if (ui.darkMode) document.documentElement.classList.add("dark");

watch(
  () => ui.darkMode,
  (val) => {
    if (val) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }
);

app.mount("#app");
// fetch notifications for current user on startup
if (ui && ui.user && ui.user.id) {
  ui.fetchNotifications(ui.user.id).catch((e) =>
    console.warn("Failed to load notifications", e)
  );
}

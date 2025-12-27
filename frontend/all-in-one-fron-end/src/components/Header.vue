<template>
  <header
    id="app-header"
    class="fixed top-0 left-0 right-0 z-50 glass-effect shadow-lg px-6 py-4 transition-all duration-300"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <button
          @click="toggleLeft"
          class="lg:hidden p-2 rounded-lg hover:bg-primary/10 transition-colors"
        >
          <i class="fas fa-bars text-primary text-xl"></i>
        </button>
        <div class="flex items-center space-x-3">
          <div
            class="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-lg"
          >
            <i class="fas fa-cube text-white"></i>
          </div>
          <div>
            <h1 class="text-lg font-bold text-gray-900 dark:text-light">
              Panel Aplikacji
            </h1>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              System Firmowy
            </p>
          </div>
        </div>
      </div>

      <div class="hidden md:flex items-center flex-1 max-w-md mx-8">
        <div class="relative w-full">
          <input
            type="search"
            placeholder="Szukaj aplikacji..."
            class="search-input w-full px-4 py-2 pl-10 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl focus:border-primary focus:outline-none transition-all"
          />
          <i
            class="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
          ></i>
        </div>
      </div>

      <div class="flex items-center space-x-4">
        <div class="hidden sm:block text-sm text-gray-600 dark:text-gray-300">
          <span>{{ currentDate }}</span>
        </div>

        <button
          @click="toggleTheme"
          class="p-2 rounded-lg hover:bg-primary/10 transition-all"
        >
          <i v-if="!ui.darkMode" class="fas fa-moon text-primary"></i>
          <i v-else class="fas fa-sun text-secondary"></i>
        </button>

        <button
          @click="toggleRight"
          class="relative p-2 rounded-lg hover:bg-primary/10 transition-all"
        >
          <i class="fas fa-bell text-primary dark:text-secondary text-xl"></i>
          <span
            class="notification-badge absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center"
            >{{ notificationsCount }}</span
          >
        </button>

        <div
          class="flex items-center space-x-3 pl-4 border-l border-gray-300 dark:border-gray-700"
        >
          <div class="hidden sm:block text-right">
            <p class="text-sm font-semibold text-gray-900 dark:text-light">
              {{ ui.user.name }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ ui.user.role }}
            </p>
          </div>
          <div class="relative">
            <img
              :src="avatarUrl"
              alt="Profil"
              class="w-10 h-10 rounded-xl ring-2 ring-primary/30 hover:ring-primary transition-all cursor-pointer"
            />
            <span
              class="absolute bottom-0 right-0 w-3 h-3 bg-secondary rounded-full border-2 border-white dark:border-gray-900"
            ></span>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import { useUIStore } from "../stores/ui";

export default {
  name: "AppHeader",
  setup() {
    const ui = useUIStore();
    const currentDate = ref("");

    const setCurrentDate = () => {
      const now = new Date();
      const options = {
        weekday: "long",
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
      };
      currentDate.value = now.toLocaleDateString("pl-PL", options);
    };

    let interval;
    onMounted(() => {
      setCurrentDate();
      interval = setInterval(setCurrentDate, 60000);
    });
    onBeforeUnmount(() => clearInterval(interval));

    const toggleTheme = () => ui.toggleDark();
    const toggleLeft = () => ui.toggleLeft();
    const toggleRight = () => ui.toggleRight();

    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      ui.user.name
    )}&background=8f0047&color=fff&size=40`;

    const unreadCount = computed(() => ui.unreadCount);
    const notificationsCount = computed(() => ui.notificationsCount);

    return {
      ui,
      currentDate,
      toggleTheme,
      toggleLeft,
      toggleRight,
      avatarUrl,
      unreadCount,
      notificationsCount,
    };
  },
};
</script>

<style scoped></style>

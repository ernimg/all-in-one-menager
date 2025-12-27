<template>
  <aside
    id="sidebar-right"
    :class="[
      'fixed right-0 top-0 bottom-0 w-80 glass-effect border-l border-gray-200/50 dark:border-gray-700/50 pt-20 p-6 overflow-y-auto transition-all duration-300 z-40',
      { 'translate-x-full': !ui.menuRightOpen && isMobile },
    ]"
  >
    <div class="mb-6">
      <h2
        class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4"
      >
        Komunikaty
      </h2>
    </div>
    <div class="space-y-3">
      <div
        v-for="n in ui.notifications"
        :key="n.id"
        class="notify-card hover-lift cursor-pointer"
        :class="[n.type, n.read ? 'opacity-70' : '']"
        @click="markRead(n.id)"
      >
        <div class="flex items-start space-x-3">
          <div
            :class="[
              'w-8 h-8 rounded-lg flex items-center justify-center',
              n.type === 'yellow'
                ? 'bg-yellow-500'
                : n.type === 'blue'
                ? 'bg-blue-500'
                : n.type === 'purple'
                ? 'bg-purple-500'
                : 'bg-red-500',
            ]"
          >
            <i class="fas fa-info text-white text-xs"></i>
          </div>
          <div class="flex-1">
            <h4
              :class="[
                'font-semibold text-sm',
                n.read
                  ? 'text-gray-700 dark:text-light'
                  : 'text-gray-900 dark:text-light',
              ]"
            >
              {{ n.title }}
            </h4>
            <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {{ n.message }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
      <h3
        class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4"
      >
        Ostatnia aktywność
      </h3>
      <div class="space-y-3">
        <div class="flex items-center space-x-3 text-xs">
          <div class="w-2 h-2 bg-secondary rounded-full"></div>
          <span class="text-gray-600 dark:text-gray-400">Login: 09:24</span>
        </div>
        <div class="flex items-center space-x-3 text-xs">
          <div class="w-2 h-2 bg-primary rounded-full"></div>
          <span class="text-gray-600 dark:text-gray-400"
            >Ostatnia sesja: 2h 15min</span
          >
        </div>
      </div>
    </div>
  </aside>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useUIStore } from "../stores/ui";

export default {
  name: "SidebarRight",
  setup() {
    const ui = useUIStore();
    const isMobile = ref(window.innerWidth < 1024);
    const onResize = () => {
      isMobile.value = window.innerWidth < 1024;
    };
    onMounted(() => window.addEventListener("resize", onResize));
    onBeforeUnmount(() => window.removeEventListener("resize", onResize));
    const markRead = (id) => ui.markRead(id);
    return { ui, isMobile, markRead };
  },
};
</script>

<style scoped></style>

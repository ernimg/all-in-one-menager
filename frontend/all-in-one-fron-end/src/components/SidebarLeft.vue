<template>
  <aside
    id="sidebar-left"
    :class="[
      'fixed left-0 top-0 bottom-0 w-72 glass-effect border-r border-gray-200/50 dark:border-gray-700/50 pt-20 p-6 overflow-y-auto transition-all duration-300 z-40',
      { '-translate-x-full': !ui.menuLeftOpen && isMobile },
    ]"
  >
    <div class="mb-8">
      <h2
        class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4"
      >
        Menu główne
      </h2>
      <nav class="space-y-2">
        <a
          href="#"
          class="menu-item flex items-center space-x-3 px-4 py-3 rounded-xl bg-primary/10 text-primary hover-lift"
        >
          <i class="fas fa-home w-5"></i>
          <span class="font-medium">Strona główna</span>
          <span
            class="ml-auto text-xs bg-primary text-white px-2 py-1 rounded-full"
            >Nowe</span
          >
        </a>
        <a
          href="#"
          class="menu-item flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
        >
          <i class="fas fa-star w-5 text-gray-600 dark:text-gray-400"></i>
          <span class="text-gray-700 dark:text-gray-300">Ulubione</span>
        </a>
        <div class="pt-4 pb-2">
          <h3
            class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
          >
            Aplikacje testowe
          </h3>
        </div>

        <a
          href="#"
          class="menu-item flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group"
        >
          <i class="fas fa-flask w-5 text-secondary"></i>
          <span class="text-gray-700 dark:text-gray-300">Test SST</span>
          <i
            class="fas fa-arrow-right ml-auto text-gray-400 group-hover:text-secondary transition-all transform group-hover:translate-x-1"
          ></i>
        </a>

        <a
          href="#"
          class="menu-item flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group"
        >
          <i class="fas fa-flask w-5 text-secondary"></i>
          <span class="text-gray-700 dark:text-gray-300">Test RST</span>
          <i
            class="fas fa-arrow-right ml-auto text-gray-400 group-hover:text-secondary transition-all transform group-hover:translate-x-1"
          ></i>
        </a>

        <a
          href="#"
          class="menu-item flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group"
        >
          <i class="fas fa-flask w-5 text-secondary"></i>
          <span class="text-gray-700 dark:text-gray-300">Test RST2</span>
          <i
            class="fas fa-arrow-right ml-auto text-gray-400 group-hover:text-secondary transition-all transform group-hover:translate-x-1"
          ></i>
        </a>

        <a
          href="#"
          class="menu-item flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group"
        >
          <i class="fas fa-flask w-5 text-secondary"></i>
          <span class="text-gray-700 dark:text-gray-300">Test RSTCS</span>
          <i
            class="fas fa-arrow-right ml-auto text-gray-400 group-hover:text-secondary transition-all transform group-hover:translate-x-1"
          ></i>
        </a>

        <div class="pt-4 pb-2">
          <h3
            class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
          >
            Analityka
          </h3>
        </div>

        <a
          href="#"
          class="menu-item flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group"
        >
          <i class="fas fa-chart-line w-5 text-primary"></i>
          <span class="text-gray-700 dark:text-gray-300"
            >Portal Analityczny</span
          >
          <i
            class="fas fa-arrow-right ml-auto text-gray-400 group-hover:text-primary transition-all transform group-hover:translate-x-1"
          ></i>
        </a>

        <slot />
      </nav>
    </div>

    <div class="mt-auto pt-6 border-t border-gray-200 dark:border-gray-700">
      <div
        class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400"
      >
        <span>Wersja 2.0.1</span>
        <span>© 2024</span>
      </div>
    </div>
  </aside>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useUIStore } from "../stores/ui";

export default {
  name: "SidebarLeft",
  setup() {
    const ui = useUIStore();
    const isMobile = ref(window.innerWidth < 1024);

    const onResize = () => {
      isMobile.value = window.innerWidth < 1024;
    };
    onMounted(() => window.addEventListener("resize", onResize));
    onBeforeUnmount(() => window.removeEventListener("resize", onResize));

    return { ui, isMobile };
  },
};
</script>

<style scoped></style>

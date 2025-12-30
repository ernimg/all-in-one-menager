<template>
  <div
    class="bg-light dark:bg-gray-950 min-h-screen transition-all duration-500"
  >
    <!-- Decorative background gradients -->
    <div class="fixed inset-0 opacity-30 dark:opacity-20 pointer-events-none">
      <div
        class="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full filter blur-3xl"
      ></div>
      <div
        class="absolute bottom-0 left-0 w-96 h-96 bg-secondary rounded-full filter blur-3xl"
      ></div>
    </div>

    <AppHeader />
    <SidebarLeft>
      <!-- additional menu items can be slotted here -->
    </SidebarLeft>
    <main class="lg:ml-72 lg:mr-80 pt-24 px-6 pb-6 transition-all duration-300">
      <div class="mb-8 animate-fade-in">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-light mb-2">
          Dostępne Aplikacje
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Wybierz aplikację, aby rozpocząć pracę
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div class="glass-effect rounded-xl p-4 border border-primary/10">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Aktywni użytkownicy
              </p>
              <p class="text-2xl font-bold text-primary">6</p>
            </div>
            <i class="fas fa-rocket text-3xl text-primary/20"></i>
          </div>
        </div>
        <div class="glass-effect rounded-xl p-4 border border-secondary/10">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Ostatnie logowanie
              </p>
              <p class="text-2xl font-bold text-secondary">Dziś</p>
            </div>
            <i class="fas fa-clock text-3xl text-secondary/20"></i>
          </div>
        </div>
        <div
          class="glass-effect rounded-xl p-4 border border-gray-300/30 dark:border-gray-700/30"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Status systemu
              </p>
              <p class="text-2xl font-bold text-green-600 dark:text-green-500">
                Online
              </p>
            </div>
            <i class="fas fa-check-circle text-3xl text-green-600/20"></i>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6" ref="cards">
        <AppCard
          title="TiK"
          description="Techniczna Informacja o Kliencie"
          icon="fas fa-user-shield text-white"
        />
        <AppCard
          title="AiES OAS"
          description="Obsługa Awarii Sieciowych"
          icon="fas fa-network-wired text-white"
          variant="secondary"
        />
        <AppCard
          title="AiES ZP"
          description="Zarządzanie Pracami"
          icon="fas fa-tasks text-white"
          variant="secondary"
        />
        <AppCard
          title="AiES USS"
          description="Utrzymanie Sprawności Sieci"
          icon="fas fa-cogs text-white"
        />
        <AppCard
          title="GEWO"
          description="Graficzna Ewidencja Obiektów"
          icon="fas fa-map-marked-alt text-white"
        />
        <AppCard
          title="GEWO Plus"
          description="Rozszerzona Ewidencja"
          icon="fas fa-database text-white"
          variant="secondary"
        />
      </div>
    </main>
    <SidebarRight>
      <!-- right content slot (notifications etc.) -->
    </SidebarRight>
  </div>
    <button 
      class="fab-button group"
      @click="addToFavorites"
      title="Dodaj do ulubionych"
    >
      <i class="fas fa-heart text-lg transition-transform duration-300 group-hover:scale-110"></i>
      <span class="fab-label">Dodaj do ulubionych</span>
    </button>
</template>

<script>
import AppHeader from "./Header.vue";
import SidebarLeft from "./SidebarLeft.vue";
import SidebarRight from "./SidebarRight.vue";
import AppCard from "./AppCard.vue";
import { onMounted, ref } from "vue";
import { useUIStore } from "../stores/ui";

export default {
  name: "MainPage",
  components: { AppHeader, SidebarLeft, SidebarRight, AppCard },
  setup() {
    const ui = useUIStore();
    const cards = ref(null);


    const isFavorite = ref(false);
    
    const toggleFavorite = () => {
      isFavorite.value = !isFavorite.value;
    
    };
    const onOutsideClick = (e) => {
      if (window.innerWidth < 1024) {
        const left = document.getElementById("sidebar-left");
        const right = document.getElementById("sidebar-right");
        const header = document.getElementById("app-header");
        if (
          left &&
          !left.contains(e.target) &&
          header &&
          !header.contains(e.target)
        ) {
          ui.menuLeftOpen = false;
        }
        if (
          right &&
          !right.contains(e.target) &&
          header &&
          !header.contains(e.target)
        ) {
          ui.menuRightOpen = false;
        }
      }
    };

    const onResize = () => {
      // nothing heavy: keep menus consistent when resizing
      // (sidebars show by CSS on large screens)
    };

    onMounted(() => {
      if (ui.darkMode) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");

      document.addEventListener("click", onOutsideClick);
      window.addEventListener("resize", onResize);

      // simple card animation
      const cardEls = cards.value
        ? cards.value.querySelectorAll(".app-card")
        : [];
      cardEls.forEach((card, index) => {
        setTimeout(() => {
          card.style.opacity = "0";
          card.style.transform = "translateY(20px)";
          card.style.transition = "all 0.5s ease";
          setTimeout(() => {
            card.style.opacity = "1";
            card.style.transform = "translateY(0)";
          }, 100);
        }, index * 100);
      });
    });

    return { ui, cards,isFavorite,toggleFavorite};
  },
};
</script>

<style>
/* Podstawowy styl przycisku (Floating Action Button) */
.fab-button {
  position: fixed;
  right: 32px;
  bottom: 32px;
  z-index: 1000;                 /* Zawsze na wierzchu */

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;

  padding: 14px 24px;
  min-height: 56px;

  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.3px;
  color: var(--color-light);
  
  /* GRADIENT – Twój kolor primary */
  background: linear-gradient(135deg, 
              var(--color-primary) 0%, 
              #6a0036 100%);   /* ciemniejszy odcień primary dla głębi */

  border: none;
  border-radius: 16px;

  /* CIENIE – profesjonalny efekt */
  box-shadow: 
    0 10px 30px rgba(143, 0, 71, 0.45),
    0 4px 12px rgba(0, 0, 0, 0.15);

  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Hover – delikatne uniesienie i jasniejszy gradient */
.fab-button:hover {
  transform: translateY(-5px) scale(1.02);
  background: linear-gradient(135deg, 
              #9a0050 0%, 
              #7a0040 100%);
  box-shadow: 
    0 16px 40px rgba(143, 0, 71, 0.6),
    0 6px 20px rgba(0, 0, 0, 0.2);
}

/* Kliknięcie – lekki „wgniecenie” */
.fab-button:active {
  transform: translateY(-2px) scale(0.98);
  box-shadow: 
    0 6px 20px rgba(143, 0, 71, 0.4),
    0 2px 8px rgba(0, 0, 0, 0.15);
}

/* Focus – outline dla dostępności */
.fab-button:focus-visible {
  outline: none;
  box-shadow: 
    0 0 0 4px rgba(143, 0, 71, 0.3),
    0 10px 30px rgba(143, 0, 71, 0.45);
}

/* Etykieta – ukryta na małych ekranach */
.fab-label {
  font-size: 16px;
  font-weight: 600;
}

/* RESPONSYWNOŚĆ – tylko ikona na telefonach */
@media (max-width: 640px) {
  .fab-button {
    padding: 18px;
    border-radius: 50%;
    width: 64px;
    height: 64px;
  }
  .fab-label {
    display: none;
  }
}

/* ────────────────────────────────────────────────────── */
/* ANIMACJA POTWIERDZENIA (po kliknięciu) */
/* ────────────────────────────────────────────────────── */
.fab-button.added {
  animation: heartBeat 1.2s ease-in-out;
}

@keyframes heartBeat {
  0%   { transform: scale(1); }
  30%  { transform: scale(1.2); }
  60%  { transform: scale(1); }
  80%  { transform: scale(1.1); }
  100% { transform: scale(1); }
}

/* Pulsująca kropka (wizualny feedback) */
.pulse {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(255,255,255,0.7);
  opacity: 0;
  z-index: -1;
  animation: pulse-ring 2s ease-out infinite;
}

@keyframes pulse-ring {
  0% {
    transform: scale(0.95);
    opacity: 0;
  }
  70% {
    transform: scale(1.4);
    opacity: 0;
  }
  100% {
    transform: scale(1.4);
    opacity: 0;
  }
}

/* ────────────────────────────────────────────────────── */
/* DARK MODE – automatyczna adaptacja */
/* ────────────────────────────────────────────────────── */
.dark .fab-button {
  box-shadow: 
    0 10px 30px rgba(143, 0, 71, 0.6),
    0 4px 12px rgba(0, 0, 0, 0.4);
}

.dark .fab-button:hover {
  box-shadow: 
    0 16px 40px rgba(143, 0, 71, 0.75),
    0 6px 20px rgba(0, 0, 0, 0.5);
}
</style>

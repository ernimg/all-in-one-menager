<template>
  <a :href="href || '#'" class="app-card p-6 hover-lift group cursor-pointer">
    <div class="flex items-start space-x-4">
      <div :class="['icon-wrapper', iconBg]">
        <i :class="icon"></i>
      </div>
      <div class="flex-1">
        <h3 class="font-bold text-gray-900 dark:text-light">{{ title }}</h3>
        <p class="text-sm">{{ description }}</p>
        <div class="action" :class="textClass">
          <i class="fas fa-arrow-right mr-2"></i>
          <span>{{ actionText }}</span>
        </div>
      </div>
    </div>
  </a>
</template>

<script>
export default {
  name: "AppCard",
  props: {
    title: String,
    description: String,
    icon: { type: String, default: "fas fa-cube text-white" },
    variant: { type: String, default: "primary" },
    actionText: { type: String, default: "Otwórz aplikację" },
    href: String,
  },
  computed: {
    iconBg() {
      return this.variant === "secondary"
        ? "gradient-secondary"
        : "gradient-primary";
    },
    textClass() {
      return this.variant === "secondary" ? "text-secondary" : "text-primary";
    },
  },
};
</script>

<style scoped></style>

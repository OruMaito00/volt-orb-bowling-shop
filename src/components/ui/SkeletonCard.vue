<template>
  <article class="skeleton-card">
    <div class="skeleton-card__image skeleton"></div>
    <div class="skeleton-card__body">
      <div class="skeleton-card__title skeleton"></div>
      <div class="skeleton-card__title skeleton skeleton--short"></div>
      <div class="skeleton-card__footer">
        <div class="skeleton-card__price skeleton"></div>
        <div class="skeleton-card__button skeleton"></div>
      </div>
    </div>
  </article>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as m;

.skeleton-card {
  @include m.card-layout;
  display: flex;
  flex-direction: column;
  cursor: default;
}

.skeleton-card__image {
  height: 200px;
  padding: var(--spacing-md);
  background-color: var(--color-bg);
  border-radius: var(--radius-sm);
}

.skeleton-card__body {
  padding: var(--spacing-sm) var(--spacing-md) var(--spacing-md);
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: var(--spacing-xs);
}

.skeleton-card__title {
  height: 1rem;
  width: 75%;

  &.skeleton--short {
    width: 50%;
  }
}

.skeleton-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
  margin-top: auto;
}

.skeleton-card__price {
  height: 1.25rem;
  width: 3.5rem;
}

.skeleton-card__button {
  height: 1.75rem;
  width: 5.5rem;
}
</style>

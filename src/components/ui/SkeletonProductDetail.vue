<template>
  <div class="skeleton-detail">
    <div class="skeleton-detail__layout">
      <div class="skeleton-detail__image skeleton"></div>
      <div class="skeleton-detail__info">
        <div class="skeleton-detail__category skeleton"></div>
        <div class="skeleton-detail__title skeleton"></div>
        <div class="skeleton-detail__price skeleton"></div>
        <div class="skeleton-detail__desc skeleton"></div>
        <div class="skeleton-detail__desc skeleton skeleton--mid"></div>
        <div class="skeleton-detail__desc skeleton skeleton--short"></div>
        <div class="skeleton-detail__actions">
          <div class="skeleton-detail__button skeleton"></div>
          <div class="skeleton-detail__wishlist skeleton"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/mixins' as m;

.skeleton-detail {
  padding-top: var(--spacing-lg);
}

.skeleton-detail__layout {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);

  @include m.respond-to('desktop') {
    flex-direction: row;
    align-items: flex-start;
  }
}

.skeleton-detail__image {
  min-height: 300px;
  border-radius: var(--radius-md);

  @include m.respond-to('desktop') {
    flex: 0 0 400px;
  }
}

.skeleton-detail__info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.skeleton-detail__category {
  height: 0.75rem;
  width: 6rem;
}

.skeleton-detail__title {
  height: 1.75rem;
  width: 80%;
  margin-top: var(--spacing-sm);
}

.skeleton-detail__price {
  height: 2rem;
  width: 5rem;
  margin-top: var(--spacing-sm);
}

.skeleton-detail__desc {
  height: 1rem;
  width: 100%;

  &.skeleton--mid {
    width: 85%;
  }

  &.skeleton--short {
    width: 60%;
  }
}

.skeleton-detail__actions {
  display: flex;
  gap: var(--spacing-sm);
  align-items: stretch;
  margin-top: var(--spacing-lg);
}

.skeleton-detail__button {
  height: 2.75rem;
  flex: 1;
  border-radius: var(--radius-sm);

  @include m.respond-to('desktop') {
    flex: 0 0 auto;
    width: 12rem;
  }
}

.skeleton-detail__wishlist {
  height: 2.75rem;
  width: 3rem;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}
</style>

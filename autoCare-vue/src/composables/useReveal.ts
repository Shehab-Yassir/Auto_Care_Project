import { onMounted, onBeforeUnmount } from 'vue'

/**
 * Adds `.in-view` to any element with the `.reveal` class inside the
 * component's DOM once it scrolls into the viewport. Pure CSS handles the
 * actual transition (see `.reveal` in style.css) — this just toggles a
 * class, so it stays cheap even with many elements on a page.
 */
export function useReveal() {
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    const els = document.querySelectorAll('.reveal:not(.in-view)')
    if (!('IntersectionObserver' in window) || els.length === 0) {
      els.forEach((el) => el.classList.add('in-view'))
      return
    }
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view')
            observer?.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    )
    els.forEach((el) => observer?.observe(el))
  })

  onBeforeUnmount(() => observer?.disconnect())
}

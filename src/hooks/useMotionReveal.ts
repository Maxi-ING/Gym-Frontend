import { useEffect, useRef } from 'react';
import { usePreferences } from '../features/settings/PreferencesProvider';

const targets =
  '.page-heading, .panel, .auth-content, .auth-form-card, .about-opening > div, .about-image, .about-history, .about-principles, .about-platform, .feedback, .record-row';

/** Reveal each content block once. Content stays usable without observers or animations. */
export function useMotionReveal<T extends HTMLElement = HTMLDivElement>(enabled = true) {
  const ref = useRef<T>(null);
  const { reducedMotion } = usePreferences();
  useEffect(() => {
    const root = ref.current;
    if (!root || !enabled || !window.IntersectionObserver) return;
    const observed = new WeakSet<Element>();
    const animations = new Map<Element, Animation>();
    const cancel = () => {
      animations.forEach((animation) => animation.cancel());
      animations.clear();
    };
    const observer = new IntersectionObserver(
      (entries) => {
        let order = 0;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const element = entry.target as HTMLElement;
          observer.unobserve(element);
          if (element.dataset.revealed) continue;
          element.dataset.revealed = 'true';
          if (
            reducedMotion ||
            document.documentElement.dataset.input === 'keyboard' ||
            !element.animate
          )
            continue;
          const animation = element.animate(
            [
              { opacity: 0.55, transform: 'translateY(16px)' },
              { opacity: 1, transform: 'translateY(0)' },
            ],
            {
              duration: 280,
              delay: Math.min(order++ * 45, 135),
              easing: 'cubic-bezier(0.23, 1, 0.32, 1)',
              fill: 'backwards',
            },
          );
          animations.set(element, animation);
          animation.onfinish = () => animations.delete(element);
        }
      },
      { threshold: 0.08 },
    );
    const scan = () => {
      root.querySelectorAll<HTMLElement>(targets).forEach((element) => {
        if (observed.has(element) || element.dataset.revealed) return;
        // A nested panel follows its parent's movement rather than animating twice.
        const parent = element.parentElement?.closest(targets);
        if (parent && root.contains(parent)) return;
        observed.add(element);
        if (reducedMotion) element.dataset.revealed = 'true';
        else observer.observe(element);
      });
    };
    scan();
    const mutations = new MutationObserver(scan);
    mutations.observe(root, { childList: true, subtree: true });
    const focus = (event: FocusEvent) => {
      animations.forEach((animation, element) => {
        if (element.contains(event.target as Node)) {
          animation.cancel();
          animations.delete(element);
        }
      });
    };
    root.addEventListener('focusin', focus);
    window.addEventListener('keydown', cancel);
    return () => {
      observer.disconnect();
      mutations.disconnect();
      root.removeEventListener('focusin', focus);
      window.removeEventListener('keydown', cancel);
      cancel();
    };
  }, [enabled, reducedMotion]);
  return ref;
}

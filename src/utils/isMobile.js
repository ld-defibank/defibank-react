const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

export function ismw() {
  return window.innerWidth < 600;
}

export default function ism(strict = false) {
  return (!strict || isMobile) && ismw();
}

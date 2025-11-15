import { useEffect } from 'react'

/**
 * Hook to scroll to top of viewport when modal opens
 * @param {boolean} isOpen - Whether the modal is open
 */
export function useScrollToTop(isOpen) {
  useEffect(() => {
    if (isOpen) {
      // Scroll to top smoothly
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }
  }, [isOpen])
}

export default useScrollToTop

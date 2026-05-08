import { forwardRef, type ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";

/**
 * Unified page/screen transition wrapper.
 * Use to wrap full-screen views so timing & easing are consistent across the app.
 *
 * Usage:
 *   <PageTransition>
 *     ...
 *   </PageTransition>
 */

type Props = Omit<HTMLMotionProps<"div">, "initial" | "animate" | "exit" | "transition"> & {
  children: ReactNode;
  /** Slight horizontal slide on enter (default 0). Use -16 for back, 16 for forward. */
  offsetX?: number;
};

const PageTransition = forwardRef<HTMLDivElement, Props>(
  ({ children, offsetX = 0, className, ...rest }, ref) => (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: offsetX, y: 6 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{
        duration: 0.34,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  )
);

PageTransition.displayName = "PageTransition";
export default PageTransition;

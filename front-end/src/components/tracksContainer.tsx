import { motion, AnimatePresence } from "motion/react";

/* Track Container */
export default function TracksContainer({ children }) {
  return (
    <AnimatePresence>
      <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
            },
          },
          exit: {
            opacity: 0,
            transition: {
              staggerChildren: 0.05,
              staggerDirection: -1,
            },
          },
        }}
        className="grid grid-cols-1 min-[600px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-5 mb-5 md:mt-8 gap-4 "
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

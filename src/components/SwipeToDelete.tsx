import { ReactNode, useRef } from "react";
import { motion, useMotionValue, useTransform, useAnimation, PanInfo } from "framer-motion";
import { Trash2 } from "lucide-react";

interface SwipeToDeleteProps {
  children: ReactNode;
  onDelete: () => void;
  className?: string;
}

const SwipeToDelete = ({ children, onDelete, className }: SwipeToDeleteProps) => {
  const x = useMotionValue(0);
  const controls = useAnimation();
  const constraintRef = useRef(null);

  // Umbral para considerar que se quiere eliminar (o abrir el botón)
  const SWIPE_THRESHOLD = -60;
  // Posición donde se queda abierto el botón
  const OPEN_POSITION = -80;

  const handleDragEnd = async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    // Si se desliza suficientemente a la izquierda o con velocidad rápida hacia la izquierda
    if (offset < SWIPE_THRESHOLD || velocity < -500) {
      await controls.start({ x: OPEN_POSITION });
    } else {
      await controls.start({ x: 0 });
    }
  };

  const handleDeleteClick = () => {
    // Animación de salida antes de ejecutar la acción
    controls.start({ x: -200, opacity: 0 }).then(() => {
        onDelete();
    });
  };

  // El botón de fondo se hace visible a medida que se desliza
  const bgOpacity = useTransform(x, [0, -50], [0, 1]);
  const iconScale = useTransform(x, [0, -50], [0.5, 1]);

  return (
    <div className={`relative overflow-hidden ${className}`} ref={constraintRef}>
      {/* Botón de eliminar (Fondo) */}
      <div className="absolute inset-y-0 right-0 w-24 flex items-center justify-center pr-2">
        <motion.button
          onClick={handleDeleteClick}
          className="w-12 h-12 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow-md z-0"
          style={{ opacity: bgOpacity, scale: iconScale }}
          whileTap={{ scale: 0.9 }}
        >
          <Trash2 className="w-6 h-6" />
        </motion.button>
      </div>

      {/* Contenido (Frente) */}
      <motion.div
        drag="x"
        dragConstraints={{ left: OPEN_POSITION, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{ x, touchAction: "pan-y" }} 
        className="relative z-10 bg-background"
      >
        {children}
      </motion.div>
    </div>
  );
};

export default SwipeToDelete;
"use client";
import { ArrowUp, ArrowDown, Copy, Trash2 } from "lucide-react";
import styles from "./cell.module.css";

interface CellTaskbarProps {
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export default function CellTaskbar({
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
}: CellTaskbarProps) {
  const handle = (fcn: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    fcn();
  };

  return (
    <div className={styles.taskbar}>
      <button className={styles.taskBtn} title="Move up" onClick={handle(onMoveUp)}>
        <ArrowUp size={13} />
      </button>
      <button className={styles.taskBtn} title="Move down" onClick={handle(onMoveDown)}>
        <ArrowDown size={13} />
      </button>
      <button className={styles.taskBtn} title="Duplicate" onClick={handle(onDuplicate)}>
        <Copy size={13} />
      </button>
      <button
          className={`${styles.taskBtn} ${styles.taskBtnDanger}`}
          title="Delete cell"
          onClick={handle(onDelete)}
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}

// Keyboard + pointer/touch input. The engine works in CSS-pixel canvas
// coordinates, so pointer positions are mapped through the bounding rect.

export type Action =
  | "confirm"
  | "pause"
  | "bomb"
  | "mute"
  | "flash"
  | "restart"
  | "fullscreen"
  | "navUp"
  | "navDown"
  | "navLeft"
  | "navRight";

export class Input {
  private keys = new Set<string>();
  private actionQ: Action[] = [];
  private tapQ: { x: number; y: number }[] = [];
  pointer = { active: false, down: false, x: 0, y: 0 };

  private el: HTMLCanvasElement;
  private downX = 0;
  private downY = 0;
  private downT = 0;
  private moved = false;

  constructor(canvas: HTMLCanvasElement) {
    this.el = canvas;
    window.addEventListener("keydown", this.onKeyDown, { passive: false });
    window.addEventListener("keyup", this.onKeyUp);
    canvas.addEventListener("pointerdown", this.onPointerDown);
    canvas.addEventListener("pointermove", this.onPointerMove);
    window.addEventListener("pointerup", this.onPointerUp);
    window.addEventListener("pointercancel", this.onPointerUp);
    window.addEventListener("blur", this.onBlur);
  }

  private onBlur = (): void => {
    this.keys.clear();
    this.pointer.down = false;
    this.pointer.active = false;
  };

  private onKeyDown = (e: KeyboardEvent): void => {
    const k = e.key.toLowerCase();
    if (
      [" ", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)
    )
      e.preventDefault();
    if (this.keys.has(k)) return; // ignore auto-repeat for edge actions
    this.keys.add(k);
    if (k === "enter" || k === " ") this.actionQ.push("confirm");
    else if (k === "p" || k === "escape") this.actionQ.push("pause");
    else if (k === "b" || k === "shift") this.actionQ.push("bomb");
    else if (k === "m") this.actionQ.push("mute");
    else if (k === "l") this.actionQ.push("flash");
    else if (k === "r") this.actionQ.push("restart");
    else if (k === "f") this.actionQ.push("fullscreen");
    else if (k === "arrowup" || k === "w") this.actionQ.push("navUp");
    else if (k === "arrowdown" || k === "s") this.actionQ.push("navDown");
    else if (k === "arrowleft") this.actionQ.push("navLeft");
    else if (k === "arrowright") this.actionQ.push("navRight");
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    this.keys.delete(e.key.toLowerCase());
  };

  private toLocal(e: PointerEvent): { x: number; y: number } {
    const r = this.el.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  private onPointerDown = (e: PointerEvent): void => {
    const p = this.toLocal(e);
    this.pointer.active = true;
    this.pointer.down = true;
    this.pointer.x = p.x;
    this.pointer.y = p.y;
    this.downX = p.x;
    this.downY = p.y;
    this.downT = performance.now();
    this.moved = false;
    if (e.pointerType !== "mouse") e.preventDefault();
  };

  private onPointerMove = (e: PointerEvent): void => {
    if (!this.pointer.down && e.pointerType !== "mouse") return;
    const p = this.toLocal(e);
    this.pointer.x = p.x;
    this.pointer.y = p.y;
    this.pointer.active = true;
    if (Math.hypot(p.x - this.downX, p.y - this.downY) > 14) this.moved = true;
  };

  private onPointerUp = (e: PointerEvent): void => {
    const dt = performance.now() - this.downT;
    if (!this.moved && dt < 450 && this.pointer.down) {
      this.tapQ.push({ x: this.pointer.x, y: this.pointer.y });
    }
    this.pointer.down = false;
    if (e.pointerType !== "mouse") this.pointer.active = false;
  };

  /** -1..1 from keyboard; 0 when both/neither held. */
  moveAxis(): number {
    const l = this.keys.has("arrowleft") || this.keys.has("a");
    const r = this.keys.has("arrowright") || this.keys.has("d");
    return (r ? 1 : 0) - (l ? 1 : 0);
  }

  poll(): Action | undefined {
    return this.actionQ.shift();
  }

  takeTap(): { x: number; y: number } | undefined {
    return this.tapQ.shift();
  }

  clearQueues(): void {
    this.actionQ.length = 0;
    this.tapQ.length = 0;
  }

  destroy(): void {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    this.el.removeEventListener("pointerdown", this.onPointerDown);
    this.el.removeEventListener("pointermove", this.onPointerMove);
    window.removeEventListener("pointerup", this.onPointerUp);
    window.removeEventListener("pointercancel", this.onPointerUp);
    window.removeEventListener("blur", this.onBlur);
  }
}

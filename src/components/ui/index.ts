// ───────────────────────────────────────────────────────────────
//  THE STORE
//  Single counter the whole UI buys from. Consumers import ONLY
//  from "@/components/ui" — never reach into the factory files,
//  never re-style primitives inline. Change a component once here
//  (its factory file) and every page updates.
// ───────────────────────────────────────────────────────────────
export { cn } from "@/lib/utils";
export { Section, Container } from "./section";
export { Eyebrow, Title, Text } from "./typography";
export { Button, type ButtonProps } from "./button";
export { Badge } from "./badge";
export { Card, Surface } from "./card";
export { SectionHeader } from "./section-header";
export { Stat, StatGrid } from "./stat";

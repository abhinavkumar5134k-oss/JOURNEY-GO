import { Train, Bus, Car, Bike, Layers } from 'lucide-react';
import type { TransportMode } from '../types';

interface Props {
  mode: TransportMode;
  size?: 'sm' | 'md' | 'lg';
}

const config: Record<TransportMode, { icon: React.ElementType; bg: string; icon_color: string }> = {
  metro:    { icon: Train,  bg: 'bg-blue-100',   icon_color: 'text-blue-600' },
  bus:      { icon: Bus,    bg: 'bg-green-100',  icon_color: 'text-green-600' },
  train:    { icon: Train,  bg: 'bg-purple-100', icon_color: 'text-purple-600' },
  auto:     { icon: Bike,   bg: 'bg-amber-100',  icon_color: 'text-amber-600' },
  cab:      { icon: Car,    bg: 'bg-sky-100',    icon_color: 'text-sky-600' },
  combined: { icon: Layers, bg: 'bg-teal-100',   icon_color: 'text-teal-600' },
};

const sizeMap = {
  sm: { wrap: 'w-8 h-8 rounded-xl',  icon: 14, stroke: 2 },
  md: { wrap: 'w-11 h-11 rounded-xl', icon: 19, stroke: 2 },
  lg: { wrap: 'w-14 h-14 rounded-2xl', icon: 24, stroke: 2 },
};

export default function TransportBadge({ mode, size = 'md' }: Props) {
  const { icon: Icon, bg, icon_color } = config[mode];
  const sz = sizeMap[size];
  return (
    <div className={`${sz.wrap} ${bg} flex items-center justify-center flex-shrink-0`}>
      <Icon size={sz.icon} className={icon_color} strokeWidth={sz.stroke} />
    </div>
  );
}

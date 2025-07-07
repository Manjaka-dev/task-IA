declare module 'lucide-react' {
  import { ComponentType, SVGProps } from 'react';
  
  export interface LucideProps extends Partial<Omit<SVGProps<SVGSVGElement>, "ref">> {
    size?: string | number;
    absoluteStrokeWidth?: boolean;
  }
  
  export type LucideIcon = ComponentType<LucideProps>;
  
  // Icônes principales de l'application
  export const BarChart3: LucideIcon;
  export const CheckSquare: LucideIcon;
  export const Users: LucideIcon;
  export const Package: LucideIcon;
  export const Calendar: LucideIcon;
  export const RefreshCw: LucideIcon;
  export const CheckCircle: LucideIcon;
  export const Clock: LucideIcon;
  export const AlertCircle: LucideIcon;
  export const Target: LucideIcon;
  export const TrendingUp: LucideIcon;
  export const Timer: LucideIcon;
  export const Plus: LucideIcon;
  export const Edit: LucideIcon;
  export const Trash2: LucideIcon;
  export const Search: LucideIcon;
  export const Filter: LucideIcon;
  export const MoreHorizontal: LucideIcon;
  export const Mail: LucideIcon;
  export const Eye: LucideIcon;
  export const EyeOff: LucideIcon;
  export const X: LucideIcon;
  export const Save: LucideIcon;
  export const Download: LucideIcon;
  export const Upload: LucideIcon;
  export const FileText: LucideIcon;
  export const Settings: LucideIcon;
  export const User: LucideIcon;
  export const UserPlus: LucideIcon;
  export const LogOut: LucideIcon;
  export const MessageCircle: LucideIcon;
  export const ExternalLink: LucideIcon;
  
  // Icônes de navigation
  export const ChevronDown: LucideIcon;
  export const ChevronUp: LucideIcon;
  export const ChevronLeft: LucideIcon;
  export const ChevronRight: LucideIcon;
  export const ArrowLeft: LucideIcon;
  export const ArrowRight: LucideIcon;
  export const ArrowUp: LucideIcon;
  export const ArrowDown: LucideIcon;
  
  // Icônes d'état et feedback
  export const Copy: LucideIcon;
  export const Check: LucideIcon;
  export const Circle: LucideIcon;
  export const Dot: LucideIcon;
  export const Info: LucideIcon;
  export const Warning: LucideIcon;
  export const Error: LucideIcon;
  export const Success: LucideIcon;
  export const Star: LucideIcon;
  export const Heart: LucideIcon;
  export const Flag: LucideIcon;
  export const Bookmark: LucideIcon;
  
  // Icônes d'interface
  export const Menu: LucideIcon;
  export const MoreVertical: LucideIcon;
  export const Close: LucideIcon;
  export const Home: LucideIcon;
  export const Share: LucideIcon;
  export const Send: LucideIcon;
  export const Link: LucideIcon;
  export const Hash: LucideIcon;
  export const Archive: LucideIcon;
  export const GripVertical: LucideIcon;
  export const GripHorizontal: LucideIcon;
  export const Move: LucideIcon;
  export const Maximize: LucideIcon;
  export const Minimize: LucideIcon;
  export const Expand: LucideIcon;
  export const Shrink: LucideIcon;
  
  // Icônes média et contrôle
  export const Play: LucideIcon;
  export const Pause: LucideIcon;
  export const Stop: LucideIcon;
  export const Volume2: LucideIcon;
  export const VolumeX: LucideIcon;
  export const RotateCcw: LucideIcon;
  export const RotateCw: LucideIcon;
  export const ZoomIn: LucideIcon;
  export const ZoomOut: LucideIcon;
  export const Camera: LucideIcon;
  export const Image: LucideIcon;
  export const Video: LucideIcon;
  export const Mic: LucideIcon;
  export const MicOff: LucideIcon;
  
  // Icônes sécurité
  export const Lock: LucideIcon;
  export const Unlock: LucideIcon;
  export const Shield: LucideIcon;
  export const ShieldCheck: LucideIcon;
  export const Key: LucideIcon;
  
  // Icônes technique
  export const Zap: LucideIcon;
  export const Activity: LucideIcon;
  export const Cpu: LucideIcon;
  export const Database: LucideIcon;
  export const Server: LucideIcon;
  export const HardDrive: LucideIcon;
  export const Wifi: LucideIcon;
  export const WifiOff: LucideIcon;
  export const Bluetooth: LucideIcon;
  export const Cloud: LucideIcon;
  export const CloudOff: LucideIcon;
  
  // Icônes appareils
  export const Smartphone: LucideIcon;
  export const Tablet: LucideIcon;
  export const Laptop: LucideIcon;
  export const Monitor: LucideIcon;
  export const Headphones: LucideIcon;
  export const Printer: LucideIcon;
  export const Mouse: LucideIcon;
  export const Keyboard: LucideIcon;
  
  // Icônes géographie
  export const MapPin: LucideIcon;
  export const Navigation: LucideIcon;
  export const Compass: LucideIcon;
  export const Globe: LucideIcon;
  export const Map: LucideIcon;
  
  // Icônes communication
  export const Phone: LucideIcon;
  export const PhoneCall: LucideIcon;
  export const MessageSquare: LucideIcon;
  export const AtSign: LucideIcon;
  
  // Autres icônes courantes
  export const Bell: LucideIcon;
  export const BellOff: LucideIcon;
  export const Moon: LucideIcon;
  export const Sun: LucideIcon;
  export const SunMoon: LucideIcon;
  export const Palette: LucideIcon;
  export const Brush: LucideIcon;
  export const Type: LucideIcon;
  export const AlignLeft: LucideIcon;
  export const AlignCenter: LucideIcon;
  export const AlignRight: LucideIcon;
  export const Bold: LucideIcon;
  export const Italic: LucideIcon;
  export const Underline: LucideIcon;
  export const StrikeThrough: LucideIcon;
  export const List: LucideIcon;
  export const ListOrdered: LucideIcon;
  export const Quote: LucideIcon;
  export const Code: LucideIcon;
  export const Code2: LucideIcon;
  export const Terminal: LucideIcon;
  export const FileCode: LucideIcon;
  export const FileJson: LucideIcon;
  export const Folder: LucideIcon;
  export const FolderOpen: LucideIcon;
  export const File: LucideIcon;
  export const Files: LucideIcon;
  export const PaperClip: LucideIcon;
}

declare module 'lucide-react' {
  import { ComponentType, SVGProps } from 'react';
  
  export interface LucideProps extends Partial<Omit<SVGProps<SVGSVGElement>, "ref">> {
    size?: string | number;
    absoluteStrokeWidth?: boolean;
  }
  
  export type LucideIcon = ComponentType<LucideProps>;
  
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
}

import {
  LayoutDashboard, Calendar, MapPin, Activity, FileText,
  ClipboardList, Users, Boxes, BarChart3,
  Wrench, PackageSearch,
  Truck, PackageCheck, History,
  ShieldCheck, UserCog, KeyRound, ScrollText, HeartPulse,
} from 'lucide-vue-next'

export const customerNav = [
  { to: '/customer', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/customer/booking', label: 'Book Service', icon: Calendar },
  { to: '/customer/pickup', label: 'Pickup', icon: MapPin },
  { to: '/customer/progress', label: 'Progress', icon: Activity },
  { to: '/customer/reports', label: 'Reports', icon: FileText },
]

export const managerNav = [
  { to: '/manager', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/manager/requests', label: 'Requests', icon: ClipboardList },
  { to: '/manager/technicians', label: 'Technicians', icon: Users },
  { to: '/manager/inventory', label: 'Inventory', icon: Boxes },
  { to: '/manager/reports', label: 'Reports', icon: BarChart3 },
]

export const technicianNav = [
  { to: '/technician', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/technician/jobs', label: 'My Jobs', icon: Wrench },
  { to: '/technician/parts', label: 'Parts', icon: PackageSearch },
  { to: '/technician/reports', label: 'Reports', icon: FileText },
]

export const driverNav = [
  { to: '/driver', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/driver/pickups', label: 'Pickups', icon: Truck },
  { to: '/driver/deliveries', label: 'Deliveries', icon: PackageCheck },
  { to: '/driver/history', label: 'History', icon: History },
]

export const adminNav = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/users', label: 'Users', icon: UserCog },
  { to: '/admin/roles', label: 'Roles', icon: KeyRound },
  { to: '/admin/logs', label: 'Logs', icon: ScrollText },
  { to: '/admin/health', label: 'System Health', icon: HeartPulse },
]

export { ShieldCheck }

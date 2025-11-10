/**
 * Platform-specific icon exports
 * Uses lucide-react on web and lucide-react-native on native platforms
 */

import { Platform } from 'react-native';

// Import from both libraries
import * as LucideWeb from 'lucide-react';
import * as LucideNative from 'lucide-react-native';

// Select the correct library based on platform
const Icons = Platform.OS === 'web' ? LucideWeb : LucideNative;

// Re-export all icons from the selected library
export const Camera = Icons.Camera;
export const ImageIcon = Icons.Image;
export const History = Icons.History;
export const User = Icons.User;
export const ChefHat = Icons.ChefHat;
export const Scan = Icons.Scan;
export const Clock = Icons.Clock;
export const UserCircle = Icons.UserCircle;
export const ArrowLeft = Icons.ArrowLeft;
export const Menu = Icons.Menu;
export const Bell = Icons.Bell;
export const LogOut = Icons.LogOut;
export const Edit = Icons.Edit;
export const Utensils = Icons.Utensils;
export const Heart = Icons.Heart;
export const AlertCircle = Icons.AlertCircle;
export const CheckCircle = Icons.CheckCircle;
export const XCircle = Icons.XCircle;
export const Info = Icons.Info;
export const Search = Icons.Search;
export const Filter = Icons.Filter;
export const Download = Icons.Download;
export const Upload = Icons.Upload;
export const Settings = Icons.Settings;
export const Home = Icons.Home;
export const Plus = Icons.Plus;
export const Minus = Icons.Minus;
export const X = Icons.X;
export const Check = Icons.Check;
export const ChevronRight = Icons.ChevronRight;
export const ChevronLeft = Icons.ChevronLeft;
export const ChevronDown = Icons.ChevronDown;
export const ChevronUp = Icons.ChevronUp;
export const Star = Icons.Star;
export const Trash2 = Icons.Trash2;
export const Edit2 = Icons.Edit2;
export const LockKeyhole = Icons.LockKeyhole;
export const HelpCircle = Icons.HelpCircle;
export const ShieldAlert = Icons.ShieldAlert;
export const CircleAlert = Icons.CircleAlert;
export const CircleX = Icons.CircleX;

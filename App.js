import { t, useUiPreferences as useCleanMateUi } from './src/ui/Preferences';
import React from 'react';
import { UiPreferencesProvider } from './src/ui/Preferences';
import { ActivityIndicator, Button, Text, View } from './src/ui/Preferences';
import { NavigationContainer } from './src/ui/Preferences';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { NotificationProvider, useNotifications } from './src/context/NotificationContext';
import AuthScreen from './src/screens/AuthScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import FindJobScreen from './src/screens/FindJobScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import SupportScreen from './src/screens/SupportScreen';
import SecurityScreen from './src/screens/SecurityScreen';
import CleanerJobList from './src/components/CleanerJobList';
import { approved } from './src/domain';
const Tabs = createBottomTabNavigator();
function Jobs({route,navigation}) {
  useCleanMateUi(); return <View style={{flex:1,padding:16}}><CleanerJobList selectedBookingId={route.params?.bookingId} onClearSelection={() => navigation.setParams({bookingId:null})} /></View>; }
function Calendar() {
  useCleanMateUi(); return <View style={{flex:1,padding:16}}><Text style={{marginBottom:12}}>Ca đã nhận / đang làm, sắp theo thời gian. Ngày theo giờ Việt Nam.</Text><CleanerJobList chronological /></View>; }
function Workspace() {
  const {palette}=useCleanMateUi();
  const {user} = useAuth(); const {unreadCount} = useNotifications();
  const icons = {Dashboard:'home-outline',FindJob:'search-outline',Jobs:'briefcase-outline',Calendar:'calendar-outline',Notifications:'notifications-outline',CleanerProfile:'person-outline',Support:'help-circle-outline',Security:'lock-closed-outline'};
  return <Tabs.Navigator screenOptions={({route}) => ({headerStyle:{backgroundColor:palette.surface},headerTintColor:palette.text,tabBarActiveTintColor:palette.accent,tabBarInactiveTintColor:palette.muted,tabBarIcon:({color,size}) => <Ionicons name={icons[route.name]} color={color} size={size} />})}>
    {approved(user) && <>
      <Tabs.Screen name="Dashboard" component={DashboardScreen} options={{title:t('Tổng quan')}} />
      <Tabs.Screen name="FindJob" component={FindJobScreen} options={{title:t('Tìm việc')}} />
      <Tabs.Screen name="Jobs" component={Jobs} options={{title:t('Công việc')}} />
      <Tabs.Screen name="Calendar" component={Calendar} options={{title:t('Lịch làm')}} />
    </>}
    <Tabs.Screen name="CleanerProfile" component={ProfileScreen} options={{title:t('Hồ sơ')}} />
    <Tabs.Screen name="Support" component={SupportScreen} options={{title:t('Hỗ trợ'),tabBarItemStyle:{display:'none'}}} />
    <Tabs.Screen name="Security" component={SecurityScreen} options={{title:t('Đổi mật khẩu'),tabBarItemStyle:{display:'none'}}} />
    <Tabs.Screen name="Notifications" component={NotificationsScreen} options={{title:t('Thông báo'),tabBarBadge:unreadCount > 0 ? unreadCount : undefined}} />
  </Tabs.Navigator>;
}
function Root() {
  useCleanMateUi();
  const {user,loading,restoreError,restore,logout,logoutFailed} = useAuth();
  if (loading) return <View style={{flex:1,alignItems:'center',justifyContent:'center'}}><ActivityIndicator /><Text>Đang kiểm tra tài khoản...</Text></View>;
  if (restoreError) return <View style={{padding:32,marginTop:48,gap:16}}><Text accessibilityRole="alert">{restoreError}</Text><Button title={logoutFailed?'Thử đăng xuất lại':'Thử kết nối lại'} onPress={restore} /><Button title="Đăng nhập bằng tài khoản khác" onPress={logout}/></View>;
  return user ? <NotificationProvider><Workspace /></NotificationProvider> : <AuthScreen />;
}
export default function App() {
  useCleanMateUi(); return <UiPreferencesProvider><SafeAreaProvider><AuthProvider><NavigationContainer><Root /></NavigationContainer></AuthProvider></SafeAreaProvider></UiPreferencesProvider>; }

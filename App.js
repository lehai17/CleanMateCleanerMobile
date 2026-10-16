import React from 'react';
import { ActivityIndicator, Button, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
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
import CleanerJobList from './src/components/CleanerJobList';
import { approved } from './src/domain';
const Tabs = createBottomTabNavigator();
function Jobs() { return <View style={{flex:1,padding:16}}><CleanerJobList /></View>; }
function Calendar() { return <View style={{flex:1,padding:16}}><Text style={{marginBottom:12}}>Lịch được sắp theo thời gian. Xem trạng thái trước khi bắt đầu ca.</Text><CleanerJobList chronological /></View>; }
function Workspace() {
  const {user} = useAuth(); const {unreadCount} = useNotifications();
  const icons = {Dashboard:'home-outline',FindJob:'search-outline',Jobs:'briefcase-outline',Calendar:'calendar-outline',Notifications:'notifications-outline',CleanerProfile:'person-outline'};
  return <Tabs.Navigator screenOptions={({route}) => ({headerStyle:{backgroundColor:'#065f46'},headerTintColor:'white',tabBarActiveTintColor:'#047857',tabBarIcon:({color,size}) => <Ionicons name={icons[route.name]} color={color} size={size} />})}>
    {approved(user) && <>
      <Tabs.Screen name="Dashboard" component={DashboardScreen} options={{title:'Tổng quan'}} />
      <Tabs.Screen name="FindJob" component={FindJobScreen} options={{title:'Tìm việc'}} />
      <Tabs.Screen name="Jobs" component={Jobs} options={{title:'Công việc'}} />
      <Tabs.Screen name="Calendar" component={Calendar} options={{title:'Lịch làm'}} />
    </>}
    <Tabs.Screen name="CleanerProfile" component={ProfileScreen} options={{title:'Hồ sơ'}} />
    <Tabs.Screen name="Notifications" component={NotificationsScreen} options={{title:'Thông báo',tabBarBadge:unreadCount > 0 ? unreadCount : undefined}} />
  </Tabs.Navigator>;
}
function Root() {
  const {user,loading,restoreError,restore} = useAuth();
  if (loading) return <View style={{flex:1,alignItems:'center',justifyContent:'center'}}><ActivityIndicator /><Text>Đang kiểm tra tài khoản...</Text></View>;
  if (restoreError) return <View style={{padding:32,marginTop:48}}><Text>{restoreError}</Text><Button title="Thử kết nối lại" onPress={restore} /></View>;
  return user ? <NotificationProvider><Workspace /></NotificationProvider> : <AuthScreen />;
}
export default function App() { return <SafeAreaProvider><AuthProvider><NavigationContainer><Root /></NavigationContainer></AuthProvider></SafeAreaProvider>; }

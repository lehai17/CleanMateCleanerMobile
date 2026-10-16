import { Raw, useUiPreferences as useCleanMateUi } from './../ui/Preferences';
import {useCallback,useState} from 'react';
import { RefreshControl } from 'react-native';
import { ScrollView, Text, View, Button } from './../ui/Preferences';
import {useFocusEffect} from '@react-navigation/native';
import {getCleanerJobs} from '../api/jobs';
import {useAuth} from '../context/AuthContext';
import {stats} from '../domain';
export default function DashboardScreen({navigation}) {
  useCleanMateUi();
  const {user} = useAuth(); const [jobs,setJobs] = useState([]),[loading,setLoading] = useState(false),[error,setError] = useState('');
  const load = useCallback(async () => {setLoading(true);setError('');try{setJobs(await getCleanerJobs());}catch{setError('Không tải được dữ liệu. Vui lòng thử lại.');}finally{setLoading(false);}},[]);
  useFocusEffect(useCallback(() => {load();},[load]));
  const summary = stats(jobs);
  return <ScrollView style={{flex:1,backgroundColor:'#f0fdf4'}} contentContainerStyle={{padding:20}} refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}>
    <Text style={{fontSize:24,fontWeight:'800',color:'#065f46'}}>Chào {<Raw>{user.fullName}</Raw>}</Text><Text style={{marginVertical:16}}>Công việc rõ ràng, lịch làm chủ động.</Text>
    {error ? <Text accessibilityRole="alert" style={{color:'#b91c1c'}}>{error}</Text> : null}
    {!error && !loading && [['Ca sắp làm / đang làm',summary.active],['Ca đã hoàn thành',summary.completed],['Tiền mặt bạn đã xác nhận nhận',`${summary.declaredCash.toLocaleString('vi-VN')} đ`]].map(([label,value]) => <View key={label} style={{padding:24,backgroundColor:'white',borderRadius:16,marginBottom:12}}><Text>{label}</Text><Text style={{fontSize:28,fontWeight:'700',color:'#065f46'}}>{value}</Text></View>)}
    <Text style={{marginVertical:16}}>Khách trả tiền trực tiếp cho bạn. Tổng tiền trên là số bạn tự xác nhận đã nhận, không phải số dư hoặc khoản app sẽ chuyển.</Text>
    <Button title="Tìm công việc mới" onPress={() => navigation.navigate('FindJob')} /><Button title="Tải lại tổng quan" onPress={load} disabled={loading} />
  </ScrollView>;
}

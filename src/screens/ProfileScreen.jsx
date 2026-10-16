import {useState,useEffect} from 'react';
import {ScrollView,Text,TextInput,Button,View,KeyboardAvoidingView,Platform} from 'react-native';
import {api} from '../api/axios';
import {meApi} from '../api/auth';
import {useAuth} from '../context/AuthContext';
import {approved} from '../domain';
export default function ProfileScreen({navigation}) {
  const {user,refreshUser,logout} = useAuth();const p = user.cleanerProfile;
  const [form,setForm] = useState({}),[busy,setBusy] = useState(false),[message,setMessage] = useState('');
  useEffect(() => {setForm({fullName:user.fullName || '',phoneNumber:user.phoneNumber || '',city:p?.city || 'Ha Noi',addressText:p?.addressText || user.address || '',bio:p?.bio || ''});},[user]);
  const pending = p?.reviewStatus === 'Pending',active = approved(user);
  const refresh = async () => {if(busy)return;setBusy(true);setMessage('');try{await refreshUser(await meApi());}catch{setMessage('Không thể tải hồ sơ. Vui lòng thử lại.');}finally{setBusy(false);}};
  const save = async () => {
    if(busy || pending)return;
    if(!form.fullName?.trim() || !form.city?.trim()){setMessage('Vui lòng nhập họ tên và thành phố.');return;}
    setBusy(true);setMessage('');
    try {
      let updated; const data = {...form,hourlyRate:p?.hourlyRate || 0};
      if(active) updated = (await api.put('/api/cleaner/profile',data)).data;
      else {
        await api.put('/api/profile/',{fullName:form.fullName,phoneNumber:form.phoneNumber,address:form.addressText});
        updated = p ? (await api.put('/api/profile/cleaner-application',data)).data : (await api.post('/api/profile/register-cleaner',data)).data;
      }
      await refreshUser(updated);setMessage(active ? 'Đã lưu hồ sơ.' : 'Đã gửi hồ sơ. Vui lòng chờ nhân viên duyệt.');
    }catch(e){setMessage(e?.response?.data?.message || 'Không thể lưu hồ sơ. Vui lòng thử lại.');}finally{setBusy(false);}
  };
  const status = {Pending:'Chờ duyệt',Approved:'Đã duyệt',NeedsInfo:'Cần bổ sung',Rejected:'Từ chối'}[p?.reviewStatus] || 'Chưa đăng ký';
  return <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{padding:20,paddingBottom:40}}>
    <Text style={{fontSize:24,fontWeight:'700',color:'#065f46'}}>Hồ sơ cộng tác viên</Text><Text style={{marginVertical:12}}>{user.email}</Text><Text>Trạng thái: {status}</Text>
    {p?.reviewReason ? <Text style={{padding:12,color:'#9a3412'}}>{p.reviewReason}</Text> : null}
    <Button title="Tải lại trạng thái hồ sơ" onPress={refresh} disabled={busy} />
    {message ? <Text accessibilityRole="alert" style={{marginVertical:12}}>{message}</Text> : null}
    {[['Họ tên','fullName',200],['Số điện thoại','phoneNumber',20],['Thành phố','city',200],['Địa chỉ','addressText',500],['Giới thiệu','bio',2000]].map(([label,key,max]) => <View key={key} style={{marginTop:16}}><Text>{label}</Text><TextInput accessibilityLabel={label} value={form[key] || ''} onChangeText={value => setForm(f => ({...f,[key]:value}))} editable={!busy && !pending} maxLength={max} multiline={key === 'bio'} keyboardType={key === 'phoneNumber' ? 'phone-pad' : 'default'} style={{backgroundColor:'white',borderWidth:1,borderColor:'#cbd5e1',borderRadius:12,padding:12,marginVertical:6}} /></View>)}
    <Button title={busy ? 'Đang xử lý...' : pending ? 'Đang chờ xét duyệt' : active ? 'Lưu hồ sơ' : p ? 'Gửi lại hồ sơ' : 'Gửi hồ sơ cleaner'} onPress={save} disabled={busy || pending} />
    <Text style={{marginVertical:20}}>Giá dịch vụ do CleanMate cấu hình. Khách trả tiền mặt trực tiếp cho bạn sau ca.</Text><Button title="Hỗ trợ đơn hàng" onPress={()=>navigation.navigate('Support')} /><Button title="Đăng xuất" color="#b91c1c" onPress={logout} disabled={busy} />
  </ScrollView></KeyboardAvoidingView>;
}

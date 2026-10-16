import EmailVerification from '../components/EmailVerification';
import {useRef,useState} from 'react';
import {Alert,Button,KeyboardAvoidingView,Platform,ScrollView,Text,TextInput} from 'react-native';
import {useAuth} from '../context/AuthContext';
import {api} from '../api/axios';
export default function SecurityScreen() {
  const {logout}=useAuth();const [form,setForm]=useState({currentPassword:'',newPassword:'',confirmation:''}),[busy,setBusy]=useState(false),[error,setError]=useState('');const pending=useRef(false);
  const revoke=async()=>{
    if(pending.current)return;pending.current=true;setBusy(true);setError('');
    try{await api.post('/api/auth/logout-all');setForm({currentPassword:'',newPassword:'',confirmation:''});await logout();Alert.alert('Đã đăng xuất tất cả thiết bị','Vui lòng đăng nhập lại. Mật khẩu không thay đổi.');}
    catch(e){if(e?.response?.status===401)await logout();else setError(e?.response?.data?.message || 'Không thể đăng xuất. Vui lòng thử lại.');}
    finally{pending.current=false;setBusy(false);}
  };
  const confirmRevoke=()=>Alert.alert('Đăng xuất tất cả thiết bị?','Gồm cả thiết bị này. Mật khẩu không thay đổi.',[{text:'Hủy',style:'cancel'},{text:'Đăng xuất',style:'destructive',onPress:revoke}]);
  const submit=async()=>{
    if(pending.current)return;
    if(!form.currentPassword||form.newPassword.length<12){setError('Nhập mật khẩu hiện tại và mật khẩu mới ít nhất 12 ký tự.');return;}
    if(form.newPassword!==form.confirmation){setError('Hai mật khẩu mới không khớp.');return;}
    pending.current=true;setBusy(true);setError('');
    try{await api.post('/api/auth/change-password',{currentPassword:form.currentPassword,newPassword:form.newPassword});setForm({currentPassword:'',newPassword:'',confirmation:''});await logout();Alert.alert('Đã đổi mật khẩu','Vui lòng đăng nhập lại trên các thiết bị bằng mật khẩu mới.');}
    catch(e){if(e?.response?.status===401){await logout();}else setError(e?.response?.data?.message || 'Không thể đổi mật khẩu. Vui lòng thử lại.');}
    finally{pending.current=false;setBusy(false);}
  };
  return <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':undefined}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{padding:20}}><Text style={{fontSize:24,fontWeight:'700',color:'#065f46'}}>Đổi mật khẩu</Text><Text style={{marginVertical:16}}>Mật khẩu mới ít nhất 12 ký tự. Sau khi lưu, tất cả phiên đăng nhập cũ sẽ hết hiệu lực, gồm cả phiên này.</Text>
    {[['Mật khẩu hiện tại','currentPassword','current-password'],['Mật khẩu mới','newPassword','new-password'],['Nhập lại mật khẩu mới','confirmation','new-password']].map(([label,key,autocomplete])=><TextInput key={key} accessibilityLabel={label} placeholder={label} secureTextEntry autoCapitalize="none" autoCorrect={false} autoComplete={autocomplete} maxLength={key==='currentPassword'?128:72} editable={!busy} value={form[key]} onChangeText={value=>setForm(current=>({...current,[key]:value}))} style={{padding:14,marginBottom:16,borderWidth:1,borderColor:'#cbd5e1',borderRadius:12,backgroundColor:'white'}} />)}
    {error?<Text accessibilityRole="alert" style={{color:'#b91c1c',marginBottom:12}}>{error}</Text>:null}<Button title={busy?'Đang lưu...':'Lưu mật khẩu mới'} disabled={busy} onPress={submit} /><Text style={{marginTop:32,fontSize:20,fontWeight:'700'}}>Quản lý phiên đăng nhập</Text><Text style={{marginVertical:16}}>Đăng xuất tất cả phiên CleanMate, gồm cả thiết bị này. Mật khẩu không thay đổi. Áp dụng cả với tài khoản Google.</Text><Button title="Đăng xuất tất cả thiết bị" color="#b91c1c" disabled={busy} onPress={confirmRevoke} /><EmailVerification/></ScrollView></KeyboardAvoidingView>;
}

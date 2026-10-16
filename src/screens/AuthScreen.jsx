import RecoveryScreen from './RecoveryScreen';
import {useState} from 'react';
import {KeyboardAvoidingView,Platform,ScrollView,Text,TextInput,Button,View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {loginApi,registerApi} from '../api/auth';
import {useAuth} from '../context/AuthContext';
import {eligible} from '../domain';
export default function AuthScreen() {
  const {login} = useAuth(); const inset = useSafeAreaInsets(); const [recover,setRecover]=useState(false);
  const [register,setRegister] = useState(false), [email,setEmail] = useState(''), [password,setPassword] = useState(''), [name,setName] = useState(''), [phone,setPhone] = useState(''), [busy,setBusy] = useState(false), [error,setError] = useState('');
  if(recover)return <RecoveryScreen onBack={()=>setRecover(false)}/>;
  const submit = async () => {
    if (busy) return;
    if (!email.trim() || !password || (register && !name.trim())) {setError('Vui lòng nhập đầy đủ thông tin.');return;}
    setBusy(true);setError('');
    try {
      const result = register ? await registerApi({fullName:name.trim(),email:email.trim(),password,phoneNumber:phone.trim(),role:'Cleaner'}) : await loginApi(email.trim(),password);
      if (!eligible(result.user)) {setError('Ứng dụng này dành cho tài khoản khách hàng/cleaner.');return;}
      await login(result.user,result.token);
    } catch (e) {setError(e?.response?.data?.message || 'Không thể đăng nhập/đăng ký. Kiểm tra thông tin và kết nối.');}
    finally {setBusy(false);setPassword('');}
  };
  const input = {borderWidth:1,borderColor:'#cbd5e1',padding:14,borderRadius:12,marginTop:6,marginBottom:16,backgroundColor:'white'};
  return <KeyboardAvoidingView style={{flex:1,backgroundColor:'#f0fdf4'}} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{padding:24,paddingTop:inset.top+48}}>
    <Text style={{fontSize:30,fontWeight:'800',color:'#065f46'}}>CleanMate Cleaner</Text><Text style={{marginTop:12,marginBottom:32}}>Chủ động công việc, an tâm mỗi ca làm.</Text>
    <Text style={{fontSize:24,fontWeight:'700',marginBottom:20}}>{register ? 'Đăng ký làm cleaner' : 'Đăng nhập'}</Text>
    {error ? <Text accessibilityRole="alert" style={{color:'#b91c1c',marginBottom:16}}>{error}</Text> : null}
    {register && <><Text>Họ tên</Text><TextInput accessibilityLabel="Họ tên" value={name} onChangeText={setName} style={input} maxLength={200} /><Text>Số điện thoại</Text><TextInput accessibilityLabel="Số điện thoại" value={phone} onChangeText={setPhone} style={input} keyboardType="phone-pad" maxLength={20} /></>}
    <Text>Email</Text><TextInput accessibilityLabel="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" style={input} maxLength={254} />
    <Text>Mật khẩu</Text><TextInput accessibilityLabel="Mật khẩu" value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" autoComplete={register ? 'new-password' : 'current-password'} style={input} maxLength={register ? 72 : 128} />
    {register && <Text style={{marginBottom:16}}>Mật khẩu từ 8 ký tự, tối đa 72 byte UTF-8. Ký tự có dấu có thể chiếm nhiều byte.</Text>}
    <Button color="#047857" title={busy ? 'Đang xử lý...' : register ? 'Gửi đăng ký' : 'Đăng nhập'} disabled={busy} onPress={submit} />
    {!register&&<Button title="Quên mật khẩu?" disabled={busy} onPress={()=>setRecover(true)}/>}
    <View style={{height:16}} /><Button title={register ? 'Đã có tài khoản? Đăng nhập' : 'Đăng ký làm cleaner'} disabled={busy} onPress={() => {setRegister(!register);setError('');}} />
    <Text style={{marginTop:24,color:'#475569'}}>Hồ sơ cần được duyệt trước khi nhận việc. Khách trả tiền mặt trực tiếp sau ca.</Text>
  </ScrollView></KeyboardAvoidingView>;
}

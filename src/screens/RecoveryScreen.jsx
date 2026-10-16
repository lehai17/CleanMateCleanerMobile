import { useUiPreferences as useCleanMateUi } from './../ui/Preferences';
import {useRef,useState} from 'react';
import { Platform } from 'react-native';
import { Button, KeyboardAvoidingView, ScrollView, Text, TextInput } from './../ui/Preferences';
import {api} from '../api/axios';

export default function RecoveryScreen({navigation,onBack}){
  useCleanMateUi();
  const [email,setEmail]=useState(''),[code,setCode]=useState(''),[password,setPassword]=useState(''),[confirmation,setConfirmation]=useState(''),[busy,setBusy]=useState(false),[done,setDone]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState('');
  const pending=useRef(false);
  const run=async action=>{if(pending.current)return;pending.current=true;setBusy(true);setError('');setMessage('');try{await action();}catch(e){setError(e?.response?.data?.message||'Không thể xử lý. Vui lòng thử lại.');}finally{pending.current=false;setBusy(false);}};
  const input={borderWidth:1,borderColor:'#cbd5e1',padding:14,borderRadius:10,marginVertical:12,backgroundColor:'white'};
  return <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':undefined}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{padding:24,paddingTop:40}}>
    <Text style={{fontSize:24,fontWeight:'700',color:'#065f46'}}>Khôi phục mật khẩu</Text><Text style={{marginVertical:16}}>Nhập email đăng ký và mã nhận qua email. Mã dùng một lần, có hiệu lực 30 phút. Tài khoản chỉ đăng nhập Google khôi phục qua Google.</Text>
    {error?<Text accessibilityRole="alert" style={{color:'#b91c1c',marginVertical:12}}>{error}</Text>:null}{message?<Text accessibilityRole="text" style={{color:'#065f46',marginVertical:12}}>{message}</Text>:null}
    {!done&&<><TextInput accessibilityLabel="Email khôi phục" placeholder="Email khôi phục" value={email} onChangeText={setEmail} editable={!busy} autoComplete="email" keyboardType="email-address" autoCapitalize="none" maxLength={254} style={input}/>
      <Button title="Gửi mã khôi phục" disabled={busy||!email.trim()} onPress={()=>run(async()=>{const result=await api.post('/api/auth/forgot-password',{email});setMessage(result.data.message);})}/>
      <Text style={{marginTop:24}}>Chỉ yêu cầu lại sau 2 phút. Kiểm tra cả thư rác.</Text><TextInput accessibilityLabel="Mã khôi phục" placeholder="Dán mã khôi phục" value={code} onChangeText={setCode} editable={!busy} autoComplete="one-time-code" autoCapitalize="characters" autoCorrect={false} maxLength={64} style={input}/>
      <TextInput accessibilityLabel="Mật khẩu khôi phục mới" placeholder="Mật khẩu mới (ít nhất 12 ký tự)" value={password} onChangeText={setPassword} editable={!busy} secureTextEntry autoComplete="new-password" autoCapitalize="none" maxLength={72} style={input}/>
      <TextInput accessibilityLabel="Nhập lại mật khẩu khôi phục" placeholder="Nhập lại mật khẩu mới" value={confirmation} onChangeText={setConfirmation} editable={!busy} secureTextEntry autoComplete="new-password" autoCapitalize="none" maxLength={72} style={input}/>
      <Text style={{marginBottom:16}}>Mật khẩu tối đa 72 byte UTF-8. Các phiên đăng nhập cũ sẽ bị thu hồi.</Text>
      <Button title="Đặt lại mật khẩu" disabled={busy||!email.trim()||code.trim().length!==64||password.length<12} onPress={()=>{if(password!==confirmation){setError('Hai mật khẩu mới không khớp.');return;}run(async()=>{const result=await api.post('/api/auth/reset-password',{email,code,newPassword:password});setCode('');setPassword('');setConfirmation('');setDone(true);setMessage(result.data.message);});}}/>
    </>}
    <Text style={{marginTop:24}}/><Button title="Quay lại đăng nhập" disabled={busy} onPress={()=>onBack?onBack():navigation?.goBack()}/>
  </ScrollView></KeyboardAvoidingView>;
}

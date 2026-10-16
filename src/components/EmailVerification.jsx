import { Raw, useUiPreferences as useCleanMateUi } from './../ui/Preferences';
import {useEffect,useRef,useState} from 'react';
import { Button, Text, TextInput, View } from './../ui/Preferences';
import {api} from '../api/axios';

export default function EmailVerification(){
  useCleanMateUi();
  const [user,setUser]=useState(null),[code,setCode]=useState(''),[message,setMessage]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  const active=useRef(true),pending=useRef(false);
  const load=async()=>{const result=await api.get('/api/me');if(active.current)setUser(result.data);};
  useEffect(()=>{active.current=true;load().catch(()=>{if(active.current)setError('Không thể tải trạng thái email.');});return()=>{active.current=false;};},[]);
  const run=async action=>{if(pending.current)return;pending.current=true;setBusy(true);setError('');setMessage('');try{await action();}catch(e){if(active.current)setError(e?.response?.data?.message||'Không thể xác minh email.');}finally{pending.current=false;if(active.current)setBusy(false);}};
  return <View style={{marginTop:32,paddingTop:20,borderTopWidth:1,borderColor:'#cbd5e1'}}><Text style={{fontSize:20,fontWeight:'700',marginBottom:12}}>Xác minh email</Text>
    {error?<Text accessibilityRole="alert" style={{color:'#b91c1c',marginVertical:12}}>{error}</Text>:null}{message?<Text style={{color:'#065f46',marginVertical:12}}>{message}</Text>:null}
    {!user?<Button title="Tải lại trạng thái email" disabled={busy} onPress={()=>run(load)}/>:<><Text>{<Raw>{user.email}</Raw>}</Text>{user.emailVerifiedAt?<Text style={{marginVertical:12}}>Email đã được xác minh.</Text>:<>
      <Text style={{marginVertical:12}}>Mã dùng một lần, có hiệu lực 30 phút. Chỉ yêu cầu lại sau 2 phút.</Text><Button title="Gửi mã xác minh email" disabled={busy} onPress={()=>run(async()=>{const result=await api.post('/api/auth/request-email-verification');if(active.current)setMessage(result.data.message);})}/>
      <TextInput accessibilityLabel="Mã xác minh email" placeholder="Dán mã xác minh email" value={code} onChangeText={setCode} editable={!busy} autoComplete="one-time-code" autoCapitalize="characters" autoCorrect={false} maxLength={64} style={{borderWidth:1,borderColor:'#cbd5e1',padding:14,borderRadius:10,marginVertical:16}}/>
      <Button title="Xác minh email" disabled={busy||code.trim().length!==64} onPress={()=>run(async()=>{const result=await api.post('/api/auth/verify-email',{email:user.email,code});if(!active.current)return;setCode('');setMessage(result.data.message);await load();})}/>
    </>}</>}
  </View>;
}

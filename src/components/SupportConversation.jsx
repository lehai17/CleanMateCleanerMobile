import {useEffect,useRef,useState} from 'react';
import {Button,Text,TextInput,View} from 'react-native';
import * as Crypto from 'expo-crypto';
import {api} from '../api/axios';

export default function SupportConversation({ticketId,onUpdated}) {
  const [open,setOpen]=useState(false),[items,setItems]=useState([]),[cursor,setCursor]=useState(null),[body,setBody]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  const pending=useRef(false),retry=useRef(null),alive=useRef(true);
  useEffect(()=>{alive.current=true;return()=>{alive.current=false;};},[]);
  const load=async(older=false)=>{
    const {data}=await api.get(`/api/support/${ticketId}/messages${older?`?beforeId=${cursor}`:''}`);if(!alive.current)return;
    setItems(previous=>older?[...data.items,...previous.filter(m=>!data.items.some(n=>n.id===m.id))]:data.items);setCursor(data.nextBeforeId);
  };
  const run=async(action)=>{if(pending.current)return;pending.current=true;setBusy(true);setError('');try{await action();}catch(e){if(alive.current)setError(e?.response?.data?.message||'Không thể xử lý trao đổi. Vui lòng thử lại.');}finally{pending.current=false;if(alive.current)setBusy(false);}};
  const send=()=>run(async()=>{const text=body.trim();if(!text)return;if(retry.current?.body!==text)retry.current={body:text,requestId:Crypto.randomUUID()};await api.post(`/api/support/${ticketId}/messages`,retry.current);retry.current=null;if(!alive.current)return;setBody('');await load();await onUpdated?.();});
  if(!open)return <Button title="Xem trao đổi" onPress={()=>{setOpen(true);run(()=>load());}} />;
  return <View style={{gap:12,marginTop:16,borderTopWidth:1,borderColor:'#cbd5e1',paddingTop:12}}><Text style={{fontWeight:'700'}}>Lịch sử trao đổi</Text><Text>Tin bổ sung cho yêu cầu đã giải quyết sẽ mở lại yêu cầu để staff xử lý.</Text><Button title="Tải lại trao đổi" disabled={busy} onPress={()=>run(()=>load())} />{cursor&&<Button title="Tin cũ hơn" disabled={busy} onPress={()=>run(()=>load(true))} />}
    {items.map(m=><View key={m.id} style={{backgroundColor:'#f1f5f9',padding:12,borderRadius:8}}><Text style={{fontWeight:'700'}}>{m.fromStaff?'Nhân viên':'Bạn'} · {new Date(m.createdAt).toLocaleString('vi-VN')}</Text><Text>{m.body}</Text></View>)}
    {!busy&&!items.length&&<Text>Chưa có trao đổi bổ sung.</Text>}{error?<Text accessibilityRole="alert">{error}</Text>:null}<TextInput accessibilityLabel="Tin nhắn hỗ trợ" placeholder="Tin nhắn hỗ trợ" multiline maxLength={2000} value={body} onChangeText={setBody} editable={!busy} style={{padding:12,borderWidth:1,borderColor:'#cbd5e1',borderRadius:8,minHeight:80}} /><Button title="Gửi tin nhắn" disabled={busy||!body.trim()} onPress={send} />
  </View>;
}

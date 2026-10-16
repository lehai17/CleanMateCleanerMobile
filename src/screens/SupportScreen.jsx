import { Raw, useUiPreferences as useCleanMateUi } from './../ui/Preferences';
import SupportConversation from '../components/SupportConversation';
import {useCallback,useEffect,useRef,useState} from 'react';
import { Button, ScrollView, Text, TextInput, View } from './../ui/Preferences';
import {useFocusEffect} from '@react-navigation/native';
import * as Crypto from 'expo-crypto';
import {api} from '../api/axios';
const categories={Scheduling:'Lịch làm / không đến',Quality:'Chất lượng',CashPayment:'Tiền mặt trực tiếp',Other:'Vấn đề khác'};
const statuses={Open:'Đã tiếp nhận',InProgress:'Đang xử lý',Resolved:'Đã giải quyết'};
export default function SupportScreen() {
  useCleanMateUi();
  const [bookings,setBookings]=useState([]),[items,setItems]=useState([]),[total,setTotal]=useState(0),[page,setPage]=useState(1),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState('');
  const [bookingId,setBookingId]=useState(''),[category,setCategory]=useState('Scheduling'),[description,setDescription]=useState('');
  const pending=useRef(false),request=useRef(null);
  const load=useCallback(async()=>{setLoading(true);setError('');try{const r=await api.get(`/api/support?page=${page}`);setItems(r.data.items);setTotal(r.data.total);}catch{setError('Không tải được yêu cầu. Vui lòng thử lại.');}finally{setLoading(false);}},[page]);
  useFocusEffect(useCallback(()=>{load();},[load]));
  useEffect(()=>{api.get('/api/support/bookings').then(r=>setBookings(r.data)).catch(()=>{});},[]);
  const submit=async()=>{
    if(pending.current)return;pending.current=true;setBusy(true);setMessage('');
    try{
      const payload={bookingId:Number(bookingId.trim().replace(/^CM/i,'')),category,description:description.trim()};
      if(!Number.isSafeInteger(payload.bookingId)||payload.bookingId<=0||payload.description.length<10)throw new Error('Nhập mã đơn hợp lệ và mô tả ít nhất 10 ký tự.');
      const key=JSON.stringify(payload);if(request.current?.key!==key)request.current={key,id:Crypto.randomUUID()};
      const r=await api.post('/api/support',{...payload,requestId:request.current.id});request.current=null;setDescription('');setMessage(`Đã gửi yêu cầu HT${r.data.id}.`);if(page!==1)setPage(1);else await load();
    }catch(e){setMessage(e?.response?.data?.message||e.message||'Không gửi được. Vui lòng thử lại.');}finally{pending.current=false;setBusy(false);}
  };
  const input={borderWidth:1,borderColor:'#cbd5e1',backgroundColor:'white',padding:12,borderRadius:10,marginVertical:10};
  return <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{padding:20,paddingBottom:40}}>
    <Text style={{fontSize:24,fontWeight:'700',color:'#065f46'}}>Hỗ trợ đơn hàng</Text><Text style={{marginVertical:12}}>Báo sự cố lịch làm, chất lượng hoặc tiền mặt trực tiếp. Staff phản hồi tại đây; yêu cầu không tự thu/hoàn tiền hay thay đổi ca.</Text>
    <Text>Mã đơn (ví dụ CM123)</Text><TextInput accessibilityLabel="Mã đơn" value={bookingId} onChangeText={setBookingId} maxLength={12} editable={!busy} style={input} />
    {bookings.length>0&&<><Text>Chọn đơn gần đây</Text><ScrollView horizontal contentContainerStyle={{gap:8,marginVertical:10}}>{bookings.slice(0,20).map(b=><Button key={b.id} title={`CM${b.id}`} disabled={busy} onPress={()=>setBookingId(`CM${b.id}`)} />)}</ScrollView></>}
    <Text>Loại sự cố</Text><View style={{gap:8,marginVertical:10}}>{Object.entries(categories).map(([key,label])=><Button key={key} title={`${category===key?'✓ ':''}${label}`} color={category===key?'#047857':'#64748b'} disabled={busy} onPress={()=>setCategory(key)} />)}</View>
    <Text>Mô tả (10–2000 ký tự)</Text><TextInput accessibilityLabel="Mô tả" multiline value={description} onChangeText={setDescription} maxLength={2000} editable={!busy} style={[input,{minHeight:100,textAlignVertical:'top'}]} />
    {message?<Text accessibilityRole="alert" style={{marginVertical:12}}>{message}</Text>:null}<Button title={busy?'Đang gửi...':'Gửi yêu cầu hỗ trợ'} disabled={busy} onPress={submit} />
    <Text style={{fontSize:20,fontWeight:'700',marginTop:28,marginBottom:12}}>Yêu cầu của tôi</Text><Button title="Tải lại hỗ trợ" disabled={loading} onPress={load} />{error?<Text accessibilityRole="alert">{error}</Text>:null}{loading&&<Text>Đang tải...</Text>}
    {items.map(item=><View key={item.id} style={{backgroundColor:'white',padding:16,borderRadius:12,marginTop:12}}><Text style={{fontWeight:'700'}}>HT{item.id} · CM{item.bookingId}</Text><Text>{statuses[item.status]} · {categories[item.category]}</Text><Text style={{marginVertical:12}}>{<Raw>{item.description}</Raw>}</Text><Text>{item.response?<><Text>Phản hồi từ staff:</Text> <Raw>{item.response}</Raw></>:'Nhân viên chưa phản hồi.'}</Text><SupportConversation ticketId={item.id} onUpdated={load} /></View>)}
    {!loading&&!error&&!items.length&&<Text>Bạn chưa có yêu cầu hỗ trợ.</Text>}<Text style={{marginVertical:12}}>Trang {page} · {total} yêu cầu</Text><Button title="Trang trước" disabled={loading||page===1} onPress={()=>setPage(page-1)} /><Button title="Trang sau" disabled={loading||page*20>=total} onPress={()=>setPage(page+1)} />
  </ScrollView>;
}

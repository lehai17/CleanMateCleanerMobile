import { useUiPreferences as useCleanMateUi } from './../ui/Preferences';
import { Button, ScrollView, Text, TextInput, View } from './../ui/Preferences';
import {validDay} from '../domain';
const labels = {All:'Tất cả',Accepted:'Đã nhận',InProgress:'Đang làm',Completed:'Hoàn thành',Cancelled:'Đã hủy'};
export default function JobFilters({value,onChange,statuses=[]}) {
  useCleanMateUi();
  const input = {borderWidth:1,borderColor:'#cbd5e1',borderRadius:8,padding:10,backgroundColor:'white',marginTop:4,marginBottom:10};
  return <View style={{marginVertical:12}}>
    <Text>Tìm công việc</Text><TextInput accessibilityLabel="Tìm công việc" placeholder="Mã CM, khách hàng, địa chỉ" maxLength={100} value={value.search} onChangeText={search => onChange({...value,search})} style={input} />
    <Text>Ngày làm việc (YYYY-MM-DD, giờ Việt Nam)</Text><TextInput accessibilityLabel="Ngày làm việc" placeholder="Ví dụ: 2026-10-20; để trống để xem tất cả" maxLength={10} autoCapitalize="none" value={value.day} onChangeText={day => onChange({...value,day})} style={input} />
    {!validDay(value.day) && <Text accessibilityRole="alert" style={{color:'#b91c1c'}}>Nhập ngày hợp lệ theo YYYY-MM-DD hoặc xóa để xem tất cả.</Text>}
    {statuses.length > 0 && <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:8,marginBottom:8}}>{statuses.map(status => <Button key={status} title={`${value.status === status ? '✓ ' : ''}${labels[status]}`} accessibilityLabel={`Lọc ${labels[status]}`} color={value.status === status ? '#047857' : '#64748b'} onPress={() => onChange({...value,status})} />)}</ScrollView>}
    <Button title="Xóa bộ lọc" onPress={() => onChange({search:'',day:'',status:'All'})} />
  </View>;
}

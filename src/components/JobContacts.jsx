import {Alert,Button,Linking,View} from 'react-native';
import {mapsUrl,phoneUrl} from '../domain';
export default function JobContacts({job}) {
  const phone = phoneUrl(job.customerPhone), map = mapsUrl(job.address);
  const open = async url => {try{await Linking.openURL(url);}catch{Alert.alert('Không thể mở','Thiết bị không có ứng dụng phù hợp. Bạn có thể dùng thông tin liên hệ/địa chỉ hiển thị trong ca.');}};
  return <View style={{flexDirection:'row',flexWrap:'wrap',gap:12,marginVertical:12}}>
    {phone && job.status !== 'Pending' ? <Button title="Gọi khách" onPress={() => open(phone)} /> : null}
    {map ? <Button title="Xem bản đồ" onPress={() => open(map)} /> : null}
  </View>;
}

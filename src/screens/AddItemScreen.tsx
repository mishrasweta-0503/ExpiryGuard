import React, {useState, useEffect} from 'react';
import { View, Text, StyleSheet, Button, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useStore } from '../store/useStore';
import { scheduleExpiryReminder } from '../store/notificationHelper';

type Props = NativeStackScreenProps<any, 'AddItem'>;

export default function AddItemScreen ({ navigation }: Props) {
    const [itemname, setItemName] = useState("")
    const [expirydate, setExpiryDate] = useState(new Date())
    const [show, setShow] = useState(Platform.OS === 'ios');
    const addItem = useStore((state) => state.addItem);

    //event object tells you if the user tapped ok/cancel
    //A selectedDate object (which contains the new JavaScript Date the user picked, or is undefined if they canceled).

    const onChange = (event:any,selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShow(false);
        }
        if(selectedDate){
            setExpiryDate(selectedDate)
        }
    }
    const handlePress = async () => {
        if(itemname === ''){
            Alert.alert("Item name can't be empty")
            setExpiryDate(new Date())
        }
        else{
            await addItem(itemname, expirydate);
            await scheduleExpiryReminder(itemname, expirydate);
            navigation.goBack();  
        }
    }
    return (
        <SafeAreaView style={styles.container}>
        <Text style={styles.text}>Add New Expiry Item</Text>
        <KeyboardAvoidingView>
            <TextInput
                placeholder="Paracetamol"
                value={itemname}
                onChangeText={setItemName}
                style={styles.input}
            />
            {Platform.OS == 'android' && (<TouchableOpacity onPress={() => setShow(true)}>
                <Text>Select Expiry Date</Text>
            </TouchableOpacity>)}
            {(show || Platform.OS === 'ios') && (
                <DateTimePicker
                    value={expirydate}
                    mode={"date"}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onChange}
                />
            )}

            <TouchableOpacity
                style={styles.button}
                activeOpacity={0.7}
                onPress={handlePress}
            >
                <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
        </KeyboardAvoidingView>
        <Button title="Cancel" onPress={() => navigation.goBack()}/>
        </SafeAreaView>
    );
    };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  input: {
    height: 50,                  
    borderColor: '#ccc',         
    borderWidth: 1,              
    borderRadius: 8,             
    paddingHorizontal: 16,       
    fontSize: 16,                
    color: '#333',               
    backgroundColor: '#f9f9f9',
    marginTop: 20 
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center'
  },
});

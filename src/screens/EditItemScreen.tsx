import React, { useState,useEffect, useRef,useReducer, useContext,useLayoutEffect } from 'react';
import { View, Text, StyleSheet, Button, TouchableOpacity, FlatList, Alert, TextInput, Platform } from 'react-native';
import { useStore } from '../store/useStore';
import DateTimePicker from '@react-native-community/datetimepicker';
import { UserContext } from '../../ThemeContext';


const initialState = { tracknumberofitems: 1 };

const reducer = (state = initialState, action:any) => {
    switch(action.type){
        case 'INCREMENT':
            return {...state, tracknumberofitems:state.tracknumberofitems+1};
        case 'DECREMENT':
            if(state.tracknumberofitems > 1){
                return {...state, tracknumberofitems:state.tracknumberofitems-1};
            }
            return state;
        default:
            return state;
    }

}

export default function EditItemScreen({route, navigation}:any){
    const {item} = route.params || {};
    const[name,setName] = useState(item?.name || '');
    const[expiryDate,setexpiryDate] = useState(item?.expiryDate ? new Date(item.expiryDate) : new Date());
    const inputRef = useRef<TextInput | null>(null); //initializing an empty reference hook that is waiting to hook onto a physical element
    const secondsRef = useRef(0); //to keep track of how many seconds have passed
    const timerIdRef = useRef<any>(null); //the clock which handles the ticking
    const inactivityCounterRef = useRef(0); //the data value, i.e., the seconds
    const items = useStore((state) => state.items);
    const updateItem = useStore((state) => state.updateItem);
    const [quantity, dispatch] = useReducer(reducer, initialState);
    const username = useContext(UserContext);

    const handleSave = () => {
        if(name === ''){
            Alert.alert('Name field cannot be empty');
            return;
        }
        const updatedQuantity = quantity.tracknumberofitems;
        updateItem(item?.id,name,expiryDate.toISOString(),updatedQuantity);
        console.log("Time spent editing:", secondsRef.current, "seconds");
        console.log("Saving quantity:", quantity);
        navigation.goBack();
    }

    const resetInactivityTimer = () => {
        inactivityCounterRef.current = 0;
    }

    useLayoutEffect(() => {
        navigation.setOptions({
            title: `Editing: ${item.name}`,
        });
    },[navigation, item.name])

    useEffect(() => {
        inputRef.current?.focus(); //attaching the focus(opening up the keyboardview) with textinput
        timerIdRef.current = setInterval(() => {
            inactivityCounterRef.current += 1;
            /*if(inactivityCounterRef.current >= 10){
                Alert.alert("Session Timeout", "You have been redirected due to inactivity.")
                navigation.goBack();
            }*/
        },1000);
        return () => {
            clearInterval(timerIdRef.current); 
          };
    },[])

    return (
        <View style={styles.container}>
            {/* Form Group for Name Input */}
            <View style={styles.inputGroup}>
                <Text style={styles.contexttext}>Welcome back, {username}!</Text>
                <Text style={styles.label}>Item Name</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter name..."
                    placeholderTextColor="#A0A0A2"
                    onChangeText={(text) => { setName(text); resetInactivityTimer(); }}
                    value={name}
                    ref={inputRef}
                />
            </View>

            {/*quantiy view*/}
            <View style={styles.quantityContainer}>
                <Text>Quantity:</Text>
                <TouchableOpacity style={styles.counterButton} onPress={() => {dispatch({ type: 'DECREMENT' })}}>
                    <Text style={styles.buttonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.numberText}>{quantity.tracknumberofitems}</Text>
                <TouchableOpacity style={styles.counterButton} onPress={() => {dispatch({ type: 'INCREMENT' })}}>
                    <Text style={styles.buttonText}>+</Text>
                </TouchableOpacity>

            </View>
    
            {/* Form Group for Expiration Picker */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Expiration Date</Text>
                <View style={styles.pickerContainer}>
                    <DateTimePicker
                        value={expiryDate}
                        mode={"date"}
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={(event, selectedDate) => {
                            if(selectedDate){
                                setexpiryDate(selectedDate)
                                resetInactivityTimer()
                            }
                        }}
                    />
                </View>
            </View>
    
            {/* Beautiful Primary Action Button */}
            <TouchableOpacity onPress={handleSave} style={styles.saveButton} activeOpacity={0.8}>
                <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA', // Soft off-white canvas reduces eye strain
        paddingHorizontal: 24,
        paddingTop: 24,
    },
    inputGroup: {
        marginBottom: 20, // Neat separation between different form inputs
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4A4A4A',
        marginBottom: 8,
        textTransform: 'uppercase', // Gives a clean UI administrative look
        letterSpacing: 0.5,
    },
    input: {
        backgroundColor: '#FFFFFF',
        height: 50,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0', // Soft grey border
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#1A202C',
        // Subtle crisp shadow for iOS & Android
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    pickerContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        padding: Platform.OS === 'ios' ? 0 : 6, // Keeps native Android look clean
        overflow: 'hidden',
    },
    saveButton: {
        backgroundColor: 'teal', // Ties into your app navigator color palette
        height: 52,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
        // Stronger shadow for the primary button to create depth
        shadowColor: 'teal',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 3,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        },
    buttonText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    counterButton: {
        width: 40,
        height: 40,
        borderRadius: 20,          // Makes it a perfect circle
        backgroundColor: '#e0e0e0', // Light gray background box
        alignItems: 'center',
        justifyContent: 'center',
    },
    numberText: {
        fontSize: 18,
        fontWeight: 'bold',
        minWidth: 30,
        textAlign: 'center',
    },
    contexttext: {
        textAlign: 'center',
        fontWeight: 'bold',
        color: 'blue',
        marginBottom: 10,
    }
});
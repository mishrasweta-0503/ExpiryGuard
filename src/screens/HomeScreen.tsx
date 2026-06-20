import React, { useState,useEffect,useMemo,useCallback,useContext } from 'react';
import { View, Text, StyleSheet, Button, TouchableOpacity, FlatList, Alert, TextInput } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack'; /** To give TypeScript visibility into what methods exist on the navigation object (like .navigate() or .goBack()), you need to import the type helper from the native stack library */
import { useStore } from '../store/useStore';
import * as Notifications from 'expo-notifications';
import { requestNotificationPermissions } from '../store/notificationHelper';
import { UserContext } from '../../ThemeContext';
import { useAuth } from './AuthContext';

type Props = NativeStackScreenProps<any, 'Home'>;

const expiryDateColor = (expiryDateString: string) => {
    const expiryDate = new Date(expiryDateString);
    const today = new Date();

    const differenceinms = expiryDate.getTime() - today.getTime();

    const daysLeft = differenceinms / (1000 * 60 * 60 * 24);

    if (daysLeft <= 7){
        return '#FF3B30';
    } else if(daysLeft > 7 && daysLeft < 180 ){
        return '#FFCC00'
    } else {
        return '#34C759'
    }

}

export default function HomeScreen ({ navigation }: Props){
    const [searchText, setSearchText] = useState("");
    const [sortBy, setSortBy] = useState("earliest");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const items = useStore((state) => state.items)
    const loadItems = useStore((state) => state.loadItems);
    const deleteItem = useStore((state) => state.deleteItem);

    const username = useContext(UserContext);

    const { isGuest } = useAuth();


    const sortedItems = useMemo(() => {
      if (isGuest) {
        return [];
      }
      const filteredItems = items.filter((item) => item.name.toLowerCase().includes(searchText.toLowerCase()));
      const sortedItems = [...filteredItems];
      sortedItems.sort((a,b) => {
        if(sortBy === 'earliest'){
          return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
        } else if (sortBy === 'farthest'){
          return new Date(b.expiryDate).getTime() - new Date(a.expiryDate).getTime()
        } else {
          return a.name.localeCompare(b.name)
        }
      })
      return sortedItems;
  }, [items,searchText,sortBy ]);

    const handleDelete = useCallback((item:any) => {
      Alert.alert(
        "Delete Item", 
        "Are you sure you want to delete this item?",  
        [
          { text: "Cancel", onPress: () => console.log("Cancel Pressed"), style: "cancel" },
          { text: "OK", onPress: () => deleteItem(item.id) },
        ],                       
        { cancelable: true },
           
      );
    },[deleteItem])

    const handleEdit = useCallback((item:any) => {
      navigation.navigate('EditItem', { item })
    },[navigation])

    const handleSort = () => {
      setIsDropdownOpen(!isDropdownOpen)
    }

    const renderItem = ({item}: { item: any }) => {
        const dateObject = new Date(item.expiryDate); //convert iso string to real object
        const formattedDate = dateObject.toLocaleDateString(); //format it to clean localized string.
        const itemColor = expiryDateColor(item.expiryDate);
        return(
            <View style={styles.itemRow}>
              <View>
                <Text>{item.name} (x{item.quantity || 1})</Text>
                <Text style={{ color: itemColor, fontWeight: 'bold' }}>{formattedDate}</Text>
              </View>
              <View style={styles.actionButtonsContainer}>
              <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteButton}>
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleEdit(item)} style={styles.editButton}>
                <Text style={{ color: 'white' , fontWeight: 'bold'}}>Edit</Text>
              </TouchableOpacity>
              </View>
          </View>
        )
    }

    useEffect(() => {

      loadItems();
      requestNotificationPermissions();

        // 2. Set up a listener to catch notifications while inside Expo Go
      const subscription = Notifications.addNotificationReceivedListener(notification => {
        console.log("🔔 ALARM TRIGGERED SUCCESSFULLY!");
        console.log("Message Content:", notification.request.content.body);
      });

        // 3. Clean up the listener when the component unmounts to prevent memory leaks
      return () => {
        subscription.remove();
      };
    },[])
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Dashboard / Items List</Text>
      <Text style={styles.contexttext}>{isGuest ? "Welcome, Guest User!" : `Welcome back, ${username}!`}</Text>
      <TextInput style={styles.searchText} placeholder='🔍 Search items...' value={searchText} onChangeText={setSearchText}></TextInput>
      <TouchableOpacity onPress={handleSort} style={styles.sortToggleButton}>
        <Text>Sort Options ⬇️ (Current: {sortBy})</Text>
      </TouchableOpacity>
      {isDropdownOpen && (
        <View style={styles.dropdownBox}>
          <TouchableOpacity onPress={() => {setSortBy('earliest'); setIsDropdownOpen(false);}}><Text style={styles.buttonText}>Earliest</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => {setSortBy('farthest'); setIsDropdownOpen(false);}}><Text style={styles.buttonText}>Farthest</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => {setSortBy('alphabetical'); setIsDropdownOpen(false);}}><Text style={styles.buttonText}>Alphabetical</Text></TouchableOpacity>
        </View>
      )}
      <FlatList
        data={sortedItems}
        renderItem={renderItem}
        keyExtractor={item => item.id} // Extracts a unique key for React's rendering
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {/* 1. DYNAMIC EMOJI ICON */}
            <Text style={styles.emptyIcon}>
              {items.length === 0 ? "🥫" : "🔍"}
            </Text>
    
            {/* 2. DYNAMIC TITLE */}
            <Text style={styles.emptyTitle}>
              {items.length === 0 ? "No Items Tracked" : "No Results Found"}
            </Text>
    
            {/* 3. DYNAMIC SUBTITLE */}
            <Text style={styles.emptySubtitle}>
              {items.length === 0
                ? "Your pantry tracker is empty. Tap the button below to add your first item!"
                : `We couldn't find any items matching "${searchText}". Try checking your spelling!`}
            </Text>
          </View>
        }
        ListFooterComponent={
            <View style={styles.button}>
                <Button title="Add an Item" color="#FFFFFF" onPress={() => navigation.navigate('AddItem')}/>
            </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingTop : 20,
    textAlign : 'center',
    paddingBottom: 15,
  },
  itemRow: {
    flexDirection : 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f4',
    alignItems: 'center'
  },
  button: {
    backgroundColor: '#007AFF', // iOS blue
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 6,
    elevation: 3, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    margin: 26,
  },
  buttonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    paddingVertical: 5,
    paddingHorizontal: 5,
    backgroundColor: 'red',
    borderRadius: 5,
    color: 'white',
  },
  searchText: {
    alignItems: 'center',
    textAlign : 'center',
    color: 'black',
    fontWeight: 'bold',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginHorizontal: 20,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
    },
  dropdownBox: {
    backgroundColor: '#ffffff',
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 8,
    marginHorizontal: 20,
    padding: 10,
    gap: 12, // Spaces out the options vertically
    marginBottom: 10,
    },
  sortToggleButton: {
    backgroundColor: '#ffffff', 
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 15,
    alignItems: 'center',  
    justifyContent: 'center',    
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderColor: 'black',
    },
    sortToggleButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',          
    },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 60
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  emptySubtitle: {
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
  editButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#007AFF', // Clean interactive iOS blue
    borderRadius: 5,
  },
  actionButtonsContainer: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    
  },
  contexttext: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: 'blue',
    marginBottom: 10,
  },
});

import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import AddItemScreen from './src/screens/AddItemScreen';
import EditItemScreen from './src/screens/EditItemScreen';
import {UserProvider} from './ThemeContext';
import {AuthProvider} from './src/screens/AuthContext';
import {useAuth} from './src/screens/AuthContext';
import LoginScreen from './src/screens/LoginScreen';

const Stack = createNativeStackNavigator();

// 1. Create a sub-component to handle the conditional switchboard logic
function NavigationLayout() {
  const { user, loading, logout, isGuest } = useAuth(); // Tune into the security center!

  // If Supabase is still checking for an old saved session, show nothing or a spinner
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Checking security credentials...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: 'teal' }, headerTintColor: '#fff' }}>
        {user || isGuest ? (
          // 🔓 THE APP STACK (Only visible when logged in)
          <>
            <Stack.Screen name="Home" component={HomeScreen} options={{title: 'My Expiry Guard'}}/>
            <Stack.Screen name="AddItem" component={AddItemScreen} options={{title: 'Track New Item'}} />
            <Stack.Screen name="EditItem" component={EditItemScreen} options={{title: 'Edit Item Details'}} />
          </>
        ) : (
          // 🔒 THE AUTH STACK (Only visible when logged out)
          // For now, we will create a placeholder screen right here to test it!
          <Stack.Screen name="Login" component={LoginScreen} options={{title: 'Welcome to Expiry Guard'}} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// 2. Your main App component stays clean and simply wraps the layout in providers
export default function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <NavigationLayout />
      </UserProvider>
    </AuthProvider>
  );
}

import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { AuthProvider } from './components/Context/AuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { SocketProvider } from './components/Context/SocketContext';
import Navigation from './components/Navigation/Navigation';
import { NotificationContext, NotificationProvider } from './components/Context/NotificationContext';

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <NotificationProvider>
          <SafeAreaProvider>
            <NavigationContainer style={{ flex: 1 }}>
              <Navigation />
            </NavigationContainer>
          </SafeAreaProvider>
        </NotificationProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
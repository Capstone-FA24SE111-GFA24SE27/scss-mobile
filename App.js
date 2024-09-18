import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { AuthProvider } from './components/Context/AuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import Navigation from './components/Navigation/Navigation';

export default function App() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <NavigationContainer style={{ flex: 1 }}>
          <Navigation />
        </NavigationContainer>
      </SafeAreaProvider>
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
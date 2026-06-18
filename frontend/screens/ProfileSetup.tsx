import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Image, ImageBackground, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function ProfileSetup() {
  const navigation = useNavigation() as any;
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    const trimmed = nickname.trim();
    if (!trimmed) {
      Alert.alert('닉네임을 입력해주세요');
      return;
    }

    setLoading(true);
    try {
      // 먼저 가입 시도
      const signupRes = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': '1' },
        body: JSON.stringify({ user_id: trimmed }),
      });
      const signupData = await signupRes.json();

      if (signupData.success) {
        await AsyncStorage.setItem('user', JSON.stringify(signupData.user));
        navigation.replace('OnboardingPreferences');
        return;
      }

      // 이미 있는 닉네임이면 로그인 시도
      if (signupData.message === '이미 사용 중인 닉네임이에요') {
        const loginRes = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': '1' },
          body: JSON.stringify({ user_id: trimmed }),
        });
        const loginData = await loginRes.json();

        if (loginData.success) {
          await AsyncStorage.setItem('user', JSON.stringify(loginData.user));
          navigation.replace('Main');
        } else {
          Alert.alert(loginData.message ?? '오류가 발생했어요');
        }
        return;
      }

      Alert.alert(signupData.message ?? '오류가 발생했어요');
    } catch (e) {
      Alert.alert('서버에 연결할 수 없어요');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../assets/images/background1.png')}
        style={styles.topBackground}
        resizeMode="cover"
      />

      <KeyboardAvoidingView
        style={styles.body}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Image
          source={require('../assets/images/login.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />

        <View style={styles.formSection}>
          <Text style={styles.title}>닉네임을 입력해주세요</Text>

          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              value={nickname}
              onChangeText={setNickname}
              placeholder="닉네임"
              placeholderTextColor="#8D8986"
              returnKeyType="done"
              onSubmitEditing={handleCreate}
              maxLength={20}
            />
          </View>
        </View>

        <View style={{ flex: 1 }} />

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.6 }]}
          onPress={handleCreate}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>
            {loading ? '처리 중...' : '프로필 생성하기'}
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FCFCFC' },
  topBackground: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 420,
  },
  body: { flex: 1, paddingHorizontal: 28 },
  logoImage: {
    width: 245, height: 245,
    alignSelf: 'center',
    marginTop: 16,
  },
  formSection: { gap: 24, marginTop: 48 },
  title: {
    fontFamily: 'NanumHuman-EB',
    fontSize: 24,
    color: '#181818',
    textAlign: 'center',
  },
  inputBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#F6F6F6',
    shadowColor: '#B9B9B9',
    shadowOpacity: 0.28,
    shadowRadius: 10.7,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 51,
    justifyContent: 'center',
  },
  input: {
    fontFamily: 'NanumHuman-Regular',
    fontSize: 16,
    color: '#181818',
  },
  button: {
    backgroundColor: '#FFA23E',
    borderRadius: 15,
    height: 61,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 109,
  },
  buttonText: {
    fontFamily: 'NanumHuman-EB',
    fontSize: 23,
    color: '#FFFFFF',
  },
});

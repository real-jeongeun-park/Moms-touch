import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000";

export default function RecipeUploadDone() {
  const navigation = useNavigation() as any;
  const route = useRoute() as any;
  const recipe = route.params?.recipe;

  useEffect(() => {
    const save = async () => {
      try {
        const userStr = await AsyncStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        await fetch(`${API_URL}/save-recipe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...recipe, user_id: user?.id ?? 1 }),
        });
      } catch (e) {
        console.log('저장 에러:', e);
      }
    };
    save();
  }, []);
  
  return (
    <SafeAreaView style={styles.container}>

      <ImageBackground
        source={require('../assets/images/background1.png')}
        style={styles.topBackground}
        resizeMode="cover"
      />

      <View style={styles.textSection}>
        <Text style={styles.title}>{'게시 완료!\n손맛이 담긴 레시피가 공유됐어요'}</Text>
        <Text style={styles.subtitle}>이제 레시피를 다른 분들도 볼 수 있어요</Text>
      </View>

      <View style={styles.imageSection}>
        <View style={styles.shadowEllipse} />
        <Image
          source={require('../assets/images/grandma_fighting.png')}
          style={styles.grandmaImage}
          resizeMode="contain"
        />
      </View>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.homeBtn} onPress={() => navigation.navigate('Main')}>
          <Text style={styles.homeBtnText}>홈으로</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FCFCFC' },

  topBackground: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: 362,
  },

  textSection: {
    marginTop: 100,
    paddingHorizontal: 28,
    alignItems: 'center',
    gap: 9,
  },
  title: {
    fontSize: 24, fontWeight: '800', color: '#181818',
    textAlign: 'center', lineHeight: 36,
  },
  subtitle: {
    fontSize: 16, color: '#8D8986', textAlign: 'center',
  },

  imageSection: {
    alignItems: 'center', justifyContent: 'center',
    marginTop: 70, height: 240,
  },
  shadowEllipse: {
    position: 'absolute', bottom: 16,
    width: 130, height: 21,
    backgroundColor: '#E8E8E8', borderRadius: 65,
  },
  grandmaImage: { width: width * 0.65, height: 220 },

  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 28, paddingBottom: 109,
  },
  homeBtn: {
    backgroundColor: '#FFA23E', borderRadius: 15,
    paddingVertical: 16, alignItems: 'center',
  },
  homeBtnText: { fontSize: 22, fontWeight: '700', color: '#FFFFFF' },
});

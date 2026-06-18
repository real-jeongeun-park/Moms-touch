import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect } from 'react';

const { width } = Dimensions.get('window');
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

export default function RecipeComplete() {
  const navigation = useNavigation() as any;
  const route = useRoute() as any;
  const recipe = route.params?.recipe ?? null;

  useEffect(() => {
    // 따라하기 완료 = 레시피 도전 → 도전자 수(use_count) +1
    const recordChallenge = async () => {
      try {
        if (!recipe?.id) return;
        await fetch(`${API_URL}/recipes/${recipe.id}/use`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': '1' },
        });
      } catch (e) {
        console.log('도전자 기록 에러:', e);
      }
    };
    recordChallenge();
  }, []);

  const title = recipe
    ? `${recipe.region}의 손맛이 담긴\n${recipe.title}가 완성되었어요!`
    : '손맛 요리가 완성되었어요!';

  return (
    <SafeAreaView style={styles.container}>

      <ImageBackground
        source={require('../assets/images/background1.png')}
        style={styles.topBackground}
        resizeMode="cover"
      />

      <View style={styles.textSection}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>따뜻할 때 맛있게 즐겨보세요.</Text>
      </View>

      <View style={styles.imageSection}>
        <View style={styles.shadowEllipse} />
        <Image
          source={require('../assets/images/grandma_finish.png')}
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

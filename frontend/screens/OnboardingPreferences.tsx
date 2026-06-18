import { useState } from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dimensions } from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

type Step = 'region' | 'food' | 'level';

const screenWidth = Dimensions.get('window').width;
const REGION_STEP = 0;
const FOOD_STEP = 1;
const LEVEL_STEP = 2;
const MAP_BASE_WIDTH = 365;
const MAP_BASE_HEIGHT = 434;
const MAP_WIDTH = screenWidth - 40;
const MAP_HEIGHT = (MAP_WIDTH * MAP_BASE_HEIGHT) / MAP_BASE_WIDTH;
const MAP_SCALE = MAP_WIDTH / MAP_BASE_WIDTH;

const REGIONS = [
  { name: '인천광역시', left: 70,   top: 130 },
  { name: '경기도',     left: 112, top: 78  },
  { name: '강원도',     left: 182, top: 82  },
  { name: '서울특별시', left: 105,  top: 105 },
  { name: '충청북도',   left: 142, top: 160 },
  { name: '경상북도',   left: 211, top: 190 },
  { name: '충청남도',   left: 95,  top: 185 },
  { name: '전라북도',   left: 105, top: 242 },
  { name: '경상남도',   left: 191, top: 267 },
  { name: '전라도',     left: 100, top: 295 },
  { name: '제주도',     left: 100,  top: 375 },
  { name: '울릉도',     left: 314, top: 150 },
  { name: '독도',       left: 320, top: 238 },
];

const FOODS = [
  { label: '찌개류', image: require('../assets/images/prefer1.png') },
  { label: '국, 탕류', image: require('../assets/images/prefer2.png') },
  { label: '구이류', image: require('../assets/images/prefer3.png') },
  { label: '볶음류', image: require('../assets/images/prefer4.png') },
  { label: '면류', image: require('../assets/images/prefer5.png') },
  { label: '밥류', image: require('../assets/images/prefer6.png') },
  { label: '디저트류', image: require('../assets/images/prefer7.png') },
  { label: '해산물', image: require('../assets/images/prefer8.png') },
  { label: '육류', image: require('../assets/images/prefer9.png') },
];

const LEVELS: { label: string; value: number; image: ImageSourcePropType }[] = [
  { label: '입문', value: 1, image: require('../assets/images/star1.png') },
  { label: '초급', value: 2, image: require('../assets/images/star2.png') },
  { label: '중급', value: 3, image: require('../assets/images/star3.png') },
  { label: '고급', value: 4, image: require('../assets/images/star4.png') },
  { label: '전문가', value: 5, image: require('../assets/images/star5.png') },
];

const steps: Step[] = ['region', 'food', 'level'];

const scaleMapPosition = (value: number) => value * MAP_SCALE;

export default function OnboardingPreferences() {
  const navigation = useNavigation() as any;
  const [stepIndex, setStepIndex] = useState(REGION_STEP);
  const [region, setRegion] = useState<string | null>(null);
  const [food, setFood] = useState<string | null>(null);
  const [level, setLevel] = useState<number | null>(null);

  const step = steps[stepIndex];
  const canContinue =
    (step === 'region' && region) ||
    (step === 'food' && food) ||
    (step === 'level' && level);

  const goBack = () => {
    if (stepIndex === REGION_STEP) {
      navigation.goBack();
      return;
    }

    setStepIndex(current => current - 1);
  };

  const goNext = async () => {
    if (!canContinue) return;

    if (stepIndex === LEVEL_STEP) {
      try {
        const userStr = await AsyncStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        if (user && region && food && level) {
          await fetch(`${API_URL}/preferences`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': '1' },
            body: JSON.stringify({
              user_id: user.id,
              preferred_region: region,
              preferred_food_type: food,
              preferred_difficulty: level,
            }),
          });
        }
      } catch (e) {
        console.log('선호도 저장 에러:', e);
      }
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
      return;
    }

    setStepIndex(current => current + 1);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={goBack} style={styles.backBtn} activeOpacity={0.7}>
        <Image source={require('../assets/images/back.png')} style={styles.backIcon} />
      </TouchableOpacity>

      <View style={styles.titleSection}>
        <Text style={styles.title}>
          {step === 'region' && '선호하시는 지역'}
          {step === 'food' && '선호하시는 음식'}
          {step === 'level' && '선호하시는 요리의 난이도'}
        </Text>
      </View>

      <View style={styles.content}>
        {step === 'region' && (
          <View style={styles.mapContainer}>
            <Image
              source={require('../assets/images/map_noword.png')}
              style={styles.mapImage}
              resizeMode="contain"
            />
            {REGIONS.map(item => (
              <TouchableOpacity
                key={item.name}
                style={[
                  styles.badge,
                  { left: scaleMapPosition(item.left), top: scaleMapPosition(item.top) },
                  region === item.name && styles.badgeSelected,
                ]}
                onPress={() => setRegion(item.name)}
                activeOpacity={0.75}
              >
                <Text style={[styles.badgeText, region === item.name && styles.badgeTextSelected]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {step === 'food' && (
          <View style={styles.foodGrid}>
            {FOODS.map(item => (
              <TouchableOpacity
                key={item.label}
                style={[
                  styles.foodCard,
                  food === item.label && styles.foodCardSelected,
                ]}
                onPress={() => setFood(item.label)}
                activeOpacity={0.85}
              >
                <Image
                  source={item.image}
                  style={styles.foodImage}
                  resizeMode="contain"
                />

                <Text
                  style={[
                    styles.foodText,
                    food === item.label && styles.foodTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {step === 'level' && (
          <View style={styles.levelList}>
            {LEVELS.map(item => (
              <TouchableOpacity
                key={item.value}
                style={[styles.levelCard, level === item.value && styles.levelCardSelected]}
                onPress={() => setLevel(item.value)}
                activeOpacity={0.85}
              >
                <Image source={item.image} style={styles.starImage} resizeMode="contain" />
                <Text style={[styles.levelText, level === item.value && styles.levelTextSelected]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={styles.bottomBar}>
        {stepIndex > REGION_STEP ? (
          <TouchableOpacity style={styles.prevBtn} onPress={goBack} activeOpacity={0.85}>
            <Text style={styles.prevBtnText}>이전</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.prevBtn}>
            <Text style={styles.prevBtnText}>이전</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.nextBtn, !canContinue && styles.nextBtnDisabled]}
          onPress={goNext}
          activeOpacity={0.85}
          disabled={!canContinue}
        >
          <Text style={styles.nextBtnText}>{stepIndex === LEVEL_STEP ? '시작하기' : '다음'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FCFCFC' },
  backBtn: {
    marginTop: 17,
    marginLeft: 28,
    padding: 4,
    width: 28,
    height: 28,
    justifyContent: 'center',
  },
  backIcon: { width: 20, height: 20, resizeMode: 'contain' },
  titleSection: {
    marginTop: 47,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'NanumHuman-EB',
    fontSize: 24,
    color: '#181818',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  mapContainer: {
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    marginTop: 4,
  },
  mapImage: {
    position: 'absolute',
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
  },
  badge: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 5,
    paddingVertical: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
    transform: [{ scale: 0.82 }],
  },
  badgeSelected: {
    backgroundColor: '#FFD5DB',
    borderWidth: 1,
    borderColor: '#FF9FAD',
  },
  badgeText: {
    fontFamily: 'NanumHuman-Bold',
    fontSize: 10,
    color: '#3D3B3A',
  },
  badgeTextSelected: {
    color: '#FF6F85',
  },
  foodGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  foodCard: {
    width: '30.8%',
    aspectRatio: 0.86,
    backgroundColor: '#F2F2F2',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 20,
  },
  foodImage: {
  width: 60,
  height: 60,
  },
  foodText: {
    fontFamily: 'NanumHuman-Bold',
    fontSize: 15,
    color: '#42403D',
    textAlign: 'center',
  },
  foodCardSelected: {
    backgroundColor: '#FFE8BD',
    borderWidth: 2,
    borderColor: '#FFA23E',
  },
  foodTextSelected: {
    color: '#FF9019',
  },
  levelList: {
    width: '100%',
    gap: 8,
  },
  levelCard: {
    height: 62,
    backgroundColor: '#F2F2F2',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  levelCardSelected: {
    height: 64,
    backgroundColor: '#FFF2E4',
    borderWidth: 2,
    borderColor: '#FFA23E',
  },
  starImage: {
    width: 96,
    height: 24,
  },
  levelText: {
    fontFamily: 'NanumHuman-Bold',
    fontSize: 13,
    color: '#42403D',
    textAlign: 'center',
  },
  levelTextSelected: {
    color: '#FF9019',
  },
  bottomBar: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 28,
    paddingBottom: 52,
  },
  prevBtn: {
    flex: 1,
    height: 51,
    borderRadius: 12,
    backgroundColor: '#E5E5E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  prevBtnText: {
    fontFamily: 'NanumHuman-Bold',
    fontSize: 20,
    color: '#8D8986',
  },
  nextBtn: {
    flex: 1,
    height: 51,
    borderRadius: 12,
    backgroundColor: '#FFA23E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtnDisabled: {
    backgroundColor: '#FFC98D',
  },
  nextBtnText: {
    fontFamily: 'NanumHuman-Bold',
    fontSize: 20,
    color: '#FFFFFF',
  },
});

import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000";

const ngrokHeader = { 'ngrok-skip-browser-warning': '1' };

const starImages: Record<number, any> = {
  1: require('../assets/images/star1.png'),
  2: require('../assets/images/star2.png'),
  3: require('../assets/images/star3.png'),
  4: require('../assets/images/star4.png'),
  5: require('../assets/images/star5.png'),
};

export default function RecipeDetail() {
  const navigation = useNavigation() as any;
  const route = useRoute() as any;
  const { recipe_id } = route.params;

  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const userStr = await AsyncStorage.getItem('user');
        const u = userStr ? JSON.parse(userStr) : null;
        setUser(u);

        const res = await fetch(`${API_URL}/recipes/${recipe_id}`, { headers: ngrokHeader });
        if (!res.ok) throw new Error('fetch 실패');
        const data = await res.json();
        // ingredients가 dict이면 배열로 변환 (화면 표시용)
        if (data.ingredients && !Array.isArray(data.ingredients)) {
          data.ingredients = Object.entries(data.ingredients).map(([name, amount]) => ({ name, amount }));
        }
        setRecipe(data);

        // 현재 유저가 이미 좋아요를 눌렀는지 확인
        if (u) {
          const fRes = await fetch(`${API_URL}/users/${u.id}/recipes/followed`, { headers: ngrokHeader });
          const fData = await fRes.json();
          setLiked((fData.recipes ?? []).some((r: any) => r.id === recipe_id));
        }
      } catch (e) {
        console.error('레시피 불러오기 실패:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [recipe_id]);

  const toggleLike = async () => {
    if (!user) return;
    const next = !liked;
    setLiked(next); // 낙관적 업데이트
    try {
      await fetch(`${API_URL}/recipe-follows`, {
        method: next ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json', ...ngrokHeader },
        body: JSON.stringify({ user_id: user.id, recipe_id }),
      });
    } catch (e) {
      setLiked(!next); // 실패 시 롤백
      console.log('좋아요 토글 에러:', e);
    }
  };

  if (loading) return (
    <SafeAreaView style={styles.container}>
      <ActivityIndicator size="large" color="#FFA23E" style={{ marginTop: 100 }} />
    </SafeAreaView>
  );

  if (!recipe) return (
    <SafeAreaView style={styles.container}>
      <Text style={{ textAlign: 'center', marginTop: 100, color: '#827E7B' }}>레시피를 불러올 수 없어요</Text>
    </SafeAreaView>
  );

  const formatTime = (min?: number) => {
    if (min == null) return '00:00';
    const m = Math.floor(min).toString().padStart(2, '0');
    const s = '00';
    return `${m}:${s}`;
  };

  const stepsWithAccTime = recipe.steps.reduce((acc: any[], step: any, i: number) => {
    const prev = i === 0 ? 0 : acc[i - 1].accTime + (acc[i - 1].timestamp ?? 0);
    return [...acc, { ...step, accTime: prev }];
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 180 }}>

        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
        </View>

        {/* 제목 영역 */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{recipe.title}</Text>
          <Text style={styles.subtitle}>{recipe.description}</Text>

          {/* 작성자 + 좋아요 */}
          <View style={styles.authorRow}>
            <TouchableOpacity
              style={styles.authorLeft}
              onPress={() => navigation.navigate('UserProfile', { name: recipe.author, region: recipe.region })}
              activeOpacity={0.7}
            >
              <Image source={require('../assets/images/profile.png')} style={styles.authorAvatar} />
              <Text style={styles.authorName}>{recipe.author ?? '익명'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleLike} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Image
                source={liked
                  ? require('../assets/images/full_heart.png')
                  : require('../assets/images/empty_heart.png')}
                style={styles.heartIcon}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* 작성자-정보 사이 구분선 */}
        <View style={styles.divider} />

        {/* 정보 */}
        <View style={styles.infoSection}>
          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>지역</Text>
              <Text style={styles.infoValue}>{recipe.region ?? '-'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>소요 시간</Text>
              <Text style={styles.infoValue}>{recipe.duration ? `${recipe.duration}분` : '-'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>난이도</Text>
              {recipe.difficulty
                ? <Image source={starImages[recipe.difficulty]} style={styles.starImage} />
                : <Text style={styles.infoValue}>-</Text>
              }
            </View>

            {/* 재료 */}
            {recipe.ingredients?.length > 0 && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>재료</Text>
                <View style={styles.ingredientRow}>
                  {recipe.ingredients.map((ing: any) => (
                    <View key={ing.name} style={styles.ingredientItem}>
                      <Text style={styles.ingName}>{ing.name}</Text>
                      <Text style={styles.ingAmount}>{ing.amount}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>

        {/* 구분선 */}
        <View style={styles.divider} />

        {/* 레시피 단계 */}
        <View style={styles.stepsSection}>
          <Text style={styles.sectionTitle}>레시피</Text>
          <View>
            {stepsWithAccTime.map((step: any, i: number) => (
              <View key={step.id} style={styles.stepRow}>
                <View style={styles.stepLeft}>
                  <View style={styles.stepBadge}>
                    <Text style={styles.stepBadgeText}>{step.step_order}</Text>
                  </View>
                  {/* 마지막 단계 아래로는 연결선을 그리지 않음 */}
                  {i < stepsWithAccTime.length - 1 && <View style={styles.dashedLine} />}
                </View>
                <View style={styles.stepRight}>
                  <Text style={styles.stepTime}>{formatTime(step.accTime)}</Text>
                  <View style={styles.stepCard}>
                    <Text style={styles.stepTitle}>{step.title}</Text>
                    <Text style={styles.stepDesc}>{step.description}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>

      {/* 하단 버튼 */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.startBtn}
          onPress={() => navigation.navigate('RecipeStart', { recipe })}
        >
          <Text style={styles.startBtnText}>레시피 따라하기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FCFCFC' },

  // 헤더
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  backBtn: { padding: 4 },
  backIcon: { fontSize: 28, color: '#827E7B' },
  searchBtn: { padding: 4 },
  searchIcon: { width: 22, height: 22, resizeMode: 'contain' },

  // 제목
  titleSection: { paddingHorizontal: 28, paddingTop: 8, paddingBottom: 24 },
  title: { fontSize: 24, fontWeight: '800', color: '#181818', marginBottom: 6 },
  subtitle: { fontSize: 15, color: '#8D8986', marginBottom: 14 },

  // 작성자 + 좋아요 (Figma 스펙)
  authorRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  infoSection: { paddingHorizontal: 28, paddingTop: 20 },
  authorLeft: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  authorAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#FFEAB4' },
  authorName: { fontSize: 16, color: '#595653' },
  heartIcon: { width: 28, height: 28, resizeMode: 'contain' },

  // 정보
  infoBox: { gap: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  infoLabel: { width: 60, fontSize: 12, fontWeight: '700', color: '#181818' },
  infoValue: { fontSize: 12, color: '#181818' },
  starImage: { width: 80, height: 16, resizeMode: 'contain', marginLeft: -20 },

  // 재료
  ingredientRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, flex: 1 },
  ingredientItem: { alignItems: 'center', gap: 2 },
  ingName: { fontSize: 12, color: '#181818', textAlign: 'center' },
  ingAmount: { fontSize: 11, color: '#42403D', textAlign: 'center' },

  // 구분선
  divider: { height: 12, backgroundColor: '#F6F4F4', marginVertical: 8 },

  // 레시피 단계
  stepsSection: { paddingHorizontal: 28, paddingTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#181818', marginBottom: 20 },
  dashedLine: { position: 'absolute', left: 9, top: 20, bottom: -12, width: 2, borderStyle: 'dashed', borderLeftWidth: 2, borderColor: '#FFD8AF' },

  stepRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  stepLeft: { width: 20, alignItems: 'center', zIndex: 1 },
  stepBadge: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#FFCA45', justifyContent: 'center', alignItems: 'center' },
  stepBadgeText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },

  stepRight: { flex: 1, gap: 4 },
  stepTime: { fontSize: 13, color: '#827E7B' },
  stepCard: { backgroundColor: '#FFFFFF', borderRadius: 4, borderWidth: 1, borderColor: '#E6E6E6', padding: 12, shadowColor: '#3D3B3A', shadowOpacity: 0.09, shadowRadius: 7.3, elevation: 2 },
  stepTitle: { fontSize: 14, fontWeight: '700', color: '#181818', marginBottom: 4 },
  stepDesc: { fontSize: 11, color: '#827E7B', lineHeight: 16 },

  // 하단 버튼
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 28, paddingBottom: 32, paddingTop: 12, backgroundColor: '#FCFCFC' },
  startBtn: { backgroundColor: '#FFA23E', borderRadius: 15, paddingVertical: 16, alignItems: 'center' },
  startBtnText: { fontSize: 22, fontWeight: '700', color: '#FFFFFF' },
});